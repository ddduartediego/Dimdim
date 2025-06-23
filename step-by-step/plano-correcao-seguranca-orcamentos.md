# Plano de Correção - Segurança dos Orçamentos (HOTFIX)

## 🚨 SITUAÇÃO CRÍTICA IDENTIFICADA
**Data**: 2025-01-09  
**Severidade**: CRÍTICA  
**Status**: HOTFIX IMEDIADO NECESSÁRIO  

## 📊 Análise do Padrão Atual

### ✅ Como as TRANSAÇÕES funcionam corretamente:
```typescript
// hooks/useDashboardData.ts - SEGURO
const { data: transactions, error } = await supabase
  .from('transactions_with_category')
  .select('*')
  .eq('user_id', user.id)  // ← FILTRO DE USUÁRIO APLICADO
  .gte('date', startDate)
  .lte('date', endDate)
```

### ❌ Como os ORÇAMENTOS estão INSEGUROS:
```typescript
// app/budgets/page.tsx - INSEGURO
const { data: budgetsData, error } = await supabase
  .from('budget_statistics')
  .select('*')
  .eq('month', selectedMonth)
  .eq('year', selectedYear)
  // ← FALTA .eq('user_id', user.id) - VAZAMENTO DE DADOS!
```

## 🎯 ESTRATÉGIA DE CORREÇÃO

### 1. Abordagem Escolhida: **CONSULTA DIRETA + FILTRO EXPLÍCITO**
- **Motivo**: Mesmo padrão usado em transações (comprovadamente seguro)
- **Benefícios**: Performance melhor, mais explícito, não depende de RLS em views
- **Compatibilidade**: Mantém a mesma API para componentes

### 2. Views que Precisam ser Verificadas:
1. ✅ `transactions_with_category` - **SEGURA** (sempre usa filtro `.eq('user_id', user.id)`)
2. ❌ `budget_statistics` - **INSEGURA** (não há filtro de usuário)
3. ❓ `monthly_summary` - **VERIFICAR**
4. ❓ `category_statistics` - **VERIFICAR**

## 📋 PLANO DE EXECUÇÃO (HOTFIX)

### FASE 1: Correção Imediata - Aplicação (30 min)
1. **app/budgets/page.tsx** - Substituir view por consulta direta
2. **hooks/useNavigationBadges.ts** - Adicionar filtro de usuário
3. **lib/analytics.ts** - Corrigir uso de budget_statistics
4. **lib/customInsightsEngine.ts** - Verificar e corrigir

### FASE 2: Auditoria de Outras Views (15 min)
5. Verificar `monthly_summary` e `category_statistics`
6. Garantir que todas as views são seguras ou não são usadas

### FASE 3: Correção do Banco (10 min)
7. Aplicar script SQL para corrigir/remover views problemáticas
8. Atualizar migrations para novos deploys

### FASE 4: Teste e Validação (15 min)
9. Testar com usuários diferentes
10. Validar que dados são filtrados corretamente

## 🔧 IMPLEMENTAÇÃO DETALHADA

### Arquivo 1: `app/budgets/page.tsx`

**SUBSTITUIR:**
```typescript
// ❌ INSEGURO - Via view sem filtro de usuário
const { data: budgetsData, error: budgetsError } = await supabase
  .from('budget_statistics')
  .select('*')
  .eq('month', selectedMonth)
  .eq('year', selectedYear)
```

**POR:**
```typescript
// ✅ SEGURO - Consulta direta com join manual
const { data: budgetsData, error: budgetsError } = await supabase
  .from('budgets')
  .select(`
    *,
    categories (
      name,
      color,
      icon
    )
  `)
  .eq('user_id', user!.id)  // ← FILTRO DE SEGURANÇA
  .eq('month', selectedMonth)
  .eq('year', selectedYear)
```

### Arquivo 2: `hooks/useNavigationBadges.ts`

**ADICIONAR FILTRO:**
```typescript
const { data: budgetStats, error: budgetError } = await supabase
  .from('budget_statistics')
  .select('id, percentage_used')
  .eq('user_id', user?.id)  // ← ADICIONAR ESTA LINHA
  .eq('month', currentMonth)
  .eq('year', currentYear)
```

### Arquivo 3: Script SQL para Banco

**Opção A: Adicionar RLS à View (Recomendado)**
```sql
-- Remover view insegura
DROP VIEW IF EXISTS public.budget_statistics;

-- Criar função segura que respeita RLS
CREATE OR REPLACE FUNCTION get_budget_statistics(
  p_month INTEGER DEFAULT NULL,
  p_year INTEGER DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  category_id UUID,
  amount DECIMAL,
  month INTEGER,
  year INTEGER,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  category_name TEXT,
  category_color TEXT,
  category_icon TEXT,
  spent_amount DECIMAL,
  percentage_used DECIMAL
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
    CASE 
      WHEN b.amount > 0 THEN ROUND((COALESCE(spent.total, 0) / b.amount * 100)::NUMERIC, 2)
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
    AND b.user_id = spent.user_id
  WHERE b.user_id = auth.uid()
    AND (p_month IS NULL OR b.month = p_month)
    AND (p_year IS NULL OR b.year = p_year);
$$;
```

### Arquivo 4: Alterações nos Hooks/Libs

Todos os arquivos que usam `budget_statistics` devem ser alterados para:
1. Usar consulta direta à tabela `budgets` com joins manuais, OU
2. Usar a nova função `get_budget_statistics()` se implementada

## ⚡ CRONOGRAMA DE EXECUÇÃO

1. **Agora**: Implementar correções na aplicação (Fase 1)
2. **+30 min**: Aplicar script SQL no Supabase (Fase 3)
3. **+45 min**: Testes com usuários diferentes (Fase 4)
4. **+60 min**: Deploy em produção

## 🧪 PLANO DE TESTES

### Cenários de Teste:
1. **Usuário A** cria orçamento para Janeiro 2025
2. **Usuário B** (diferente) acessa página de orçamentos
3. **Verificar**: Usuário B NÃO deve ver orçamento do Usuário A
4. **Verificar**: Cada usuário vê apenas seus próprios orçamentos
5. **Verificar**: Navegação badges funcionam corretamente
6. **Verificar**: Analytics/Insights não mostram dados de outros usuários

### Usuários de Teste Disponíveis:
- Usar contas de teste existentes para validação

## ⚠️ PONTOS DE ATENÇÃO

1. **Performance**: Consultas diretas podem ser mais lentas que views, mas é necessário por segurança
2. **Backwards Compatibility**: Manter mesma estrutura de dados para componentes
3. **Cache**: Limpar qualquer cache que possa ter dados contaminados
4. **Logs**: Monitorar logs por erros após deploy

## 📝 PRÓXIMOS PASSOS APÓS HOTFIX

1. Auditoria completa de todas as views do sistema
2. Implementar testes automatizados de segurança
3. Documentar padrões de segurança para equipe
4. Review de código obrigatório para queries de banco 