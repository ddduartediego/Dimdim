'use client'

import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import { Category, CategoryInsert } from '@/types/database'
import { CategoryFormData } from '@/lib/validations'

interface UseAdminCategoriesReturn {
  categories: Category[]
  loading: boolean
  error: string
  success: string
  createCategory: (data: CategoryFormData) => Promise<void>
  updateCategory: (id: string, data: CategoryFormData) => Promise<void>
  deleteCategory: (id: string) => Promise<void>
  clearMessages: () => void
}

export const useAdminCategories = (): UseAdminCategoriesReturn => {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const clearMessages = useCallback(() => {
    setError('')
    setSuccess('')
  }, [])

  const fetchDefaultCategories = useCallback(async () => {
    try {
      setLoading(true)
      setError('')

      // Buscar apenas categorias padrão (is_default = true)
      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .eq('is_default', true)
        .order('name')

      if (fetchError) {
        console.error('Erro ao buscar categorias padrão:', fetchError)
        setError('Erro ao carregar categorias padrão')
        return
      }

      setCategories(data || [])
    } catch (err) {
      console.error('Erro ao carregar categorias padrão:', err)
      setError('Erro inesperado ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = useCallback(async (data: CategoryFormData) => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      // Criar categoria padrão (user_id = null, is_default = true)
      const categoryData: CategoryInsert = {
        name: data.name,
        color: data.color,
        icon: data.icon,
        user_id: null, // Categorias padrão não pertencem a usuário específico
        is_default: true, // Marcar como categoria padrão
      }

      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoryData)

      if (insertError) {
        console.error('Erro ao criar categoria padrão:', insertError)
        throw new Error('Erro ao criar categoria padrão')
      }

      await fetchDefaultCategories()
      setSuccess('Categoria padrão criada com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao criar categoria padrão'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetchDefaultCategories])

  const updateCategory = useCallback(async (id: string, data: CategoryFormData) => {
    try {
      setError('')
      setSuccess('')
      setLoading(true)

      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: data.name,
          color: data.color,
          icon: data.icon,
        })
        .eq('id', id)
        .eq('is_default', true) // Garantir que só atualize categorias padrão

      if (updateError) {
        console.error('Erro ao atualizar categoria padrão:', updateError)
        throw new Error('Erro ao atualizar categoria padrão')
      }

      await fetchDefaultCategories()
      setSuccess('Categoria padrão atualizada com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao atualizar categoria padrão'
      setError(errorMessage)
      throw new Error(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [fetchDefaultCategories])

  const deleteCategory = useCallback(async (id: string) => {
    try {
      setError('')
      setSuccess('')

      const categoryToDelete = categories.find(cat => cat.id === id)
      if (!categoryToDelete) {
        throw new Error('Categoria não encontrada')
      }

      const confirmMessage = `Tem certeza que deseja excluir a categoria padrão "${categoryToDelete.name}"?\n\nEsta ação afetará todos os usuários do sistema e não pode ser desfeita.`
      
      if (!confirm(confirmMessage)) {
        return
      }

      setLoading(true)

      // Verificar se há transações usando esta categoria
      const { data: transactions, error: checkError } = await supabase
        .from('transactions')
        .select('id')
        .eq('category_id', id)
        .limit(1)

      if (checkError) {
        console.error('Erro ao verificar transações:', checkError)
        throw new Error('Erro ao verificar uso da categoria')
      }

      if (transactions && transactions.length > 0) {
        throw new Error('Não é possível excluir esta categoria pois ela está sendo usada em transações')
      }

      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', id)
        .eq('is_default', true) // Garantir que só delete categorias padrão

      if (deleteError) {
        console.error('Erro ao excluir categoria padrão:', deleteError)
        throw new Error('Erro ao excluir categoria padrão')
      }

      await fetchDefaultCategories()
      setSuccess('Categoria padrão excluída com sucesso!')
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao excluir categoria padrão'
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [categories, fetchDefaultCategories])

  useEffect(() => {
    fetchDefaultCategories()
  }, [fetchDefaultCategories])

  return {
    categories,
    loading,
    error,
    success,
    createCategory,
    updateCategory,
    deleteCategory,
    clearMessages
  }
} 