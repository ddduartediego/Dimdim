-- ================================
-- CUSTOM INSIGHTS SYSTEM
-- ================================
-- Script para criar tabela de insights personalizados
-- Autor: Sistema Dimdim
-- Data: 2025

-- Criar tabela de insights personalizados
CREATE TABLE IF NOT EXISTS custom_insights (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    conditions JSONB,
    formula TEXT,
    is_active BOOLEAN DEFAULT true,
    insight_type VARCHAR(20) DEFAULT 'custom' CHECK (insight_type IN ('custom', 'template')),
    template_id VARCHAR(100),
    severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'success', 'error')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Comentários de documentação
COMMENT ON TABLE custom_insights IS 'Tabela para armazenar insights personalizados criados pelos usuários';
COMMENT ON COLUMN custom_insights.id IS 'Identificador único do insight personalizado';
COMMENT ON COLUMN custom_insights.user_id IS 'Referência ao usuário proprietário do insight';
COMMENT ON COLUMN custom_insights.name IS 'Nome/título do insight personalizado';
COMMENT ON COLUMN custom_insights.description IS 'Descrição detalhada do insight';
COMMENT ON COLUMN custom_insights.conditions IS 'Condições estruturadas em JSON para avaliação automática';
COMMENT ON COLUMN custom_insights.formula IS 'Fórmula alternativa em texto livre para insights avançados';
COMMENT ON COLUMN custom_insights.is_active IS 'Flag para ativar/desativar o insight';
COMMENT ON COLUMN custom_insights.insight_type IS 'Tipo do insight: custom (personalizado) ou template (baseado em modelo)';
COMMENT ON COLUMN custom_insights.template_id IS 'ID do template utilizado (se aplicável)';
COMMENT ON COLUMN custom_insights.severity IS 'Nível de severidade: info, warning, success, error';

-- Índices para performance
CREATE INDEX idx_custom_insights_user_id ON custom_insights(user_id);
CREATE INDEX idx_custom_insights_active ON custom_insights(user_id, is_active) WHERE is_active = true;
CREATE INDEX idx_custom_insights_type ON custom_insights(user_id, insight_type);
CREATE INDEX idx_custom_insights_template ON custom_insights(template_id) WHERE template_id IS NOT NULL;

-- Trigger para atualização automática do updated_at
CREATE OR REPLACE FUNCTION update_custom_insights_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc'::text, NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_custom_insights_updated_at
    BEFORE UPDATE ON custom_insights
    FOR EACH ROW
    EXECUTE FUNCTION update_custom_insights_updated_at();

-- ================================
-- POLÍTICAS RLS (Row Level Security)
-- ================================

-- Habilitar RLS na tabela
ALTER TABLE custom_insights ENABLE ROW LEVEL SECURITY;

-- Política SELECT: Usuários só veem seus próprios insights
CREATE POLICY "Usuários podem ver seus próprios insights personalizados"
    ON custom_insights FOR SELECT
    USING (auth.uid() = user_id);

-- Política INSERT: Usuários só podem inserir insights para si mesmos
CREATE POLICY "Usuários podem criar seus próprios insights personalizados"
    ON custom_insights FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Política UPDATE: Usuários só podem atualizar seus próprios insights
CREATE POLICY "Usuários podem atualizar seus próprios insights personalizados"
    ON custom_insights FOR UPDATE
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- Política DELETE: Usuários só podem deletar seus próprios insights
CREATE POLICY "Usuários podem deletar seus próprios insights personalizados"
    ON custom_insights FOR DELETE
    USING (auth.uid() = user_id);

-- ================================
-- TEMPLATES PRÉ-DEFINIDOS
-- ================================

-- Função para inserir templates padrão para novos usuários
CREATE OR REPLACE FUNCTION create_default_insight_templates(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
    -- Template 1: Gastos por categoria excedeu valor
    INSERT INTO custom_insights (user_id, name, description, conditions, insight_type, template_id, severity)
    VALUES (
        target_user_id,
        'Gastos por Categoria Excederam Limite',
        'Alerta quando gastos em uma categoria específica excedem um valor definido',
        '{"field": "category_amount", "operator": ">", "value": 1000, "category": null}',
        'template',
        'category_limit_exceeded',
        'warning'
    );

    -- Template 2: Aumento percentual de gastos
    INSERT INTO custom_insights (user_id, name, description, conditions, insight_type, template_id, severity)
    VALUES (
        target_user_id,
        'Aumento Percentual de Gastos',
        'Alerta quando há aumento significativo nos gastos em relação ao mês anterior',
        '{"field": "expenses_change_percentage", "operator": ">", "value": 20}',
        'template',
        'expenses_percentage_increase',
        'warning'
    );

    -- Template 3: Meta de economia não atingida
    INSERT INTO custom_insights (user_id, name, description, conditions, insight_type, template_id, severity)
    VALUES (
        target_user_id,
        'Meta de Economia Não Atingida',
        'Alerta quando a economia mensal fica abaixo da meta estabelecida',
        '{"field": "monthly_savings", "operator": "<", "value": 500}',
        'template',
        'savings_goal_not_met',
        'error'
    );

    -- Template 4: Transações acima da média
    INSERT INTO custom_insights (user_id, name, description, conditions, insight_type, template_id, severity)
    VALUES (
        target_user_id,
        'Transações Acima da Média',
        'Alerta quando o número de transações está muito acima da média mensal',
        '{"field": "transaction_count", "operator": ">", "function": "average_plus_stddev"}',
        'template',
        'transactions_above_average',
        'info'
    );

    -- Template 5: Orçamento personalizado
    INSERT INTO custom_insights (user_id, name, description, conditions, insight_type, template_id, severity)
    VALUES (
        target_user_id,
        'Orçamento Personalizado Excedido',
        'Alerta personalizado para monitoramento de orçamento específico',
        '{"field": "budget_percentage", "operator": ">=", "value": 90, "category": null}',
        'template',
        'custom_budget_exceeded',
        'warning'
    );
END;
$$ LANGUAGE plpgsql;

-- ================================
-- FUNÇÕES AUXILIARES
-- ================================

-- Função para validar estrutura de condições JSON
CREATE OR REPLACE FUNCTION validate_insight_conditions(conditions_json JSONB)
RETURNS BOOLEAN AS $$
BEGIN
    -- Verificar se tem os campos obrigatórios
    IF NOT (conditions_json ? 'field' AND conditions_json ? 'operator') THEN
        RETURN FALSE;
    END IF;

    -- Verificar se o operador é válido
    IF NOT (conditions_json->>'operator' = ANY(ARRAY['>', '<', '>=', '<=', '==', '!=', 'contains', 'not_contains'])) THEN
        RETURN FALSE;
    END IF;

    -- Verificar se tem valor ou função
    IF NOT (conditions_json ? 'value' OR conditions_json ? 'function') THEN
        RETURN FALSE;
    END IF;

    RETURN TRUE;
END;
$$ LANGUAGE plpgsql;

-- Constraint para validar condições JSON
ALTER TABLE custom_insights 
ADD CONSTRAINT valid_conditions_structure 
CHECK (
    conditions IS NULL OR 
    validate_insight_conditions(conditions) OR
    formula IS NOT NULL
);

-- ================================
-- GRANTS E PERMISSÕES
-- ================================

-- Garantir que usuários autenticados possam acessar a tabela
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON TABLE custom_insights TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated; 