-- ====================================================================
-- DIMDIM - SCRIPT COMPLETO DE SETUP DA DATABASE POSTGRESQL
-- Versão Unificada - Script único para configuração completa
-- Criado em: 2025
-- ====================================================================

-- ====================================================================
-- VERIFICAÇÕES INICIAIS E CONFIGURAÇÕES
-- ====================================================================

-- Verificar se as extensões necessárias estão disponíveis
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Verificar se o schema auth existe (para Supabase)
DO $$
BEGIN
    IF NOT EXISTS (SELECT FROM information_schema.schemata WHERE schema_name = 'auth') THEN
        RAISE NOTICE 'Schema auth não encontrado. Certifique-se de que está executando no Supabase.';
    END IF;
END $$;

-- ====================================================================
-- FUNÇÕES AUXILIARES
-- ====================================================================

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ====================================================================
-- CRIAÇÃO DAS TABELAS PRINCIPAIS
-- ====================================================================

-- Tabela de Categorias
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#1976D2',
    icon VARCHAR(50) DEFAULT 'category',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT categories_color_check CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_name_not_empty CHECK (trim(name) != '')
);

-- Tabela de Transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints
    CONSTRAINT transactions_amount_not_zero CHECK (amount != 0),
    CONSTRAINT transactions_description_not_empty CHECK (trim(description) != '')
);

-- Tabela de Orçamentos
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020 AND year <= 2100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    
    -- Constraints únicos
    CONSTRAINT budgets_unique_category_month UNIQUE (user_id, category_id, month, year)
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================

-- Índices para categories
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS categories_is_default_idx ON public.categories(is_default);
CREATE INDEX IF NOT EXISTS categories_name_idx ON public.categories(name);

-- Índices para transactions
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON public.transactions(user_id, date);
CREATE INDEX IF NOT EXISTS transactions_user_type_idx ON public.transactions(user_id, type);
CREATE INDEX IF NOT EXISTS transactions_date_desc_idx ON public.transactions(date DESC);

-- Índices para budgets
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS budgets_month_year_idx ON public.budgets(month, year);
CREATE INDEX IF NOT EXISTS budgets_user_month_year_idx ON public.budgets(user_id, month, year);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================

-- Habilitar RLS para todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
DROP POLICY IF EXISTS "Users can view own categories and defaults" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

CREATE POLICY "Users can view own categories and defaults" ON public.categories
    FOR SELECT USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Políticas RLS para transactions
DROP POLICY IF EXISTS "Users can view own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can insert own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can update own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can delete own transactions" ON public.transactions;

CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para budgets
DROP POLICY IF EXISTS "Users can view own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can insert own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can update own budgets" ON public.budgets;
DROP POLICY IF EXISTS "Users can delete own budgets" ON public.budgets;

CREATE POLICY "Users can view own budgets" ON public.budgets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own budgets" ON public.budgets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own budgets" ON public.budgets
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own budgets" ON public.budgets
    FOR DELETE USING (auth.uid() = user_id);

-- ====================================================================
-- TRIGGERS PARA UPDATED_AT
-- ====================================================================

-- Remover triggers existentes se houver
DROP TRIGGER IF EXISTS handle_updated_at_categories ON public.categories;
DROP TRIGGER IF EXISTS handle_updated_at_transactions ON public.transactions;
DROP TRIGGER IF EXISTS handle_updated_at_budgets ON public.budgets;

-- Criar triggers para todas as tabelas
CREATE TRIGGER handle_updated_at_categories 
    BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_transactions 
    BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_budgets 
    BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ====================================================================
-- DADOS INICIAIS - CATEGORIAS PADRÃO
-- ====================================================================

INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
    (NULL, 'Alimentação', '#FF9800', 'restaurant', true),
    (NULL, 'Transporte', '#2196F3', 'directions_car', true),
    (NULL, 'Moradia', '#4CAF50', 'home', true),
    (NULL, 'Saúde', '#F44336', 'local_hospital', true),
    (NULL, 'Lazer', '#9C27B0', 'sports_esports', true),
    (NULL, 'Educação', '#3F51B5', 'school', true),
    (NULL, 'Compras', '#E91E63', 'shopping_cart', true),
    (NULL, 'Serviços', '#607D8B', 'build', true),
    (NULL, 'Investimentos', '#795548', 'trending_up', true),
    (NULL, 'Salário', '#4CAF50', 'work', true),
    (NULL, 'Outros', '#9E9E9E', 'more_horiz', true)
