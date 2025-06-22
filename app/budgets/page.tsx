'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { Budget, Category, BudgetProgress } from '@/types/database'
import { BudgetFormData } from '@/lib/validations'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  IconButton,
  Fab,
  Alert,
  CircularProgress,
  LinearProgress,
  Avatar,
  Icon,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  MonetizationOn,
  TrendingUp,
  Warning,
  CheckCircle,
  Error as ErrorIcon,
} from '@mui/icons-material'
import BudgetForm from '@/components/budgets/BudgetForm'

export default function BudgetsPage() {
  const { user, loading: authLoading } = useAuth()
  const [budgets, setBudgets] = useState<BudgetProgress[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [formOpen, setFormOpen] = useState(false)
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchData()
    }
  }, [user, selectedMonth, selectedYear])

  const fetchData = async () => {
    try {
      setLoading(true)
      setError('')

      // Buscar categorias
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name')

      if (categoriesError) {
        console.error('Erro ao carregar categorias:', categoriesError)
        throw new Error('Erro ao carregar categorias')
      }

      setCategories(categoriesData || [])

      // Buscar orçamentos com estatísticas
      const { data: budgetsData, error: budgetsError } = await supabase
        .from('budget_statistics')
        .select('*')
        .eq('month', selectedMonth)
        .eq('year', selectedYear)
        .order('category_name')

      if (budgetsError) {
        console.error('Erro ao carregar orçamentos:', budgetsError)
        throw new Error('Erro ao carregar orçamentos')
      }

      // Transformar dados em BudgetProgress
      const budgetProgresses: BudgetProgress[] = (budgetsData || []).map(stat => {
        const category = categoriesData?.find(c => c.id === stat.category_id)
        const budget: Budget = {
          id: stat.id,
          user_id: stat.user_id,
          category_id: stat.category_id,
          amount: stat.amount,
          month: stat.month,
          year: stat.year,
          created_at: stat.created_at,
          updated_at: stat.updated_at,
        }

        const percentage = stat.percentage_used
        let status: 'safe' | 'warning' | 'danger' | 'exceeded' = 'safe'
        
        if (percentage >= 100) status = 'exceeded'
        else if (percentage >= 80) status = 'danger'
        else if (percentage >= 50) status = 'warning'

        return {
          budget,
          category: category!,
          spent_amount: stat.spent_amount,
          percentage_used: percentage,
          remaining_amount: Math.max(0, stat.amount - stat.spent_amount),
          status,
        }
      })

      setBudgets(budgetProgresses)
    } catch (err) {
      console.error('Erro ao carregar dados:', err)
      setError(err instanceof Error ? err.message : 'Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async (data: BudgetFormData) => {
    try {
      if (data.month === 0) {
        // Verificar se já existem orçamentos para esta categoria no ano
        const { data: existingBudgets, error: checkError } = await supabase
          .from('budgets')
          .select('month')
          .eq('user_id', user!.id)
          .eq('category_id', data.category_id)
          .eq('year', data.year)

        if (checkError) {
          console.error('Erro ao verificar orçamentos existentes:', checkError)
          throw new Error('Erro ao verificar orçamentos existentes')
        }

        const existingMonths = existingBudgets?.map(b => b.month) || []
        const monthsToCreate = []
        
        for (let month = 1; month <= 12; month++) {
          if (!existingMonths.includes(month)) {
            monthsToCreate.push({
              category_id: data.category_id,
              amount: data.amount,
              month: month,
              year: data.year,
              user_id: user!.id,
            })
          }
        }

        if (monthsToCreate.length === 0) {
          throw new Error('Já existem orçamentos para todos os meses desta categoria no ano selecionado')
        }

        const { error: insertError } = await supabase
          .from('budgets')
          .insert(monthsToCreate)

        if (insertError) {
          console.error('Erro ao criar orçamentos:', insertError)
          throw new Error('Erro ao criar orçamentos para todos os meses')
        }

        const createdCount = monthsToCreate.length
        const skippedCount = 12 - createdCount
        
        let successMessage = `${createdCount} orçamento${createdCount > 1 ? 's' : ''} criado${createdCount > 1 ? 's' : ''}!`
        if (skippedCount > 0) {
          successMessage += ` (${skippedCount} já existia${skippedCount > 1 ? 'm' : ''})`
        }
        
        setSuccess(successMessage)
      } else {
        // Criar orçamento para um mês específico
        const { error: insertError } = await supabase
          .from('budgets')
          .insert({
            ...data,
            user_id: user!.id,
          })

        if (insertError) {
          console.error('Erro ao criar orçamento:', insertError)
          throw new Error('Erro ao criar orçamento')
        }
        
        setSuccess('Orçamento criado com sucesso!')
      }

      await fetchData()
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao criar orçamento')
    }
  }

  const handleUpdateBudget = async (data: BudgetFormData) => {
    if (!editingBudget) return

    try {
      const { error: updateError } = await supabase
        .from('budgets')
        .update({
          category_id: data.category_id,
          amount: data.amount,
          month: data.month,
          year: data.year,
        })
        .eq('id', editingBudget.id)

      if (updateError) {
        console.error('Erro ao atualizar orçamento:', updateError)
        throw new Error('Erro ao atualizar orçamento')
      }

      await fetchData()
      setSuccess('Orçamento atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      throw new Error(err instanceof Error ? err.message : 'Erro ao atualizar orçamento')
    }
  }

  const handleDeleteBudget = async (budget: Budget) => {
    if (!confirm(`Tem certeza que deseja excluir o orçamento?`)) {
      return
    }

    try {
      const { error: deleteError } = await supabase
        .from('budgets')
        .delete()
        .eq('id', budget.id)

      if (deleteError) {
        console.error('Erro ao excluir orçamento:', deleteError)
        throw new Error('Erro ao excluir orçamento')
      }

      await fetchData()
      setSuccess('Orçamento excluído com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao excluir orçamento')
      setTimeout(() => setError(''), 3000)
    }
  }

  const handleOpenForm = (budget?: Budget) => {
    setEditingBudget(budget || null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingBudget(null)
  }

  const handleFormSubmit = async (data: BudgetFormData) => {
    if (editingBudget) {
      await handleUpdateBudget(data)
    } else {
      await handleCreateBudget(data)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'safe':
        return <CheckCircle color="success" />
      case 'warning':
        return <Warning color="warning" />
      case 'danger':
        return <ErrorIcon color="error" />
      case 'exceeded':
        return <ErrorIcon color="error" />
      default:
        return <CheckCircle color="success" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'safe':
        return 'success'
      case 'warning':
        return 'warning'
      case 'danger':
        return 'error'
      case 'exceeded':
        return 'error'
      default:
        return 'success'
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

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() + i - 2)

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
        <Typography variant="h4" component="h1" fontWeight="bold">
          Orçamentos
        </Typography>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
          sx={{
            borderRadius: 2,
            textTransform: 'none',
            px: 3,
          }}
        >
          Novo Orçamento
        </Button>
      </Box>

      {/* Filtros */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Grid container spacing={3} alignItems="center">
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Mês</InputLabel>
                <Select
                  value={selectedMonth}
                  label="Mês"
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                >
                  {months.map((month, index) => (
                    <MenuItem key={index} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <FormControl fullWidth>
                <InputLabel>Ano</InputLabel>
                <Select
                  value={selectedYear}
                  label="Ano"
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {years.map((year) => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mensagens */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError('')}>
          {error}
        </Alert>
      )}

      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

      {/* Lista de Orçamentos */}
      <Grid container spacing={3}>
        {budgets.map((budgetProgress) => (
          <Grid item xs={12} md={6} lg={4} key={budgetProgress.budget.id}>
            <Card 
              sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                '&:hover': {
                  boxShadow: 4,
                  transform: 'translateY(-2px)',
                  transition: 'all 0.2s ease-in-out',
                }
              }}
            >
              <CardContent sx={{ flexGrow: 1 }}>
                <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <Avatar
                      sx={{
                        bgcolor: budgetProgress.category.color || '#1976d2',
                        width: 40,
                        height: 40,
                      }}
                    >
                      <Icon>{budgetProgress.category.icon || 'category'}</Icon>
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        {budgetProgress.category.name}
                      </Typography>
                      <Chip
                        size="small"
                        label={getStatusText(budgetProgress.status)}
                        color={getStatusColor(budgetProgress.status) as 'success' | 'warning' | 'error'}
                        icon={getStatusIcon(budgetProgress.status)}
                      />
                    </Box>
                  </Box>
                  <Box display="flex" gap={1}>
                    <IconButton
                      size="small"
                      onClick={() => handleOpenForm(budgetProgress.budget)}
                    >
                      <Edit />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={() => handleDeleteBudget(budgetProgress.budget)}
                    >
                      <Delete />
                    </IconButton>
                  </Box>
                </Box>

                <Box mb={2}>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Orçamento
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(budgetProgress.budget.amount)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Gasto
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(budgetProgress.spent_amount)}
                    </Typography>
                  </Box>
                  <Box display="flex" justifyContent="space-between" mb={2}>
                    <Typography variant="body2" color="text.secondary">
                      Restante
                    </Typography>
                    <Typography 
                      variant="body2" 
                      fontWeight="bold"
                      color={budgetProgress.remaining_amount < 0 ? 'error' : 'text.primary'}
                    >
                      {formatCurrency(budgetProgress.remaining_amount)}
                    </Typography>
                  </Box>
                </Box>

                <Box>
                  <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
                    <Typography variant="body2" color="text.secondary">
                      Progresso
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {budgetProgress.percentage_used.toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(budgetProgress.percentage_used, 100)}
                    color={getStatusColor(budgetProgress.status) as 'primary' | 'secondary' | 'success' | 'warning' | 'error'}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: 'rgba(0, 0, 0, 0.1)',
                    }}
                  />
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {budgets.length === 0 && (
        <Box
          display="flex"
          flexDirection="column"
          alignItems="center"
          justifyContent="center"
          py={8}
        >
          <MonetizationOn sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" mb={1}>
            Nenhum orçamento encontrado
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            Crie seu primeiro orçamento para começar a controlar seus gastos
          </Typography>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
          >
            Criar Orçamento
          </Button>
        </Box>
      )}

      {/* FAB para mobile */}
      <Fab
        color="primary"
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          display: { xs: 'flex', sm: 'none' },
        }}
        onClick={() => handleOpenForm()}
      >
        <Add />
      </Fab>

      {/* Modal de Formulário */}
      <BudgetForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        categories={categories}
        budget={editingBudget}
        defaultMonth={selectedMonth}
        defaultYear={selectedYear}
      />
    </Container>
  )
}

function getStatusText(status: string): string {
  switch (status) {
    case 'safe':
      return 'Seguro'
    case 'warning':
      return 'Atenção'
    case 'danger':
      return 'Perigo'
    case 'exceeded':
      return 'Excedido'
    default:
      return 'Seguro'
  }
} 