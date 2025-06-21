-- Script SQL para configurar o banco de dados Dimdim no Supabase

-- Criar tabela de transações
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);

-- Habilitar Row Level Security (RLS)
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;

-- Política RLS: usuários só podem ver suas próprias transações
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

-- Política RLS: usuários só podem inserir suas próprias transações
CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Política RLS: usuários só podem atualizar suas próprias transações
CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

-- Política RLS: usuários só podem deletar suas próprias transações
CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Função para atualizar o campo updated_at automaticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para atualizar updated_at
CREATE TRIGGER handle_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- Comentários para documentação
COMMENT ON TABLE public.transactions IS 'Tabela de transações financeiras dos usuários';
COMMENT ON COLUMN public.transactions.id IS 'Identificador único da transação';
COMMENT ON COLUMN public.transactions.user_id IS 'ID do usuário proprietário da transação';
COMMENT ON COLUMN public.transactions.amount IS 'Valor da transação em formato decimal';
COMMENT ON COLUMN public.transactions.description IS 'Descrição da transação';
COMMENT ON COLUMN public.transactions.type IS 'Tipo da transação: income (receita) ou expense (despesa)';
COMMENT ON COLUMN public.transactions.date IS 'Data da transação';
COMMENT ON COLUMN public.transactions.created_at IS 'Data/hora de criação do registro';
COMMENT ON COLUMN public.transactions.updated_at IS 'Data/hora da última atualização do registro'; 