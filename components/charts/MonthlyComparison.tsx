'use client'

import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Icon,
  LinearProgress,
  Chip
} from '@mui/material'
import { MonthlyAnalytics } from '@/lib/analytics'
import { formatCurrency } from '@/lib/utils'
import dayjs from 'dayjs'

interface MonthlyComparisonProps {
  analytics: MonthlyAnalytics
}

export default function MonthlyComparison({ analytics }: MonthlyComparisonProps) {
  const { current_month, previous_month, comparison } = analytics

  const currentMonthName = dayjs()
    .month(current_month.month - 1)
    .format('MMMM')
    .toLowerCase()

  const previousMonthName = dayjs()
    .month(previous_month.month - 1)
    .format('MMMM')
    .toLowerCase()

  const getChangeIcon = (change: number) => {
    if (change > 0) return 'trending_up'
    if (change < 0) return 'trending_down'
    return 'trending_flat'
  }

  const getChangeColor = (change: number, isExpense = false) => {
    if (change === 0) return 'text.secondary'
    if (isExpense) {
      return change > 0 ? 'error.main' : 'success.main'
    }
    return change > 0 ? 'success.main' : 'error.main'
  }

  const formatChange = (change: number) => {
    const sign = change > 0 ? '+' : ''
    return `${sign}${formatCurrency(change)}`
  }

  const formatPercentageChange = (current: number, previous: number) => {
    if (previous === 0) return current > 0 ? '+100%' : '0%'
    const percentage = ((current - previous) / previous) * 100
    const sign = percentage > 0 ? '+' : ''
    return `${sign}${percentage.toFixed(1)}%`
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📈 Comparação Mensal
      </Typography>
      <Typography variant="body2" color="text.secondary" gutterBottom sx={{ mb: 3 }}>
        {currentMonthName} vs {previousMonthName} de {current_month.year}
      </Typography>

      <Grid container spacing={2}>
        {/* Receitas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Icon color="success">attach_money</Icon>
                <Typography variant="body2" fontWeight="bold">
                  Receitas
                </Typography>
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(current_month.total_income)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon
                  sx={{
                    fontSize: 16,
                    color: getChangeColor(comparison.income_change)
                  }}
                >
                  {getChangeIcon(comparison.income_change)}
                </Icon>
                <Typography
                  variant="body2"
                  sx={{ color: getChangeColor(comparison.income_change) }}
                >
                  {formatChange(comparison.income_change)}
                </Typography>
                <Chip
                  label={formatPercentageChange(
                    current_month.total_income,
                    previous_month.total_income
                  )}
                  size="small"
                  color={comparison.income_change > 0 ? 'success' : comparison.income_change < 0 ? 'error' : 'default'}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Mês anterior: {formatCurrency(previous_month.total_income)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Despesas */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Icon color="error">shopping_cart</Icon>
                <Typography variant="body2" fontWeight="bold">
                  Despesas
                </Typography>
              </Box>

              <Typography variant="h5" fontWeight="bold" sx={{ mb: 1 }}>
                {formatCurrency(current_month.total_expenses)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon
                  sx={{
                    fontSize: 16,
                    color: getChangeColor(comparison.expenses_change, true)
                  }}
                >
                  {getChangeIcon(comparison.expenses_change)}
                </Icon>
                <Typography
                  variant="body2"
                  sx={{ color: getChangeColor(comparison.expenses_change, true) }}
                >
                  {formatChange(comparison.expenses_change)}
                </Typography>
                <Chip
                  label={formatPercentageChange(
                    current_month.total_expenses,
                    previous_month.total_expenses
                  )}
                  size="small"
                  color={comparison.expenses_change < 0 ? 'success' : comparison.expenses_change > 0 ? 'error' : 'default'}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Mês anterior: {formatCurrency(previous_month.total_expenses)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Saldo */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                <Icon color="primary">account_balance</Icon>
                <Typography variant="body2" fontWeight="bold">
                  Saldo
                </Typography>
              </Box>

              <Typography 
                variant="h5" 
                fontWeight="bold" 
                sx={{ 
                  mb: 1,
                  color: current_month.balance >= 0 ? 'success.main' : 'error.main'
                }}
              >
                {formatCurrency(current_month.balance)}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                <Icon
                  sx={{
                    fontSize: 16,
                    color: getChangeColor(comparison.balance_change)
                  }}
                >
                  {getChangeIcon(comparison.balance_change)}
                </Icon>
                <Typography
                  variant="body2"
                  sx={{ color: getChangeColor(comparison.balance_change) }}
                >
                  {formatChange(comparison.balance_change)}
                </Typography>
                <Chip
                  label={formatPercentageChange(
                    current_month.balance,
                    previous_month.balance
                  )}
                  size="small"
                  color={comparison.balance_change > 0 ? 'success' : comparison.balance_change < 0 ? 'error' : 'default'}
                />
              </Box>

              <Typography variant="caption" color="text.secondary">
                Mês anterior: {formatCurrency(previous_month.balance)}
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        {/* Resumo de transações */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                📊 Resumo de Atividade
              </Typography>

              <Grid container spacing={2}>
                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {current_month.transaction_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Transações este mês
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {previous_month.transaction_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Transações mês anterior
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h6" 
                      fontWeight="bold"
                      sx={{
                        color: (current_month.transaction_count - previous_month.transaction_count) >= 0 
                          ? 'success.main' 
                          : 'error.main'
                      }}
                    >
                      {current_month.transaction_count - previous_month.transaction_count > 0 ? '+' : ''}
                      {current_month.transaction_count - previous_month.transaction_count}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Diferença
                    </Typography>
                  </Box>
                </Grid>

                <Grid item xs={6} sm={3}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h6" fontWeight="bold">
                      {current_month.categories?.length || 0}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Categorias utilizadas
                    </Typography>
                  </Box>
                </Grid>
              </Grid>

              {/* Barra de progresso de economia */}
              {current_month.total_income > 0 && (
                <Box sx={{ mt: 3 }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">
                      Taxa de Economia
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {(((current_month.total_income - current_month.total_expenses) / current_month.total_income) * 100).toFixed(1)}%
                    </Typography>
                  </Box>
                  <LinearProgress
                    variant="determinate"
                    value={Math.min(100, Math.max(0, ((current_month.total_income - current_month.total_expenses) / current_month.total_income) * 100))}
                    sx={{
                      height: 8,
                      borderRadius: 4,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        borderRadius: 4,
                        bgcolor: current_month.balance >= 0 ? 'success.main' : 'error.main'
                      }
                    }}
                  />
                  <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                    Meta recomendada: 20% de economia mensal
                  </Typography>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  )
} 