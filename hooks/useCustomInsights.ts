'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  CustomInsight, 
  CustomInsightInsert, 
  CustomInsightUpdate,
  InsightTemplate,
  TemplateParameter
} from '@/types/database'

interface UseCustomInsightsReturn {
  insights: CustomInsight[]
  templates: InsightTemplate[]
  loading: boolean
  error: string | null
  createInsight: (insight: CustomInsightInsert) => Promise<CustomInsight>
  updateInsight: (id: string, updates: CustomInsightUpdate) => Promise<CustomInsight>
  deleteInsight: (id: string) => Promise<void>
  toggleInsight: (id: string, isActive: boolean) => Promise<void>
  refreshInsights: () => Promise<void>
  duplicateInsight: (id: string) => Promise<CustomInsight>
  getInsightById: (id: string) => CustomInsight | undefined
}

export function useCustomInsights(): UseCustomInsightsReturn {
  const { user } = useAuth()
  const [insights, setInsights] = useState<CustomInsight[]>([])
  const [templates, setTemplates] = useState<InsightTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar insights do usuário
  const refreshInsights = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const { data: insightsData, error: insightsError } = await supabase
        .from('custom_insights')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (insightsError) {
        throw new Error(`Erro ao buscar insights: ${insightsError.message}`)
      }

      setInsights(insightsData || [])
    } catch (err: any) {
      console.error('Erro ao carregar insights:', err)
      setError(err.message || 'Erro inesperado ao carregar insights')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Criar novo insight
  const createInsight = useCallback(async (insight: CustomInsightInsert): Promise<CustomInsight> => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('custom_insights')
      .insert([{ ...insight, user_id: user.id }])
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar insight: ${error.message}`)
    }

    // Atualizar lista local
    setInsights(prev => [data, ...prev])
    
    return data
  }, [user])

  // Atualizar insight existente
  const updateInsight = useCallback(async (id: string, updates: CustomInsightUpdate): Promise<CustomInsight> => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { data, error } = await supabase
      .from('custom_insights')
      .update(updates)
      .eq('id', id)
      .eq('user_id', user.id)
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao atualizar insight: ${error.message}`)
    }

    // Atualizar lista local
    setInsights(prev => prev.map(insight => 
      insight.id === id ? data : insight
    ))

    return data
  }, [user])

  // Deletar insight
  const deleteInsight = useCallback(async (id: string): Promise<void> => {
    if (!user) {
      throw new Error('Usuário não autenticado')
    }

    const { error } = await supabase
      .from('custom_insights')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      throw new Error(`Erro ao deletar insight: ${error.message}`)
    }

    // Remover da lista local
    setInsights(prev => prev.filter(insight => insight.id !== id))
  }, [user])

  // Ativar/desativar insight
  const toggleInsight = useCallback(async (id: string, isActive: boolean): Promise<void> => {
    await updateInsight(id, { is_active: isActive })
  }, [updateInsight])

  // Duplicar insight
  const duplicateInsight = useCallback(async (id: string): Promise<CustomInsight> => {
    const originalInsight = insights.find(i => i.id === id)
    if (!originalInsight) {
      throw new Error('Insight não encontrado')
    }

    const duplicatedInsight: CustomInsightInsert = {
      name: `${originalInsight.name} (Cópia)`,
      description: originalInsight.description,
      conditions: originalInsight.conditions,
      formula: originalInsight.formula,
      is_active: false, // Criar inativo por padrão
      insight_type: originalInsight.insight_type,
      template_id: originalInsight.template_id,
      severity: originalInsight.severity,
      user_id: user?.id || ''
    }

    return await createInsight(duplicatedInsight)
  }, [insights, createInsight, user])

  // Obter insight por ID
  const getInsightById = useCallback((id: string): CustomInsight | undefined => {
    return insights.find(insight => insight.id === id)
  }, [insights])

  // Carregar templates predefinidos
  useEffect(() => {
    const loadTemplates = () => {
      const predefinedTemplates: InsightTemplate[] = [
        {
          id: 'category_limit_exceeded',
          name: 'Gastos por Categoria Excederam Limite',
          description: 'Alerta quando gastos em uma categoria específica excedem um valor definido',
          defaultConditions: {
            field: 'category_amount',
            operator: '>',
            value: 1000,
            category: null
          },
          defaultSeverity: 'warning',
          category: 'spending',
          parameters: [
            {
              key: 'category',
              label: 'Categoria',
              type: 'category',
              required: true,
              description: 'Selecione a categoria para monitorar'
            },
            {
              key: 'value',
              label: 'Valor Limite (R$)',
              type: 'number',
              defaultValue: 1000,
              required: true,
              description: 'Valor máximo permitido para a categoria'
            }
          ]
        },
        {
          id: 'expenses_percentage_increase',
          name: 'Aumento Percentual de Gastos',
          description: 'Alerta quando há aumento significativo nos gastos em relação ao mês anterior',
          defaultConditions: {
            field: 'expenses_change_percentage',
            operator: '>',
            value: 20
          },
          defaultSeverity: 'warning',
          category: 'trend',
          parameters: [
            {
              key: 'value',
              label: 'Percentual de Aumento (%)',
              type: 'percentage',
              defaultValue: 20,
              required: true,
              description: 'Percentual de aumento que dispara o alerta'
            }
          ]
        },
        {
          id: 'savings_goal_not_met',
          name: 'Meta de Economia Não Atingida',
          description: 'Alerta quando a economia mensal fica abaixo da meta estabelecida',
          defaultConditions: {
            field: 'monthly_savings',
            operator: '<',
            value: 500
          },
          defaultSeverity: 'error',
          category: 'saving',
          parameters: [
            {
              key: 'value',
              label: 'Meta de Economia (R$)',
              type: 'number',
              defaultValue: 500,
              required: true,
              description: 'Valor mínimo de economia mensal esperado'
            }
          ]
        },
        {
          id: 'transactions_above_average',
          name: 'Transações Acima da Média',
          description: 'Alerta quando o número de transações está muito acima da média mensal',
          defaultConditions: {
            field: 'transaction_count',
            operator: '>',
            function: 'average_plus_stddev'
          },
          defaultSeverity: 'info',
          category: 'transaction',
          parameters: []
        },
        {
          id: 'custom_budget_exceeded',
          name: 'Orçamento Personalizado Excedido',
          description: 'Alerta personalizado para monitoramento de orçamento específico',
          defaultConditions: {
            field: 'budget_percentage',
            operator: '>=',
            value: 90,
            category: null
          },
          defaultSeverity: 'warning',
          category: 'budget',
          parameters: [
            {
              key: 'category',
              label: 'Categoria',
              type: 'category',
              required: true,
              description: 'Categoria do orçamento a monitorar'
            },
            {
              key: 'value',
              label: 'Percentual de Alerta (%)',
              type: 'percentage',
              defaultValue: 90,
              required: true,
              description: 'Percentual do orçamento que dispara o alerta'
            }
          ]
        }
      ]

      setTemplates(predefinedTemplates)
    }

    loadTemplates()
  }, [])

  // Carregar insights na inicialização
  useEffect(() => {
    refreshInsights()
  }, [refreshInsights])

  return {
    insights,
    templates,
    loading,
    error,
    createInsight,
    updateInsight,
    deleteInsight,
    toggleInsight,
    refreshInsights,
    duplicateInsight,
    getInsightById
  }
}

export default useCustomInsights 