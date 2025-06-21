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
  AppBar,
  Toolbar,
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
  ArrowBack,
  Add,
  Edit,
  Delete,
  MonetizationOn,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
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
        throw new Error(categoriesError.message)
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
        throw new Error(budgetsError.message)
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
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err)
      setError(err.message || 'Erro inesperado ao carregar dados')
    } finally {
      setLoading(false)
    }
  }

  const handleCreateBudget = async (data: BudgetFormData) => {
    try {
      const { error: insertError } = await supabase
        .from('budgets')
        .insert({
          ...data,
          user_id: user!.id,
        })

      if (insertError) {
        throw new Error(insertError.message)
      }

      await fetchData()
      setSuccess('Orçamento criado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao criar orçamento')
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
        throw new Error(updateError.message)
      }

      await fetchData()
      setSuccess('Orçamento atualizado com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      throw new Error(err.message || 'Erro ao atualizar orçamento')
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
        throw new Error(deleteError.message)
      }

      await fetchData()
      setSuccess('Orçamento excluído com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err: any) {
      setError(err.message || 'Erro ao excluir orçamento')
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
        return <Error color="error" />
      case 'exceeded':
        return <Error color="error" />
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

  const totalBudget = budgets.reduce((sum, b) => sum + b.budget.amount, 0)
  const totalSpent = budgets.reduce((sum, b) => sum + b.spent_amount, 0)
  const totalRemaining = totalBudget - totalSpent

  return (
    <Container maxWidth="lg">
        {/* Controles de Período */}
        <Card sx={{ mb: 3 }}>
          <CardContent>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap' }}>
              <Typography variant="h6">Período:</Typography>
              
              <FormControl size="small" sx={{ minWidth: 120 }}>
                <InputLabel>Mês</InputLabel>
                <Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  label="Mês"
                >
                  {months.map((month, index) => (
                    <MenuItem key={index + 1} value={index + 1}>
                      {month}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <FormControl size="small" sx={{ minWidth: 100 }}>
                <InputLabel>Ano</InputLabel>
                <Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  label="Ano"
                >
                  {Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - 2 + i).map(year => (
                    <MenuItem key={year} value={year}>
                      {year}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenForm()}
              >
                Novo Orçamento
              </Button>
            </Box>
          </CardContent>
        </Card>

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

        {/* Resumo Geral */}
        {budgets.length > 0 && (
          <Grid container spacing={3} sx={{ mb: 4 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <TrendingUp color="primary" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Orçado
                      </Typography>
                      <Typography variant="h5" component="div">
                        {formatCurrency(totalBudget)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <MonetizationOn color="warning" sx={{ fontSize: 40, mr: 2 }} />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Total Gasto
                      </Typography>
                      <Typography variant="h5" component="div" color="warning.main">
                        {formatCurrency(totalSpent)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box display="flex" alignItems="center">
                    <CheckCircle 
                      color={totalRemaining >= 0 ? "success" : "error"} 
                      sx={{ fontSize: 40, mr: 2 }} 
                    />
                    <Box>
                      <Typography color="text.secondary" gutterBottom>
                        Restante
                      </Typography>
                      <Typography 
                        variant="h5" 
                        component="div" 
                        color={totalRemaining >= 0 ? "success.main" : "error.main"}
                      >
                        {formatCurrency(totalRemaining)}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        )}

        {/* Lista de Orçamentos */}
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <MonetizationOn />
          Orçamentos de {months[selectedMonth - 1]} {selectedYear}
        </Typography>

        {budgets.length === 0 ? (
          <Card elevation={1}>
            <CardContent sx={{ textAlign: 'center', py: 6 }}>
              <MonetizationOn sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhum orçamento definido
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                Comece criando orçamentos para suas categorias e controle melhor seus gastos
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenForm()}
              >
                Criar primeiro orçamento
              </Button>
            </CardContent>
          </Card>
        ) : (
          <Grid container spacing={3}>
            {budgets.map((budgetProgress) => (
              <Grid item xs={12} md={6} lg={4} key={budgetProgress.budget.id}>
                <Card elevation={2}>
                  <CardContent>
                    {/* Header do Card */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
                      <Avatar
                        sx={{
                          bgcolor: budgetProgress.category.color + '20',
                          color: budgetProgress.category.color,
                          width: 40,
                          height: 40,
                        }}
                      >
                        <Icon sx={{ fontSize: 20 }}>{budgetProgress.category.icon}</Icon>
                      </Avatar>
                      <Box sx={{ flexGrow: 1 }}>
                        <Typography variant="h6">
                          {budgetProgress.category.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {formatCurrency(budgetProgress.budget.amount)} orçado
                        </Typography>
                      </Box>
                      <Box>
                        <IconButton
                          size="small"
                          onClick={() => handleOpenForm(budgetProgress.budget)}
                          sx={{ color: budgetProgress.category.color }}
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          size="small"
                          onClick={() => handleDeleteBudget(budgetProgress.budget)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </Box>
                    </Box>

                    {/* Progress Bar */}
                    <Box sx={{ mb: 2 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                        <Typography variant="body2">
                          Progresso
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                          {getStatusIcon(budgetProgress.status)}
                          <Typography variant="body2" fontWeight="bold">
                            {budgetProgress.percentage_used.toFixed(1)}%
                          </Typography>
                        </Box>
                      </Box>
                      <LinearProgress
                        variant="determinate"
                        value={Math.min(budgetProgress.percentage_used, 100)}
                        color={getStatusColor(budgetProgress.status) as any}
                        sx={{ height: 8, borderRadius: 1 }}
                      />
                    </Box>

                    {/* Estatísticas */}
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                      <Box>
                        <Typography variant="caption" color="text.secondary">
                          Gasto
                        </Typography>
                        <Typography variant="body2" fontWeight="bold" color="warning.main">
                          {formatCurrency(budgetProgress.spent_amount)}
                        </Typography>
                      </Box>
                      <Box sx={{ textAlign: 'right' }}>
                        <Typography variant="caption" color="text.secondary">
                          Restante
                        </Typography>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold" 
                          color={budgetProgress.remaining_amount >= 0 ? "success.main" : "error.main"}
                        >
                          {formatCurrency(budgetProgress.remaining_amount)}
                        </Typography>
                      </Box>
                    </Box>

                    {/* Status Chip */}
                    <Box sx={{ textAlign: 'center' }}>
                      <Chip
                        icon={getStatusIcon(budgetProgress.status)}
                        label={
                          budgetProgress.status === 'safe' ? 'No controle' :
                          budgetProgress.status === 'warning' ? 'Atenção' :
                          budgetProgress.status === 'danger' ? 'Limite próximo' :
                          'Orçamento excedido'
                        }
                        color={getStatusColor(budgetProgress.status) as any}
                        size="small"
                        variant="filled"
                      />
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        )}

        {/* FAB para criar novo orçamento */}
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

        {/* Formulário de orçamento */}
        <BudgetForm
          open={formOpen}
          onClose={handleCloseForm}
          onSubmit={handleFormSubmit}
          budget={editingBudget}
          categories={categories}
          defaultMonth={selectedMonth}
          defaultYear={selectedYear}
        />
      </Container>
    )
} 