ON CONFLICT DO NOTHING;

-- ====================================================================
-- VIEWS PARA CONSULTAS OTIMIZADAS
-- ====================================================================

-- View para transações com categoria
CREATE OR REPLACE VIEW public.transactions_with_category AS
SELECT 
    t.*,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    c.is_default as category_is_default
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id;

-- View para estatísticas de orçamento
CREATE OR REPLACE VIEW public.budget_statistics AS
SELECT 
    b.*,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    COALESCE(spent.total, 0) as spent_amount,
    (b.amount - COALESCE(spent.total, 0)) as remaining_amount,
    CASE 
        WHEN b.amount > 0 THEN ROUND((COALESCE(spent.total, 0) / b.amount * 100)::NUMERIC, 2)
        ELSE 0 
    END as percentage_used,
    CASE 
        WHEN COALESCE(spent.total, 0) > b.amount THEN true
        ELSE false
    END as is_over_budget
FROM public.budgets b
LEFT JOIN public.categories c ON b.category_id = c.id
LEFT JOIN (
    SELECT 
        category_id,
        EXTRACT(MONTH FROM date) as month,
        EXTRACT(YEAR FROM date) as year,
        user_id,
        SUM(amount) as total
    FROM public.transactions 
    WHERE type = 'expense'
    GROUP BY category_id, EXTRACT(MONTH FROM date), EXTRACT(YEAR FROM date), user_id
) spent ON b.category_id = spent.category_id 
    AND b.month = spent.month 
    AND b.year = spent.year
    AND b.user_id = spent.user_id;

-- View para resumo mensal por usuário
CREATE OR REPLACE VIEW public.monthly_summary AS
SELECT 
    user_id,
    EXTRACT(YEAR FROM date) as year,
    EXTRACT(MONTH FROM date) as month,
    SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as total_income,
    SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as total_expense,
    SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as net_amount,
    COUNT(*) as transaction_count
FROM public.transactions
GROUP BY user_id, EXTRACT(YEAR FROM date), EXTRACT(MONTH FROM date);

-- View para estatísticas por categoria
CREATE OR REPLACE VIEW public.category_statistics AS
SELECT 
    c.id as category_id,
    c.name as category_name,
    c.color as category_color,
    c.icon as category_icon,
    c.user_id,
    COUNT(t.id) as transaction_count,
    COALESCE(SUM(t.amount), 0) as total_amount,
    COALESCE(AVG(t.amount), 0) as average_amount,
    MAX(t.date) as last_transaction_date
FROM public.categories c
LEFT JOIN public.transactions t ON c.id = t.category_id
GROUP BY c.id, c.name, c.color, c.icon, c.user_id;

-- ====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================================

-- Comentários para categories
COMMENT ON TABLE public.categories IS 'Categorias de transações - padrão do sistema e personalizadas dos usuários';
COMMENT ON COLUMN public.categories.id IS 'Identificador único da categoria';
COMMENT ON COLUMN public.categories.user_id IS 'ID do usuário proprietário (NULL para categorias padrão do sistema)';
COMMENT ON COLUMN public.categories.name IS 'Nome descritivo da categoria';
COMMENT ON COLUMN public.categories.color IS 'Cor da categoria em formato hexadecimal (#RRGGBB)';
COMMENT ON COLUMN public.categories.icon IS 'Ícone Material-UI da categoria';
COMMENT ON COLUMN public.categories.is_default IS 'Indica se é uma categoria padrão do sistema';
COMMENT ON COLUMN public.categories.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.categories.updated_at IS 'Data/hora da última atualização do registro';

