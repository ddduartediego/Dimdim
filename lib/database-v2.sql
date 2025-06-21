-- ====================================================================
-- DIMDIM V2.0 - ESTRUTURA COMPLETA DO BANCO DE DADOS
-- Script SQL para configurar o banco de dados com categorias e orçamentos
-- ====================================================================

-- ====================================================================
-- TABELA DE CATEGORIAS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.categories (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    color VARCHAR(7) NOT NULL DEFAULT '#1976D2',
    icon VARCHAR(50) DEFAULT 'category',
    is_default BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT categories_color_check CHECK (color ~* '^#[0-9A-Fa-f]{6}$')
);

-- ====================================================================
-- TABELA DE TRANSAÇÕES ATUALIZADA
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT NOT NULL,
    type VARCHAR(10) NOT NULL CHECK (type IN ('income', 'expense')),
    date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ====================================================================
-- TABELA DE ORÇAMENTOS
-- ====================================================================
CREATE TABLE IF NOT EXISTS public.budgets (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    category_id UUID REFERENCES public.categories(id) ON DELETE CASCADE NOT NULL,
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    month INTEGER NOT NULL CHECK (month >= 1 AND month <= 12),
    year INTEGER NOT NULL CHECK (year >= 2020),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT budgets_unique_category_month UNIQUE (user_id, category_id, month, year)
);

-- ====================================================================
-- ÍNDICES PARA PERFORMANCE
-- ====================================================================
-- Índices para categories
CREATE INDEX IF NOT EXISTS categories_user_id_idx ON public.categories(user_id);
CREATE INDEX IF NOT EXISTS categories_is_default_idx ON public.categories(is_default);

-- Índices para transactions (atualizados)
CREATE INDEX IF NOT EXISTS transactions_user_id_idx ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS transactions_category_id_idx ON public.transactions(category_id);
CREATE INDEX IF NOT EXISTS transactions_date_idx ON public.transactions(date);
CREATE INDEX IF NOT EXISTS transactions_type_idx ON public.transactions(type);
CREATE INDEX IF NOT EXISTS transactions_user_date_idx ON public.transactions(user_id, date);

-- Índices para budgets
CREATE INDEX IF NOT EXISTS budgets_user_id_idx ON public.budgets(user_id);
CREATE INDEX IF NOT EXISTS budgets_category_id_idx ON public.budgets(category_id);
CREATE INDEX IF NOT EXISTS budgets_month_year_idx ON public.budgets(month, year);

-- ====================================================================
-- ROW LEVEL SECURITY (RLS)
-- ====================================================================
-- Habilitar RLS para todas as tabelas
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para categories
CREATE POLICY "Users can view own categories and defaults" ON public.categories
    FOR SELECT USING (auth.uid() = user_id OR is_default = true);

CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (auth.uid() = user_id AND is_default = false);

CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (auth.uid() = user_id AND is_default = false);

-- Políticas RLS para transactions (atualizadas)
CREATE POLICY "Users can view own transactions" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own transactions" ON public.transactions
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own transactions" ON public.transactions
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas RLS para budgets
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
-- Função para atualizar updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers para todas as tabelas
CREATE TRIGGER handle_updated_at_categories BEFORE UPDATE ON public.categories
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_transactions BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

CREATE TRIGGER handle_updated_at_budgets BEFORE UPDATE ON public.budgets
    FOR EACH ROW EXECUTE PROCEDURE public.handle_updated_at();

-- ====================================================================
-- INSERÇÃO DAS CATEGORIAS PADRÃO
-- ====================================================================
INSERT INTO public.categories (user_id, name, color, icon, is_default) VALUES
    (NULL, 'Alimentação', '#FF9800', 'restaurant', true),
    (NULL, 'Transporte', '#2196F3', 'directions_car', true),
    (NULL, 'Moradia', '#4CAF50', 'home', true),
    (NULL, 'Saúde', '#F44336', 'local_hospital', true),
    (NULL, 'Lazer', '#9C27B0', 'sports_esports', true)
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
    c.icon as category_icon
FROM public.transactions t
LEFT JOIN public.categories c ON t.category_id = c.id;

-- View para estatísticas de orçamento
CREATE OR REPLACE VIEW public.budget_statistics AS
SELECT 
    b.*,
    c.name as category_name,
    c.color as category_color,
    COALESCE(spent.total, 0) as spent_amount,
    CASE 
        WHEN b.amount > 0 THEN (COALESCE(spent.total, 0) / b.amount * 100)
        ELSE 0 
    END as percentage_used
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

-- ====================================================================
-- COMENTÁRIOS PARA DOCUMENTAÇÃO
-- ====================================================================
-- Comentários para categories
COMMENT ON TABLE public.categories IS 'Categorias de transações - padrão e personalizadas';
COMMENT ON COLUMN public.categories.id IS 'Identificador único da categoria';
COMMENT ON COLUMN public.categories.user_id IS 'ID do usuário (NULL para categorias padrão)';
COMMENT ON COLUMN public.categories.name IS 'Nome da categoria';
COMMENT ON COLUMN public.categories.color IS 'Cor da categoria em formato hex';
COMMENT ON COLUMN public.categories.icon IS 'Ícone Material-UI da categoria';
COMMENT ON COLUMN public.categories.is_default IS 'Indica se é uma categoria padrão do sistema';

-- Comentários para transactions
COMMENT ON TABLE public.transactions IS 'Transações financeiras dos usuários';
COMMENT ON COLUMN public.transactions.category_id IS 'Categoria da transação (opcional)';

-- Comentários para budgets
COMMENT ON TABLE public.budgets IS 'Orçamentos mensais por categoria';
COMMENT ON COLUMN public.budgets.id IS 'Identificador único do orçamento';
COMMENT ON COLUMN public.budgets.category_id IS 'Categoria do orçamento';
COMMENT ON COLUMN public.budgets.amount IS 'Valor do orçamento mensal';
COMMENT ON COLUMN public.budgets.month IS 'Mês do orçamento (1-12)';
COMMENT ON COLUMN public.budgets.year IS 'Ano do orçamento'; 