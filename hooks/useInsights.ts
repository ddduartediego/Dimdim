'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import AnalyticsEngine, { MonthlyAnalytics, CategoryAnalytics } from '@/lib/analytics'
import { MonthlyInsight } from '@/types/database'

interface UseInsightsReturn {
  insights: MonthlyInsight[]
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
}

export function useInsights(month: number, year: number): UseInsightsReturn {
  const { user } = useAuth()
  const [insights, setInsights] = useState<MonthlyInsight[]>([])
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

      // Buscar insights, analytics e dados de categoria em paralelo
      const [insightsData, analyticsData, categoryChartData] = await Promise.all([
        engine.generateInsights(month, year),
        engine.getMonthlyAnalytics(month, year),
        engine.getCategoryData(month, year)
      ])

      setInsights(insightsData)
      setAnalytics(analyticsData)
      setCategoryData(categoryChartData)
    } catch (err: any) {
      console.error('Erro ao carregar insights:', err)
      setError(err.message || 'Erro inesperado ao carregar insights')
    } finally {
      setLoading(false)
    }
  }, [user, month, year])

  useEffect(() => {
    refreshInsights()
  }, [refreshInsights])

  return {
    insights,
    analytics,
    categoryData,
    loading,
    error,
    refreshInsights
  }
}

export default useInsights 