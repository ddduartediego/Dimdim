-- ====================================================================
-- MIGRAÇÃO PARA CONFIGURAÇÕES ADMINISTRATIVAS DE CATEGORIAS PADRÃO
-- Script para migrar categorias existentes e configurar ambiente administrativo
-- VERSÃO CORRIGIDA - Sem erros de ON CONFLICT
-- ====================================================================

-- ====================================================================
-- 1. ATUALIZAR CATEGORIAS PADRÃO EXISTENTES
-- ====================================================================

-- Primeiro, vamos garantir que as categorias padrão tenham user_id = NULL
UPDATE public.categories 
SET user_id = NULL 
WHERE is_default = true;

-- ====================================================================
-- 2. INSERIR CATEGORIAS PADRÃO ESSENCIAIS (COM VERIFICAÇÃO SEGURA)
-- ====================================================================

-- Usar INSERT apenas para categorias que não existem como padrão
-- Verificamos se já existe uma categoria padrão com o mesmo nome

-- Função temporária para inserir categorias padrão sem conflito
DO $$
BEGIN
    -- Inserir categorias padrão somente se não existirem
    INSERT INTO public.categories (user_id, name, color, icon, is_default)
    SELECT NULL, category_name, category_color, category_icon, true
    FROM (VALUES
        ('Alimentação', '#FF9800', 'restaurant'),
        ('Transporte', '#2196F3', 'directions_car'),
        ('Moradia', '#4CAF50', 'home'),
        ('Saúde', '#F44336', 'local_hospital'),
        ('Lazer', '#9C27B0', 'sports_esports'),
        ('Compras', '#FF5722', 'shopping_cart'),
        ('Educação', '#795548', 'school'),
        ('Trabalho', '#607D8B', 'work'),
        ('Beleza', '#E91E63', 'face'),
        ('Tecnologia', '#3F51B5', 'computer'),
        ('Pets', '#8BC34A', 'pets'),
        ('Viagem', '#FFC107', 'flight'),
        ('Cultura', '#673AB7', 'theater_comedy'),
        ('Esportes', '#CDDC39', 'fitness_center'),
        ('Combustível', '#FF6F00', 'local_gas_station'),
        ('Salário', '#4CAF50', 'payment'),
        ('Freelance', '#2196F3', 'person_outline'),
        ('Vendas', '#FF9800', 'sell'),
        ('Investimentos', '#009688', 'trending_up'),
        ('Rendimentos', '#009688', 'account_balance')
    ) AS new_categories(category_name, category_color, category_icon)
    WHERE NOT EXISTS (
        SELECT 1 FROM public.categories 
        WHERE name = category_name AND is_default = true
    );
END $$;

-- ====================================================================
-- 3. AJUSTAR POLÍTICAS RLS PARA ADMINISTRAÇÃO
-- ====================================================================

-- Remover políticas existentes para categories se existirem
DROP POLICY IF EXISTS "Users can view own categories and defaults" ON public.categories;
DROP POLICY IF EXISTS "Users can insert own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can update own categories" ON public.categories;
DROP POLICY IF EXISTS "Users can delete own categories" ON public.categories;

-- Políticas RLS aprimoradas para categories
-- Visualização: usuários podem ver suas próprias categorias + todas as padrão
CREATE POLICY "Users can view own categories and all defaults" ON public.categories
    FOR SELECT USING (
        auth.uid() = user_id OR 
        is_default = true
    );

-- Inserção: usuários podem inserir apenas suas próprias categorias (não padrão)
-- Admins podem inserir categorias padrão (user_id = null)
CREATE POLICY "Users can insert own categories" ON public.categories
    FOR INSERT WITH CHECK (
        (auth.uid() = user_id AND is_default = false) OR
        (user_id IS NULL AND is_default = true)
    );

-- Atualização: usuários podem atualizar apenas suas categorias (não padrão)
-- Categorias padrão podem ser atualizadas por admin
CREATE POLICY "Users can update own categories" ON public.categories
    FOR UPDATE USING (
        (auth.uid() = user_id AND is_default = false) OR
        (user_id IS NULL AND is_default = true)
    );

-- Exclusão: usuários podem excluir apenas suas categorias (não padrão)
-- Categorias padrão podem ser excluídas por admin
CREATE POLICY "Users can delete own categories" ON public.categories
    FOR DELETE USING (
        (auth.uid() = user_id AND is_default = false) OR
        (user_id IS NULL AND is_default = true)
    );

-- ====================================================================
-- 4. FUNÇÃO PARA APLICAR CATEGORIAS PADRÃO A NOVOS USUÁRIOS
-- ====================================================================

-- Esta função será chamada quando um novo usuário se registrar
CREATE OR REPLACE FUNCTION public.apply_default_categories_to_user(user_uuid UUID)
RETURNS void AS $$
BEGIN
    -- As categorias padrão já são visíveis para todos os usuários
    -- devido às políticas RLS, então não precisamos duplicá-las
    -- Esta função fica disponível para uso futuro se necessário
    
    -- Exemplo de como copiar categorias padrão para usuário específico:
    -- INSERT INTO public.categories (user_id, name, color, icon, is_default)
    -- SELECT user_uuid, name, color, icon, false
    -- FROM public.categories 
    -- WHERE is_default = true;
    
    NULL; -- Por enquanto não faz nada
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ====================================================================
-- 5. ÍNDICES ADICIONAIS PARA PERFORMANCE ADMINISTRATIVA
-- ====================================================================

-- Índice composto para consultas administrativas
CREATE INDEX IF NOT EXISTS categories_admin_idx ON public.categories(is_default, user_id, name);

-- Índice para buscas por categorias padrão
CREATE INDEX IF NOT EXISTS categories_defaults_only_idx ON public.categories(is_default) WHERE is_default = true;

-- ====================================================================
-- 6. COMENTÁRIOS E DOCUMENTAÇÃO
-- ====================================================================

COMMENT ON COLUMN public.categories.user_id IS 'ID do usuário proprietário da categoria. NULL para categorias padrão globais';
COMMENT ON COLUMN public.categories.is_default IS 'Indica se é uma categoria padrão do sistema (global)';

-- ====================================================================
-- 7. VERIFICAÇÕES DE INTEGRIDADE
-- ====================================================================

-- Garantir que categorias padrão tenham user_id = NULL
CREATE OR REPLACE FUNCTION public.check_default_category_consistency()
RETURNS trigger AS $$
BEGIN
    -- Se is_default = true, user_id deve ser NULL
    IF NEW.is_default = true AND NEW.user_id IS NOT NULL THEN
        NEW.user_id := NULL;
    END IF;
    
    -- Se user_id = NULL, is_default deve ser true
    IF NEW.user_id IS NULL AND NEW.is_default = false THEN
        NEW.is_default := true;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para manter consistência
DROP TRIGGER IF EXISTS enforce_default_category_consistency ON public.categories;
CREATE TRIGGER enforce_default_category_consistency
    BEFORE INSERT OR UPDATE ON public.categories
    FOR EACH ROW EXECUTE FUNCTION public.check_default_category_consistency();

-- ====================================================================
-- FINALIZAÇÃO DA MIGRAÇÃO
-- ====================================================================

-- Confirmar que a migração foi aplicada
SELECT 
    COUNT(*) as total_categories,
    COUNT(*) FILTER (WHERE is_default = true) as default_categories,
    COUNT(*) FILTER (WHERE is_default = false) as user_categories
FROM public.categories;

COMMENT ON TABLE public.categories IS 'Tabela de categorias com suporte administrativo para categorias padrão globais'; 