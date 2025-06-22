'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { TransactionWithCategory } from '@/types/database'
import dayjs from 'dayjs'

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  monthlyTransactions: TransactionWithCategory[]
  transactionCount: number
}

interface UseDashboardDataReturn {
  data: DashboardData
  loading: boolean
  error: string | null
  refreshData: () => Promise<void>
}

export function useDashboardData(month: number, year: number): UseDashboardDataReturn {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    monthlyTransactions: [],
    transactionCount: 0,
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshData = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Calcular data de início e fim do mês
      const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

      // Buscar transações do período com informações de categoria
      const { data: transactions, error: transactionsError } = await supabase
        .from('transactions_with_category')
        .select('*')
        .eq('user_id', user.id)
        .gte('date', startDate)
        .lte('date', endDate)
        .order('date', { ascending: false })

      if (transactionsError) {
        console.error('Erro ao buscar transações:', transactionsError)
        setError('Erro ao carregar transações do período')
        return
      }

      const transactionsList = transactions || []

      // Calcular totais
      const totalIncome = transactionsList
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0)

      const totalExpenses = transactionsList
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0)

      const balance = totalIncome - totalExpenses

      setData({
        totalIncome,
        totalExpenses,
        balance,
        monthlyTransactions: transactionsList,
        transactionCount: transactionsList.length,
      })
    } catch (err: any) {
      console.error('Erro ao carregar dados do dashboard:', err)
      setError(err.message || 'Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }, [user, month, year])

  useEffect(() => {
    refreshData()
  }, [refreshData])

  return {
    data,
    loading,
    error,
    refreshData
  }
}

export default useDashboardData 