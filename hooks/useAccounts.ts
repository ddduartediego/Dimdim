'use client'

import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { 
  Account, 
  AccountInsert, 
  AccountUpdate, 
  AccountBalance, 
  AccountFormData,
  AccountTransferData,
  AccountTransferResult
} from '@/types/database'

interface UseAccountsReturn {
  accounts: Account[]
  accountBalances: AccountBalance[]
  loading: boolean
  error: string | null
  defaultAccount: Account | null
  createAccount: (data: AccountFormData) => Promise<boolean>
  updateAccount: (id: string, data: Partial<AccountFormData>) => Promise<boolean>
  deleteAccount: (id: string) => Promise<boolean>
  setDefaultAccount: (id: string) => Promise<boolean>
  createTransfer: (data: AccountTransferData) => Promise<AccountTransferResult>
  refreshAccounts: () => Promise<void>
  getAccountById: (id: string) => Account | undefined
}

export function useAccounts(): UseAccountsReturn {
  const { user } = useAuth()
  const [accounts, setAccounts] = useState<Account[]>([])
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Buscar contas do usuário
  const refreshAccounts = useCallback(async () => {
    if (!user) return

    try {
      setLoading(true)
      setError(null)

      // Buscar contas
      const { data: accountsData, error: accountsError } = await supabase
        .from('accounts')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (accountsError) {
        console.error('Erro ao buscar contas:', accountsError)
        setError('Erro ao carregar contas')
        return
      }

      // Buscar saldos das contas
      const { data: balancesData, error: balancesError } = await supabase
        .from('account_balances')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (balancesError) {
        console.error('Erro ao buscar saldos:', balancesError)
        setError('Erro ao carregar saldos das contas')
        return
      }

      setAccounts(accountsData || [])
      setAccountBalances(balancesData || [])
    } catch (err: any) {
      console.error('Erro ao carregar contas:', err)
      setError(err.message || 'Erro inesperado ao carregar contas')
    } finally {
      setLoading(false)
    }
  }, [user])

  // Criar nova conta
  const createAccount = useCallback(async (data: AccountFormData): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      const accountData: AccountInsert = {
        user_id: user.id,
        name: data.name.trim(),
        type: data.type,
        initial_balance: data.initial_balance,
        is_default: data.is_default
      }

      const { error } = await supabase
        .from('accounts')
        .insert(accountData)

      if (error) {
        console.error('Erro ao criar conta:', error)
        setError('Erro ao criar conta')
        return false
      }

      await refreshAccounts()
      return true
    } catch (err: any) {
      console.error('Erro ao criar conta:', err)
      setError(err.message || 'Erro inesperado ao criar conta')
      return false
    }
  }, [user, refreshAccounts])

  // Atualizar conta
  const updateAccount = useCallback(async (id: string, data: Partial<AccountFormData>): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      const updateData: AccountUpdate = {
        updated_at: new Date().toISOString()
      }

      if (data.name !== undefined) updateData.name = data.name.trim()
      if (data.type !== undefined) updateData.type = data.type
      if (data.initial_balance !== undefined) updateData.initial_balance = data.initial_balance
      if (data.is_default !== undefined) updateData.is_default = data.is_default

      const { error } = await supabase
        .from('accounts')
        .update(updateData)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao atualizar conta:', error)
        setError('Erro ao atualizar conta')
        return false
      }

      await refreshAccounts()
      return true
    } catch (err: any) {
      console.error('Erro ao atualizar conta:', err)
      setError(err.message || 'Erro inesperado ao atualizar conta')
      return false
    }
  }, [user, refreshAccounts])

  // Deletar conta
  const deleteAccount = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      // Verificar se há transações vinculadas
      const { data: transactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('account_id', id)
        .limit(1)

      if (checkError) {
        console.error('Erro ao verificar transações:', checkError)
        setError('Erro ao verificar transações da conta')
        return false
      }

      if (transactions && transactions.length > 0) {
        setError('Não é possível excluir conta com transações associadas')
        return false
      }

      const { error } = await supabase
        .from('accounts')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao deletar conta:', error)
        setError('Erro ao deletar conta')
        return false
      }

      await refreshAccounts()
      return true
    } catch (err: any) {
      console.error('Erro ao deletar conta:', err)
      setError(err.message || 'Erro inesperado ao deletar conta')
      return false
    }
  }, [user, refreshAccounts])

  // Definir conta padrão
  const setDefaultAccount = useCallback(async (id: string): Promise<boolean> => {
    if (!user) return false

    try {
      setError(null)

      const { error } = await supabase
        .from('accounts')
        .update({ is_default: true, updated_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Erro ao definir conta padrão:', error)
        setError('Erro ao definir conta padrão')
        return false
      }

      await refreshAccounts()
      return true
    } catch (err: any) {
      console.error('Erro ao definir conta padrão:', err)
      setError(err.message || 'Erro inesperado ao definir conta padrão')
      return false
    }
  }, [user, refreshAccounts])

  // Criar transferência entre contas
  const createTransfer = useCallback(async (data: AccountTransferData): Promise<AccountTransferResult> => {
    if (!user) {
      return { 
        from_transaction_id: '', 
        to_transaction_id: '', 
        success: false, 
        error: 'Usuário não autenticado' 
      }
    }

    try {
      setError(null)

      const { data: result, error } = await supabase
        .rpc('create_account_transfer', {
          p_user_id: user.id,
          p_from_account_id: data.from_account_id,
          p_to_account_id: data.to_account_id,
          p_amount: data.amount,
          p_description: data.description,
          p_date: data.date
        })

      if (error) {
        console.error('Erro ao criar transferência:', error)
        setError('Erro ao criar transferência')
        return { 
          from_transaction_id: '', 
          to_transaction_id: '', 
          success: false, 
          error: error.message 
        }
      }

      await refreshAccounts()
      
      return {
        from_transaction_id: result[0]?.from_transaction_id || '',
        to_transaction_id: result[0]?.to_transaction_id || '',
        success: true
      }
    } catch (err: any) {
      console.error('Erro ao criar transferência:', err)
      setError(err.message || 'Erro inesperado ao criar transferência')
      return { 
        from_transaction_id: '', 
        to_transaction_id: '', 
        success: false, 
        error: err.message 
      }
    }
  }, [user, refreshAccounts])

  // Buscar conta por ID
  const getAccountById = useCallback((id: string): Account | undefined => {
    return accounts.find(account => account.id === id)
  }, [accounts])

  // Calcular conta padrão
  const defaultAccount = accounts.find(account => account.is_default) || null

  useEffect(() => {
    refreshAccounts()
  }, [refreshAccounts])

  return {
    accounts,
    accountBalances,
    loading,
    error,
    defaultAccount,
    createAccount,
    updateAccount,
    deleteAccount,
    setDefaultAccount,
    createTransfer,
    refreshAccounts,
    getAccountById
  }
}

export default useAccounts 