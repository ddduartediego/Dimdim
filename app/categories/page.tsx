'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { Category, CategoryInsert } from '@/types/database'
import { CategoryFormData } from '@/lib/validations'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  AppBar,
  Toolbar,
  Fab,
  Alert,
  CircularProgress,
  Avatar,
  Icon,
  Chip,
} from '@mui/material'
import {
  ArrowBack,
  Add,
  Edit,
  Delete,
  Category as CategoryIcon,
} from '@mui/icons-material'
import CategoryForm from '@/components/categories/CategoryForm'
import CategoryChip from '@/components/categories/CategoryChip'

export default function CategoriesPage() {
  const { user, loading: authLoading } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchCategories()
    }
  }, [user])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      setError('')

      const { data, error: fetchError } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name')

      if (fetchError) {
        console.error('Erro ao buscar categorias:', fetchError)
        setError('Erro ao carregar categorias')
        return
      }

      setCategories(data || [])
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
      setError('Erro inesperado ao carregar categorias')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateCategory = async (data: CategoryFormData) => {
    try {
      const categoryData = {
        ...data,
        user_id: user!.id,
        is_default: false,
      }

      const { error: insertError } = await supabase
        .from('categories')
        .insert(categoryData)

      if (insertError) {
        console.error('Erro ao criar categoria:', insertError)
        throw new Error('Erro ao criar categoria')
      }

      await fetchCategories()
      setSuccess('Categoria criada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar categoria')
    }
  }

  const handleUpdateCategory = async (data: CategoryFormData) => {
    if (!editingCategory) return

    try {
      const { error: updateError } = await supabase
        .from('categories')
        .update({
          name: data.name,
          color: data.color,
          icon: data.icon,
        })
        .eq('id', editingCategory.id)

      if (updateError) {
        console.error('Erro ao atualizar categoria:', updateError)
        throw new Error('Erro ao atualizar categoria')
      }

      await fetchCategories()
      setSuccess('Categoria atualizada com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar categoria')
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    if (category.is_default) {
      setError('Categorias padrão não podem ser excluídas')
      setTimeout(() => setError(''), 3000)
      return
    }

    if (!confirm(`Tem certeza que deseja excluir a categoria "${category.name}"?`)) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('categories')
        .delete()
        .eq('id', category.id)

      if (deleteError) {
        console.error('Erro ao excluir categoria:', deleteError)
        throw new Error('Erro ao excluir categoria')
      }

      await fetchCategories()
      setSuccess('Categoria excluída com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir categoria')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleOpenForm = (category?: Category) => {
    setEditingCategory(category || null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingCategory(null)
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await handleUpdateCategory(data)
    } else {
      await handleCreateCategory(data)
    }
  }

  if (authLoading || loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <CircularProgress size={60} />
      </Box>
    )
  }

  if (!user) {
    return null
  }

  // Separar categorias padrão das personalizadas
  const defaultCategories = categories.filter(cat => cat.is_default)
  const userCategories = categories.filter(cat => !cat.is_default)

  return (
    <Container maxWidth="lg">
        {/* Alertas */}
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            {success}
          </Alert>
        )}

        {/* Categorias Padrão */}
        {defaultCategories.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon>star</Icon>
              Categorias Padrão
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Categorias pré-definidas do sistema. Estas não podem ser editadas ou excluídas.
            </Typography>
            
            <Grid container spacing={2}>
              {defaultCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: category.color + '20',
                            color: category.color,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Icon sx={{ fontSize: 24 }}>{category.icon}</Icon>
                        </Avatar>
                        <Box>
                          <Typography variant="h6">
                            {category.name}
                          </Typography>
                          <Chip 
                            label="PADRÃO" 
                            size="small" 
                            color="primary" 
                            variant="filled"
                          />
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Categorias Personalizadas */}
        <Box>
          <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon>folder</Icon>
            Minhas Categorias
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Categorias personalizadas criadas por você. Você pode editar, excluir e criar novas.
          </Typography>

          {userCategories.length === 0 ? (
            <Card elevation={1}>
              <CardContent sx={{ textAlign: 'center', py: 6 }}>
                <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary" gutterBottom>
                  Nenhuma categoria personalizada
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                  Crie suas próprias categorias para organizar melhor suas transações
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<Add />}
                  onClick={() => handleOpenForm()}
                >
                  Criar primeira categoria
                </Button>
              </CardContent>
            </Card>
          ) : (
            <Grid container spacing={2}>
              {userCategories.map((category) => (
                <Grid item xs={12} sm={6} md={4} key={category.id}>
                  <Card elevation={1}>
                    <CardContent>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                        <Avatar
                          sx={{
                            bgcolor: category.color + '20',
                            color: category.color,
                            width: 48,
                            height: 48,
                          }}
                        >
                          <Icon sx={{ fontSize: 24 }}>{category.icon}</Icon>
                        </Avatar>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="h6">
                            {category.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            Personalizada
                          </Typography>
                        </Box>
                        <Box>
                          <IconButton
                            size="small"
                            onClick={() => handleOpenForm(category)}
                            sx={{ color: category.color }}
                          >
                            <Edit />
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteCategory(category)}
                            color="error"
                          >
                            <Delete />
                          </IconButton>
                        </Box>
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </Box>

        {/* FAB para criar nova categoria */}
        <Fab
          color="primary"
          aria-label="add"
          onClick={() => handleOpenForm()}
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
        >
          <Add />
        </Fab>

        {/* Formulário de categoria */}
        <CategoryForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          category={editingCategory}
        />
      </Container>
    )
} 