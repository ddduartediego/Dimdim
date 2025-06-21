'use client'

import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'

interface NavigationBadges {
  transactions: number
  categories: number
  budgets: number
  reports: number
}

export const useNavigationBadges = () => {
  const { user } = useAuth()
  const [badges, setBadges] = useState<NavigationBadges>({
    transactions: 0,
    categories: 0,
    budgets: 0,
    reports: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (user) {
      fetchBadgeData()
    }
  }, [user])

  const fetchBadgeData = async () => {
    try {
      setLoading(true)

      // Contar transações sem categoria (exemplo de badge útil)
      const { data: uncategorizedTransactions, error: transError } = await supabase
        .from('transactions')
        .select('id')
        .is('category_id', null)

      // Contar categorias personalizadas
      const { data: customCategories, error: catError } = await supabase
        .from('categories')
        .select('id')
        .eq('user_id', user?.id)

      // Contar orçamentos próximos do limite (usando budget_statistics)
      let budgetsNearLimit = []
      try {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()
        
        const { data: budgetStats, error: budgetError } = await supabase
          .from('budget_statistics')
          .select('id, percentage_used')
          .eq('month', currentMonth)
          .eq('year', currentYear)
        
        if (!budgetError && budgetStats) {
          budgetsNearLimit = budgetStats.filter(budget => 
            budget.percentage_used >= 80
          )
        }
      } catch (error) {
        console.log('Budget statistics não disponível:', error)
        // Fallback silencioso - não quebra a aplicação
        budgetsNearLimit = []
      }

      // Contar insights/relatórios não visualizados (placeholder)
      const unreadReports = 0 // Implementar quando houver sistema de insights

      setBadges({
        transactions: uncategorizedTransactions?.length || 0,
        categories: customCategories?.length || 0,
        budgets: budgetsNearLimit?.length || 0,
        reports: unreadReports
      })

    } catch (error) {
      console.error('Erro ao buscar dados dos badges:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshBadges = () => {
    if (user) {
      fetchBadgeData()
    }
  }

  return {
    badges,
    loading,
    refreshBadges
  }
} 