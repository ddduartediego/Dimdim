'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AnalyticsEngine, { MonthlyAnalytics, CategoryAnalytics } from '@/lib/analytics'
import { MonthlyInsight } from '@/types/database'

interface UseInsightsReturn {
  insights: MonthlyInsight[]
  automaticInsights: MonthlyInsight[]
  customInsights: MonthlyInsight[]
  analytics: MonthlyAnalytics | null
  categoryData: Array<{
    name: string
    value: number
    color: string
    icon: string
    percentage: number
  }>
  loading: boolean
  error: string | null
  refreshInsights: () => Promise<void>
  refreshAutomaticInsights: () => Promise<void>
  refreshCustomInsights: () => Promise<void>
}

export function useInsights(month: number, year: number): UseInsightsReturn {
  const { user } = useAuth()
  const [insights, setInsights] = useState<MonthlyInsight[]>([])
  const [automaticInsights, setAutomaticInsights] = useState<MonthlyInsight[]>([])
  const [customInsights, setCustomInsights] = useState<MonthlyInsight[]>([])
  const [analytics, setAnalytics] = useState<MonthlyAnalytics | null>(null)
  const [categoryData, setCategoryData] = useState<Array<{
    name: string
    value: number
    color: string
    icon: string
    percentage: number
  }>>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshInsights = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      const engine = new AnalyticsEngine(user.id)

      // Buscar insights combinados, analytics e dados de categoria em paralelo
      const [allInsightsData, automaticInsightsData, customInsightsData, analyticsData, categoryChartData] = await Promise.all([
        engine.generateAllInsights(month, year),
        engine.generateInsights(month, year),
        engine.generateCustomInsights(month, year),
        engine.getMonthlyAnalytics(month, year),
        engine.getCategoryData(month, year)
      ])

      setInsights(allInsightsData)
      setAutomaticInsights(automaticInsightsData)
      setCustomInsights(customInsightsData)
      setAnalytics(analyticsData)
      setCategoryData(categoryChartData)
    } catch (err: any) {
      console.error('Erro ao carregar insights:', err)
      setError(err.message || 'Erro inesperado ao carregar insights')
    } finally {
      setLoading(false)
    }
  }, [user, month, year])

  const refreshAutomaticInsights = useCallback(async () => {
    if (!user) return

    try {
      const engine = new AnalyticsEngine(user.id)
      const automaticInsightsData = await engine.generateInsights(month, year)
      setAutomaticInsights(automaticInsightsData)
      
      // Atualizar insights combinados também
      const customInsightsData = await engine.generateCustomInsights(month, year)
      const allInsights = [...automaticInsightsData, ...customInsightsData]
      setInsights(allInsights)
    } catch (err: any) {
      console.error('Erro ao carregar insights automáticos:', err)
    }
  }, [user, month, year])

  const refreshCustomInsights = useCallback(async () => {
    if (!user) return

    try {
      const engine = new AnalyticsEngine(user.id)
      const customInsightsData = await engine.generateCustomInsights(month, year)
      setCustomInsights(customInsightsData)
      
      // Atualizar insights combinados também
      const automaticInsightsData = await engine.generateInsights(month, year)
      const allInsights = [...automaticInsightsData, ...customInsightsData]
      setInsights(allInsights)
    } catch (err: any) {
      console.error('Erro ao carregar insights personalizados:', err)
    }
  }, [user, month, year])

  useEffect(() => {
    refreshInsights()
  }, [refreshInsights])

  return {
    insights,
    automaticInsights,
    customInsights,
    analytics,
    categoryData,
    loading,
    error,
    refreshInsights,
    refreshAutomaticInsights,
    refreshCustomInsights
  }
}

export default useInsights 