-- Comentários para transactions
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários (receitas e despesas)';
COMMENT ON COLUMN public.transactions.id IS 'Identificador único da transação';
COMMENT ON COLUMN public.transactions.user_id IS 'ID do usuário proprietário da transação';
COMMENT ON COLUMN public.transactions.category_id IS 'Categoria da transação (opcional, permite NULL)';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação em formato decimal (sempre positivo)';
COMMENT ON COLUMN public.transactions.description IS 'Descrição detalhada da transação';
COMMENT ON COLUMN public.transactions.type IS 'Tipo da transação: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.transactions.date IS 'Data em que a transação ocorreu';
COMMENT ON COLUMN public.transactions.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.transactions.updated_at IS 'Data/hora da última atualização do registro';

-- Comentários para budgets
COMMENT ON TABLE public.budgets IS 'Orçamentos mensais por categoria definidos pelos usuários';
COMMENT ON COLUMN public.budgets.id IS 'Identificador único do orçamento';
COMMENT ON COLUMN public.budgets.user_id IS 'ID do usuário proprietário do orçamento';
COMMENT ON COLUMN public.budgets.category_id IS 'Categoria para a qual o orçamento foi definido';
COMMENT ON COLUMN public.budgets.amount IS 'Valor do orçamento mensal (deve ser positivo)';
COMMENT ON COLUMN public.budgets.month IS 'Mês do orçamento (1-12)';
COMMENT ON COLUMN public.budgets.year IS 'Ano do orçamento (2020-2100)';
COMMENT ON COLUMN public.budgets.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.budgets.updated_at IS 'Data/hora da última atualização do registro';

-- Comentários para views
COMMENT ON VIEW public.transactions_with_category IS 'View com transações e informações da categoria associada';
COMMENT ON VIEW public.budget_statistics IS 'View com estatísticas detalhadas dos orçamentos e gastos';
COMMENT ON VIEW public.monthly_summary IS 'View com resumo mensal de receitas, despesas e saldo';
COMMENT ON VIEW public.category_statistics IS 'View com estatísticas de uso por categoria';

-- ====================================================================
-- VERIFICAÇÃO FINAL E RELATÓRIO
-- ====================================================================

DO $$
DECLARE
    table_count INTEGER;
    view_count INTEGER;
    index_count INTEGER;
    policy_count INTEGER;
    default_categories_count INTEGER;
BEGIN
    -- Verificar tabelas
    SELECT COUNT(*) INTO table_count 
    FROM information_schema.tables 
    WHERE table_name IN ('transactions', 'categories', 'budgets')
    AND table_schema = 'public';
    
    -- Verificar views
    SELECT COUNT(*) INTO view_count
    FROM information_schema.views
    WHERE table_name IN ('transactions_with_category', 'budget_statistics', 'monthly_summary', 'category_statistics')
    AND table_schema = 'public';
    
    -- Verificar índices
    SELECT COUNT(*) INTO index_count
    FROM pg_indexes
    WHERE schemaname = 'public'
    AND tablename IN ('transactions', 'categories', 'budgets');
    
    -- Verificar políticas RLS
    SELECT COUNT(*) INTO policy_count
    FROM pg_policies
    WHERE schemaname = 'public'
    AND tablename IN ('transactions', 'categories', 'budgets');
    
    -- Verificar categorias padrão
    SELECT COUNT(*) INTO default_categories_count
    FROM public.categories
    WHERE is_default = true;
    
    -- Relatório final
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'RELATÓRIO DE SETUP DA DATABASE DIMDIM';
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'Tabelas criadas: % de 3', table_count;
    RAISE NOTICE 'Views criadas: % de 4', view_count;
    RAISE NOTICE 'Índices criados: %', index_count;
    RAISE NOTICE 'Políticas RLS criadas: %', policy_count;
    RAISE NOTICE 'Categorias padrão inseridas: %', default_categories_count;
    RAISE NOTICE '====================================================================';
    
    IF table_count = 3 AND view_count = 4 AND default_categories_count >= 6 THEN
        RAISE NOTICE 'SETUP CONCLUÍDO COM SUCESSO! ✅';
        RAISE NOTICE 'A database está pronta para uso.';
    ELSE
        RAISE WARNING 'ATENÇÃO: Alguns componentes podem não ter sido criados corretamente.';
        RAISE WARNING 'Verifique os logs acima para mais detalhes.';
    END IF;
    
    RAISE NOTICE '====================================================================';
END $$; 