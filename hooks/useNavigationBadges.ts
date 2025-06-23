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

      // Contar orçamentos próximos do limite (consulta segura por usuário)
      let budgetsNearLimit = []
      try {
        const currentDate = new Date()
        const currentMonth = currentDate.getMonth() + 1
        const currentYear = currentDate.getFullYear()
        
        // Buscar orçamentos do usuário para o mês atual
        const { data: budgets, error: budgetError } = await supabase
          .from('budgets')
          .select('id, amount, category_id')
          .eq('user_id', user?.id)
          .eq('month', currentMonth)
          .eq('year', currentYear)
        
        if (!budgetError && budgets && budgets.length > 0) {
          // Buscar gastos do mês atual por categoria
          const startDate = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-01`
          const endDate = new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]
          
          const { data: expenses, error: expensesError } = await supabase
            .from('transactions')
            .select('category_id, amount')
            .eq('user_id', user?.id)
            .eq('type', 'expense')
            .gte('date', startDate)
            .lte('date', endDate)
          
          if (!expensesError && expenses) {
            // Calcular gastos por categoria
            const spentByCategory = expenses.reduce((acc, expense) => {
              if (expense.category_id) {
                acc[expense.category_id] = (acc[expense.category_id] || 0) + expense.amount
              }
              return acc
            }, {} as Record<string, number>)
            
            // Filtrar orçamentos próximos do limite (80%+)
            budgetsNearLimit = budgets.filter(budget => {
              const spent = spentByCategory[budget.category_id] || 0
              const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0
              return percentage >= 80
            })
          }
        }
      } catch (error) {
        console.log('Erro ao calcular orçamentos próximos do limite:', error)
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