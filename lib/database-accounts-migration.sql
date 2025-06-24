-- ====================================================================
-- DIMDIM - MIGRAÇÃO PARA FUNCIONALIDADE DE CONTAS
-- Script SQL para adicionar suporte a contas financeiras
-- ====================================================================

-- ====================================================================
-- CRIAÇÃO DA TABELA DE CONTAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.accounts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(100) NOT NULL,
    type VARCHAR(20) NOT NULL CHECK (type IN ('checking', 'credit_card')),
    initial_balance DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT accounts_name_not_empty CHECK (trim(name) != ''),
    CONSTRAINT accounts_one_default_per_user UNIQUE (user_id, is_default) DEFERRABLE INITIALLY DEFERRED
);

-- ====================================================================
-- ADICIONAR COLUNA ACCOUNT_ID À TABELA TRANSACTIONS
-- ====================================================================
-- Verificar se a coluna account_id já existe antes de adicionar
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'transactions' 
        AND column_name = 'account_id'
        AND table_schema = 'public'
    ) THEN
        ALTER TABLE public.transactions 
        ADD COLUMN account_id UUID REFERENCES public.accounts(id) ON DELETE RESTRICT;
    END IF;
END $$;

-- ====================================================================
-- CRIAR CATEGORIA ESPECIAL PARA TRANSFERÊNCIAS
-- ====================================================================
INSERT INTO public.categories (id, user_id, name, color, icon, is_default, created_at, updated_at)
VALUES (
    gen_random_uuid(),
    NULL,
    'Transferência entre Contas',
    '#9C27B0',
    'swap_horiz',
    true,
    now(),
    now()
) ON CONFLICT DO NOTHING;

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================
-- Índices para accounts
CREATE INDEX IF NOT EXISTS accounts_user_id_idx ON public.accounts(user_id);
CREATE INDEX IF NOT EXISTS accounts_type_idx ON public.accounts(type);
CREATE INDEX IF NOT EXISTS accounts_is_default_idx ON public.accounts(is_default);
CREATE INDEX IF NOT EXISTS accounts_user_default_idx ON public.accounts(user_id, is_default) WHERE is_default = true;

-- Índice adicional para transactions
CREATE INDEX IF NOT EXISTS transactions_account_id_idx ON public.transactions(account_id);
CREATE INDEX IF NOT EXISTS transactions_user_account_idx ON public.transactions(user_id, account_id);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS) PARA ACCOUNTS
-- ====================================================================
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver suas próprias contas
CREATE POLICY "Users can view own accounts" ON public.accounts
    FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: usuários só podem inserir suas próprias contas
CREATE POLICY "Users can insert own accounts" ON public.accounts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política RLS: usuários só podem atualizar suas próprias contas
CREATE POLICY "Users can update own accounts" ON public.accounts
    FOR UPDATE USING (auth.uid() = user_id);

-- Política RLS: usuários só podem deletar suas próprias contas
CREATE POLICY "Users can delete own accounts" ON public.accounts
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- TRIGGERS PARA ACCOUNTS
-- ====================================================================
-- Trigger para atualizar updated_at na tabela accounts
CREATE TRIGGER handle_accounts_updated_at 
    BEFORE UPDATE ON public.accounts
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Função para garantir apenas uma conta padrão por usuário
CREATE OR REPLACE FUNCTION public.ensure_single_default_account()
RETURNS TRIGGER AS $$
BEGIN
    -- Se está marcando como padrão, desmarcar outras contas do mesmo usuário
    IF NEW.is_default = true THEN
        UPDATE public.accounts 
        SET is_default = false 
        WHERE user_id = NEW.user_id 
        AND id != NEW.id 
        AND is_default = true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para garantir conta padrão única
CREATE TRIGGER ensure_single_default_account_trigger
    BEFORE INSERT OR UPDATE ON public.accounts
    FOR EACH ROW EXECUTE PROCEDURE public.ensure_single_default_account();

-- ====================================================================
-- VIEWS PARA FACILITAR CONSULTAS
-- ====================================================================

-- View: transações com conta e categoria
CREATE OR REPLACE VIEW public.transactions_with_account_and_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    a.name as account_name,
    a.type as account_type
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id
LEFT JOIN public.accounts a ON t.account_id = a.id;

-- View: saldos das contas
CREATE OR REPLACE VIEW public.account_balances AS
SELECT 
    a.id,
    a.user_id,
    a.name,
    a.type,
    a.initial_balance,
    a.is_default,
    a.created_at,
    a.updated_at,
    COALESCE(
        a.initial_balance + 
        COALESCE(income.total, 0) - 
        COALESCE(expenses.total, 0), 
        a.initial_balance
    ) as current_balance,
    COALESCE(income.total, 0) as total_income,
    COALESCE(expenses.total, 0) as total_expenses,
    COALESCE(income.count, 0) + COALESCE(expenses.count, 0) as transaction_count
