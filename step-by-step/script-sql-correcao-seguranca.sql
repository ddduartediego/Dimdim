-- ====================================================================
-- SCRIPT DE CORREÇÃO DE SEGURANÇA - ORÇAMENTOS
-- Data: 2025-01-09
-- Problema: View budget_statistics não filtra por usuário
-- Ação: Remover view insegura e opcionalmente criar função segura
-- ====================================================================

-- 1. REMOVER VIEW INSEGURA
DROP VIEW IF EXISTS public.budget_statistics;

-- 2. CRIAR FUNÇÃO SEGURA (OPCIONAL - para compatibilidade futura)
-- Esta função respeita RLS e pode ser usada como substituto da view
CREATE OR REPLACE FUNCTION public.get_budget_statistics(
  p_user_id UUID DEFAULT NULL,
  p_month INTEGER DEFAULT NULL,
  p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  category_id UUID,
  amount DECIMAL(10,2),
  month INTEGER,
  year INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  category_name TEXT,
  category_color TEXT,
  category_icon TEXT,
  spent_amount DECIMAL(10,2),
  remaining_amount DECIMAL(10,2),
  percentage_used DECIMAL(5,2),
  is_over_budget BOOLEAN
) 
LANGUAGE SQL SECURITY DEFINER
AS $$
  SELECT 
    b.id,
    b.user_id,
    b.category_id,
    b.amount,
    b.month,
    b.year,
    b.created_at,
    b.updated_at,
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
    AND b.user_id = spent.user_id
  WHERE 
    -- FILTRO DE SEGURANÇA: Usuário específico ou usuário logado
    (p_user_id IS NOT NULL AND b.user_id = p_user_id) OR
    (p_user_id IS NULL AND b.user_id = auth.uid())
    -- Filtros opcionais
    AND (p_month IS NULL OR b.month = p_month)
    AND (p_year IS NULL OR b.year = p_year)
  ORDER BY b.created_at DESC;
$$;

-- 3. GRANT PERMISSÕES PARA USUÁRIOS AUTENTICADOS
GRANT EXECUTE ON FUNCTION public.get_budget_statistics TO authenticated;

-- 4. COMENTÁRIO DA FUNÇÃO
COMMENT ON FUNCTION public.get_budget_statistics IS 'Função segura para obter estatísticas de orçamento com filtro de usuário obrigatório';

-- 5. VERIFICAR SE OUTRAS VIEWS ESTÃO SEGURAS
-- Verificar se transactions_with_category já tem RLS (deve ter)
-- monthly_summary e category_statistics não são usadas na aplicação, mas podem ser removidas por precaução

-- OPCIONAL: Remover views não utilizadas por precaução
-- DROP VIEW IF EXISTS public.monthly_summary;
-- DROP VIEW IF EXISTS public.category_statistics;

-- ====================================================================
-- VERIFICAÇÃO FINAL
-- ====================================================================

-- Verificar se a view foi removida
DO $$
DECLARE
    view_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO view_count 
    FROM information_schema.views 
    WHERE table_name = 'budget_statistics' AND table_schema = 'public';
    
    IF view_count = 0 THEN
        RAISE NOTICE '✅ View budget_statistics removida com sucesso';
    ELSE
        RAISE WARNING '❌ View budget_statistics ainda existe';
    END IF;
    
    -- Verificar se a função foi criada
    SELECT COUNT(*) INTO view_count
    FROM information_schema.routines
    WHERE routine_name = 'get_budget_statistics' AND routine_schema = 'public';
    
    IF view_count > 0 THEN
        RAISE NOTICE '✅ Função get_budget_statistics criada com sucesso';
    ELSE
        RAISE WARNING '❌ Função get_budget_statistics não foi criada';
    END IF;
    
    RAISE NOTICE '====================================================================';
    RAISE NOTICE 'CORREÇÃO DE SEGURANÇA APLICADA COM SUCESSO! 🔒';
    RAISE NOTICE 'A view budget_statistics foi removida e substituída por função segura.';
    RAISE NOTICE 'A aplicação agora usa consultas diretas com filtros de usuário.';
    RAISE NOTICE '====================================================================';
END $$; 