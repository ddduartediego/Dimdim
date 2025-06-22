'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { TransactionWithCategory } from '@/types/database'
import dayjs from 'dayjs'

interface UseTransactionsReturn {
  transactions: TransactionWithCategory[]
  loading: boolean
  error: string | null
  refreshTransactions: () => Promise<void>
}

export function useTransactions(month: number, year: number): UseTransactionsReturn {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<TransactionWithCategory[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const refreshTransactions = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Calcular data de início e fim do mês
      const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
      const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

      // Buscar transações do período com informações de categoria
      const { data, error: transactionsError } = await supabase
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

      setTransactions(data || [])
    } catch (err: any) {
      console.error('Erro ao carregar transações:', err)
      setError(err.message || 'Erro inesperado ao carregar transações')
    } finally {
      setLoading(false)
    }
  }, [user, month, year])

  useEffect(() => {
    refreshTransactions()
  }, [refreshTransactions])

  return {
    transactions,
    loading,
    error,
    refreshTransactions
  }
}

export default useTransactions 