FROM public.accounts a
LEFT JOIN (
    SELECT 
        account_id,
        SUM(amount) as total,
        COUNT(*) as count
    FROM public.transactions 
    WHERE type = 'income'
    GROUP BY account_id
) income ON a.id = income.account_id
LEFT JOIN (
    SELECT 
        account_id,
        SUM(amount) as total,
        COUNT(*) as count
    FROM public.transactions 
    WHERE type = 'expense'
    GROUP BY account_id
) expenses ON a.id = expenses.account_id;

-- ====================================================================
-- FUNÇÃO PARA CRIAR TRANSFERÊNCIA ENTRE CONTAS
-- ====================================================================
CREATE OR REPLACE FUNCTION public.create_account_transfer(
    p_user_id UUID,
    p_from_account_id UUID,
    p_to_account_id UUID,
    p_amount DECIMAL(10,2),
    p_description TEXT,
    p_date DATE
)
RETURNS TABLE(
    from_transaction_id UUID,
    to_transaction_id UUID
) AS $$
DECLARE
    v_transfer_category_id UUID;
    v_from_transaction_id UUID;
    v_to_transaction_id UUID;
BEGIN
    -- Validações
    IF p_amount <= 0 THEN
        RAISE EXCEPTION 'O valor da transferência deve ser positivo';
    END IF;
    
    IF p_from_account_id = p_to_account_id THEN
        RAISE EXCEPTION 'Conta de origem e destino devem ser diferentes';
    END IF;
    
    -- Buscar categoria de transferência
    SELECT id INTO v_transfer_category_id
    FROM public.categories
    WHERE name = 'Transferência entre Contas' AND is_default = true
    LIMIT 1;
    
    IF v_transfer_category_id IS NULL THEN
        RAISE EXCEPTION 'Categoria de transferência não encontrada';
    END IF;
    
    -- Criar transação de saída (despesa)
    INSERT INTO public.transactions (
        user_id, account_id, category_id, amount, description, type, date
    ) VALUES (
        p_user_id, p_from_account_id, v_transfer_category_id, p_amount, 
        p_description || ' (Transferência para ' || (
            SELECT name FROM public.accounts WHERE id = p_to_account_id
        ) || ')', 
        'expense', p_date
    ) RETURNING id INTO v_from_transaction_id;
    
    -- Criar transação de entrada (receita)
    INSERT INTO public.transactions (
        user_id, account_id, category_id, amount, description, type, date
    ) VALUES (
        p_user_id, p_to_account_id, v_transfer_category_id, p_amount, 
        p_description || ' (Transferência de ' || (
            SELECT name FROM public.accounts WHERE id = p_from_account_id
        ) || ')', 
        'income', p_date
    ) RETURNING id INTO v_to_transaction_id;
    
    RETURN QUERY SELECT v_from_transaction_id, v_to_transaction_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================================
COMMENT ON TABLE public.accounts IS 'Contas financeiras dos usuários (corrente, cartão de crédito)';
COMMENT ON COLUMN public.accounts.id IS 'Identificador único da conta';
COMMENT ON COLUMN public.accounts.user_id IS 'ID do usuário proprietário da conta';
COMMENT ON COLUMN public.accounts.name IS 'Nome descritivo da conta';
COMMENT ON COLUMN public.accounts.type IS 'Tipo da conta: checking (corrente) ou credit_card (cartão de crédito)';
COMMENT ON COLUMN public.accounts.initial_balance IS 'Saldo inicial da conta';
COMMENT ON COLUMN public.accounts.is_default IS 'Indica se é a conta padrão para novas transações';
COMMENT ON COLUMN public.accounts.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.accounts.updated_at IS 'Data/hora da última atualização do registro';

COMMENT ON COLUMN public.transactions.account_id IS 'Conta associada à transação';

COMMENT ON VIEW public.transactions_with_account_and_category IS 'View com transações incluindo dados de conta e categoria';
COMMENT ON VIEW public.account_balances IS 'View com saldos atuais calculados das contas';

COMMENT ON FUNCTION public.create_account_transfer IS 'Função para criar transferência entre contas (cria duas transações)';

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================
DO $$
BEGIN
    -- Verificar se as tabelas foram criadas
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'accounts') THEN
        RAISE EXCEPTION 'ERRO: Tabela accounts não foi criada';
    END IF;
    
    -- Verificar se a coluna foi adicionada
    IF NOT EXISTS (
        SELECT FROM information_schema.columns 
        WHERE table_name = 'transactions' AND column_name = 'account_id'
    ) THEN
        RAISE EXCEPTION 'ERRO: Coluna account_id não foi adicionada à tabela transactions';
    END IF;
    
    RAISE NOTICE 'SUCCESS: Migração para contas executada com sucesso!';
END $$; 