'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { supabase } from '@/lib/supabase'
import { formatCurrency } from '@/lib/utils'
import { DashboardData, TransactionWithCategory } from '@/types/database'
import {
  Box,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  AppBar,
  Toolbar,
  IconButton,
  CircularProgress,
  Container,
  Fab,
} from '@mui/material'
import {
  AccountBalanceWallet,
  TrendingUp,
  TrendingDown,
  Add,
  Logout,
  Receipt,
  Category,
  MonetizationOn,
  Upload,
} from '@mui/icons-material'

export default function DashboardPage() {
  const { user, signOut, loading: authLoading } = useAuth()
  const [loading, setLoading] = useState(true)
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalIncome: 0,
    totalExpenses: 0,
    balance: 0,
    recentTransactions: [],
    categoriesData: [],
  })
  const router = useRouter()

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  useEffect(() => {
    if (user) {
      fetchDashboardData()
    }
  }, [user])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)
      
      // Buscar todas as transações do usuário
      const { data: transactions, error } = await supabase
        .from('transactions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        console.error('Erro ao buscar transações:', error)
        return
      }

      // Calcular totais
      const totalIncome = transactions
        ?.filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const totalExpenses = transactions
        ?.filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0) || 0

      const balance = totalIncome - totalExpenses

      // Pegar as 5 transações mais recentes
      const recentTransactions = transactions?.slice(0, 5) || []

      setDashboardData({
        totalIncome,
        totalExpenses,
        balance,
        recentTransactions,
        categoriesData: [], // Será implementado na Fase 3
      })
    } catch (error) {
      console.error('Erro ao carregar dashboard:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = async () => {
    await signOut()
    router.push('/login')
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

  return (
    <Container maxWidth="lg">
        {/* Cards de Resumo */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {/* Saldo Total */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <AccountBalanceWallet 
                    color="primary" 
                    sx={{ fontSize: 40, mr: 2 }} 
                  />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Saldo Total
                    </Typography>
                    <Typography variant="h5" component="div">
                      {formatCurrency(dashboardData.balance)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Receitas */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingUp 
                    color="success" 
                    sx={{ fontSize: 40, mr: 2 }} 
                  />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Receitas
                    </Typography>
                    <Typography variant="h5" component="div" color="success.main">
                      {formatCurrency(dashboardData.totalIncome)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Despesas */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent>
                <Box display="flex" alignItems="center">
                  <TrendingDown 
                    color="error" 
                    sx={{ fontSize: 40, mr: 2 }} 
                  />
                  <Box>
                    <Typography color="text.secondary" gutterBottom>
                      Despesas
                    </Typography>
                    <Typography variant="h5" component="div" color="error.main">
                      {formatCurrency(dashboardData.totalExpenses)}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Transações Recentes */}
        <Card>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Transações Recentes
            </Typography>
            
            {dashboardData.recentTransactions.length === 0 ? (
              <Box textAlign="center" py={4}>
                <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  Nenhuma transação encontrada
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Comece adicionando sua primeira transação
                </Typography>
                <Button
                  variant="contained"
                  sx={{ mt: 2 }}
                  onClick={() => router.push('/transactions')}
                >
                  Adicionar Transação
                </Button>
              </Box>
            ) : (
              <Box>
                {dashboardData.recentTransactions.map((transaction) => (
                  <Box
                    key={transaction.id}
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    py={2}
                    borderBottom="1px solid"
                    borderColor="divider"
                  >
                    <Box>
                      <Typography variant="body1">
                        {transaction.description}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {new Date(transaction.date).toLocaleDateString('pt-BR')}
                      </Typography>
                    </Box>
                    <Typography
                      variant="h6"
                      color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                    >
                      {transaction.type === 'income' ? '+' : '-'}
                      {formatCurrency(transaction.amount)}
                    </Typography>
                  </Box>
                ))}
                
                <Box textAlign="center" mt={3} sx={{ display: 'flex', gap: 2, justifyContent: 'center' }}>
                  <Button
                    variant="outlined"
                    onClick={() => router.push('/transactions')}
                  >
                    Ver Todas as Transações
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Category />}
                    onClick={() => router.push('/categories')}
                  >
                    Categorias
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<MonetizationOn />}
                    onClick={() => router.push('/budgets')}
                  >
                    Orçamentos
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<TrendingUp />}
                    onClick={() => router.push('/reports')}
                  >
                    Relatórios
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<Upload />}
                    onClick={() => router.push('/import')}
                  >
                    Importar CSV
                  </Button>
                </Box>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Botão Flutuante */}
        <Fab
          color="primary"
          aria-label="add"
          sx={{
            position: 'fixed',
            bottom: 16,
            right: 16,
          }}
          onClick={() => router.push('/transactions')}
        >
          <Add />
        </Fab>
      </Container>
    )
} 