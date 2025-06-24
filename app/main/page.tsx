'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { transactionSchema, TransactionFormData } from '@/lib/validations'
import { supabase } from '@/lib/supabase'
import { formatCurrency, formatDate } from '@/lib/utils'
import { TransactionWithAccountAndCategory } from '@/types/database'
import { useDashboardData } from '@/hooks/useDashboardData'

import TransactionFilters from '@/components/transactions/TransactionFilters'
import CategorySelect from '@/components/categories/CategorySelect'
import CategoryChip from '@/components/categories/CategoryChip'
import AccountSelect from '@/components/accounts/AccountSelect'
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
  Chip,
  Alert,
  CircularProgress,
  Fab,
  Grid,
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Receipt,
  ChevronLeft,
  ChevronRight,
  Refresh,
} from '@mui/icons-material'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

export default function MainPage() {
  const { user, loading: authLoading } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingTransaction, setEditingTransaction] = useState<TransactionWithAccountAndCategory | null>(null)
  const [filteredTransactions, setFilteredTransactions] = useState<TransactionWithAccountAndCategory[]>([])
  const [selectedAccountId, setSelectedAccountId] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const router = useRouter()

  const {
    data: dashboardData,
    loading,
    error: dashboardError,
    refreshData
  } = useDashboardData(selectedMonth, selectedYear, selectedAccountId)

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  })

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login')
    }
  }, [user, authLoading, router])

  // Sincronizar transações filtradas com os dados do dashboard
  useEffect(() => {
    setFilteredTransactions(dashboardData.monthlyTransactions)
  }, [dashboardData.monthlyTransactions])

  const handleOpenDialog = (transaction?: TransactionWithAccountAndCategory) => {
    if (transaction) {
      setEditingTransaction(transaction)
      setValue('amount', transaction.amount)
      setValue('description', transaction.description)
      setValue('type', transaction.type)
      setValue('date', transaction.date)
      setValue('category_id', transaction.category_id)
      setValue('account_id', transaction.account_id)
    } else {
      setEditingTransaction(null)
      reset()
    }
    setDialogOpen(true)
  }

  const handleCloseDialog = () => {
    setDialogOpen(false)
    setEditingTransaction(null)
    reset()
    setError('')
    setSuccess('')
  }

  const onSubmit = async (data: TransactionFormData) => {
    try {
      setError('')
      setSuccess('')

      if (editingTransaction) {
        // Atualizar transação existente
        const { error } = await supabase
          .from('transactions')
          .update({
            amount: data.amount,
            description: data.description,
            type: data.type,
            date: data.date,
            category_id: data.category_id,
            account_id: data.account_id,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingTransaction.id)

        if (error) {
          setError('Erro ao atualizar transação')
          return
        }

        setSuccess('Transação atualizada com sucesso!')
      } else {
        // Criar nova transação
        const { error } = await supabase
          .from('transactions')
          .insert({
            amount: data.amount,
            description: data.description,
            type: data.type,
            date: data.date,
            category_id: data.category_id,
            account_id: data.account_id,
            user_id: user!.id,
          })

        if (error) {
          setError('Erro ao criar transação')
          return
        }

        setSuccess('Transação criada com sucesso!')
      }

      await refreshData()
      setTimeout(() => {
        handleCloseDialog()
      }, 1500)
    } catch (err) {
      console.error('Erro ao salvar transação:', err)
      setError('Erro inesperado ao salvar transação')
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir esta transação?')) {
      return
    }

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)

      if (error) {
        setError('Erro ao excluir transação')
        return
      }

      await refreshData()
      setSuccess('Transação excluída com sucesso!')
      setTimeout(() => setSuccess(''), 3000)
    } catch (err) {
      console.error('Erro ao excluir transação:', err)
      setError('Erro inesperado ao excluir transação')
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

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          🏠 Início
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Gerencie suas finanças de forma simples e eficiente
        </Typography>
      </Box>

      {/* Filtros */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          📅 Filtros
        </Typography>
        
        <Grid container spacing={3} alignItems="center">
          {/* Filtro de Período */}
          <Grid item xs={12} lg={8}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <Typography variant="body1" sx={{ fontWeight: 500 }}>
                Período: {dayjs().year(selectedYear).month(selectedMonth - 1).format('MMMM [de] YYYY')}
              </Typography>

              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                 <IconButton
                   onClick={() => {
                     const currentDate = dayjs().year(selectedYear).month(selectedMonth - 1)
                     const newDate = currentDate.subtract(1, 'month')
                     setSelectedMonth(newDate.month() + 1)
                     setSelectedYear(newDate.year())
                   }}
                   size="small"
                   disabled={loading}
                 >
                   <ChevronLeft />
                 </IconButton>

                <FormControl size="small" sx={{ minWidth: 120 }}>
                  <InputLabel>Mês</InputLabel>
                  <Select
                    value={selectedMonth}
                    label="Mês"
                    onChange={(e) => setSelectedMonth(e.target.value as number)}
                    disabled={loading}
                  >
                    {Array.from({ length: 12 }, (_, i) => (
                      <MenuItem key={i + 1} value={i + 1}>
                        {dayjs().month(i).format('MMMM')}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl size="small" sx={{ minWidth: 100 }}>
                  <InputLabel>Ano</InputLabel>
                  <Select
                    value={selectedYear}
                    label="Ano"
                    onChange={(e) => setSelectedYear(e.target.value as number)}
                    disabled={loading}
                  >
                    {Array.from({ length: 5 }, (_, i) => dayjs().year() - 2 + i).map(year => (
                      <MenuItem key={year} value={year}>
                        {year}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                                 <IconButton
                   onClick={() => {
                     const currentDate = dayjs().year(selectedYear).month(selectedMonth - 1)
                     const newDate = currentDate.add(1, 'month')
                     setSelectedMonth(newDate.month() + 1)
                     setSelectedYear(newDate.year())
                   }}
                   size="small"
                   disabled={loading}
                 >
                   <ChevronRight />
                 </IconButton>

                 <Button
                   variant="outlined"
                   onClick={refreshData}
                   disabled={loading}
                   startIcon={loading ? <CircularProgress size={16} /> : <Refresh />}
                   size="small"
                 >
                   {loading ? 'Carregando...' : 'Atualizar'}
                 </Button>
              </Box>
            </Box>
          </Grid>

          {/* Filtro por Conta */}
          <Grid item xs={12} lg={4}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
              <AccountSelect
                value={selectedAccountId}
                onChange={setSelectedAccountId}
                label="Filtrar por Conta"
                showBalance={false}
              />
              
              {selectedAccountId && (
                <Button
                  variant="outlined"
                  onClick={() => setSelectedAccountId(null)}
                  size="small"
                >
                  Limpar
                </Button>
              )}
            </Box>
          </Grid>
        </Grid>

        {/* Contador de transações */}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {filteredTransactions.length} transaç{filteredTransactions.length === 1 ? 'ão' : 'ões'} encontrada{filteredTransactions.length === 1 ? '' : 's'}
          </Typography>
        </Box>
      </Paper>

      {/* Alertas */}
      {(error || dashboardError) && (
        <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError('')}>
          {error || dashboardError}
        </Alert>
      )}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess('')}>
          {success}
        </Alert>
      )}

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
                    Saldo do Mês
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

      {/* Lista de Transações */}
      <Card>
        <CardContent>
          <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
            <Typography variant="h5">
              Transações do Período ({filteredTransactions.length}/{dashboardData.transactionCount})
            </Typography>
            <Button
              variant="contained"
              startIcon={<Add />}
              onClick={() => handleOpenDialog()}
            >
              Nova Transação
            </Button>
          </Box>

          {/* Filtros de Transações */}
          {dashboardData.monthlyTransactions.length > 0 && (
            <TransactionFilters
              transactions={dashboardData.monthlyTransactions}
              onFiltersChange={setFilteredTransactions}
              selectedMonth={selectedMonth}
              selectedYear={selectedYear}
            />
          )}

          {dashboardData.monthlyTransactions.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma transação encontrada neste período
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Adicione sua primeira transação para este mês
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={() => handleOpenDialog()}
              >
                Adicionar Transação
              </Button>
            </Box>
          ) : filteredTransactions.length === 0 ? (
            <Box textAlign="center" py={6}>
              <Receipt sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                Nenhuma transação encontrada com os filtros aplicados
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Ajuste os filtros para ver outras transações
              </Typography>
            </Box>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Conta</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell align="right">Valor</TableCell>
                    <TableCell align="center">Ações</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredTransactions.map((transaction) => (
                    <TableRow key={transaction.id}>
                      <TableCell>
                        {formatDate(transaction.date)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body1">
                          {transaction.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <CategoryChip
                          category={transaction.category_id ? {
                            id: transaction.category_id,
                            name: transaction.category_name || 'Categoria',
                            color: transaction.category_color || '#1976D2',
                            icon: transaction.category_icon || 'category',
                            user_id: transaction.user_id,
                            is_default: false,
                            created_at: '',
                            updated_at: '',
                          } : null}
                        />
                      </TableCell>
                      <TableCell>
                        {transaction.account_name ? (
                          <Chip
                            icon={transaction.account_type === 'checking' ? <AccountBalanceWallet /> : <Receipt />}
                            label={transaction.account_name}
                            size="small"
                            variant="outlined"
                            sx={{ 
                              color: transaction.account_type === 'checking' ? 'primary.main' : 'secondary.main',
                              borderColor: transaction.account_type === 'checking' ? 'primary.main' : 'secondary.main'
                            }}
                          />
                        ) : (
                          <Typography variant="caption" color="text.secondary">
                            Sem conta
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell>
                        <Chip
                          icon={transaction.type === 'income' ? <TrendingUp /> : <TrendingDown />}
                          label={transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          color={transaction.type === 'income' ? 'success' : 'error'}
                          size="small"
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Typography
                          variant="h6"
                          color={transaction.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {transaction.type === 'income' ? '+' : '-'}
                          {formatCurrency(transaction.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <IconButton
                          onClick={() => handleOpenDialog(transaction)}
                          color="primary"
                        >
                          <Edit />
                        </IconButton>
                        <IconButton
                          onClick={() => handleDelete(transaction.id)}
                          color="error"
                        >
                          <Delete />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Botão Flutuante */}
      <Fab
        color="primary"
        aria-label="add transaction"
        sx={{
          position: 'fixed',
          bottom: 16,
          right: 16,
        }}
        onClick={() => handleOpenDialog()}
      >
        <Add />
      </Fab>

      {/* Dialog de Formulário */}
      <Dialog open={dialogOpen} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editingTransaction ? 'Editar Transação' : 'Nova Transação'}
        </DialogTitle>
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogContent>
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                {success}
              </Alert>
            )}

            <TextField
              {...register('amount', { valueAsNumber: true })}
              label="Valor"
              type="number"
              fullWidth
              margin="normal"
              error={!!errors.amount}
              helperText={errors.amount?.message}
              disabled={isSubmitting}
              inputProps={{ step: '0.01', min: '0' }}
            />

            <TextField
              {...register('description')}
              label="Descrição"
              fullWidth
              margin="normal"
              multiline
              rows={2}
              error={!!errors.description}
              helperText={errors.description?.message}
              disabled={isSubmitting}
            />

            <CategorySelect
              value={watch('category_id') || null}
              onChange={(categoryId) => setValue('category_id', categoryId)}
              error={!!errors.category_id}
              helperText={errors.category_id?.message}
            />

            <AccountSelect
              value={watch('account_id') || null}
              onChange={(accountId) => setValue('account_id', accountId)}
              error={!!errors.account_id}
              helperText={errors.account_id?.message}
              required
            />

            <FormControl fullWidth margin="normal" error={!!errors.type}>
              <InputLabel>Tipo</InputLabel>
              <Select
                value={watch('type') || ''}
                onChange={(e) => setValue('type', e.target.value as 'income' | 'expense')}
                label="Tipo"
                disabled={isSubmitting}
              >
                <MenuItem value="income">Receita</MenuItem>
                <MenuItem value="expense">Despesa</MenuItem>
              </Select>
              {errors.type && (
                <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                  {errors.type?.message}
                </Typography>
              )}
            </FormControl>

            <TextField
              {...register('date')}
              label="Data"
              type="date"
              fullWidth
              margin="normal"
              error={!!errors.date}
              helperText={errors.date?.message}
              disabled={isSubmitting}
              InputLabelProps={{ shrink: true }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={isSubmitting}>
              Cancelar
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              disabled={isSubmitting}
              startIcon={isSubmitting ? <CircularProgress size={16} /> : null}
            >
              {isSubmitting ? 'Salvando...' : editingTransaction ? 'Atualizar' : 'Criar'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  )
} 