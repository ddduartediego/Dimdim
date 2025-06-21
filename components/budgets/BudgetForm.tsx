'use client'

import { useState, useEffect } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { budgetSchema, BudgetFormData } from '@/lib/validations'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Typography,
  IconButton,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Avatar,
  Icon,
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { Budget, Category } from '@/types/database'
import { formatCurrency } from '@/lib/utils'

interface BudgetFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: BudgetFormData) => Promise<void>
  budget?: Budget | null
  categories: Category[]
  loading?: boolean
  defaultMonth?: number
  defaultYear?: number
}

export default function BudgetForm({
  open,
  onClose,
  onSubmit,
  budget = null,
  categories,
  loading = false,
  defaultMonth,
  defaultYear,
}: BudgetFormProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<BudgetFormData>({
    resolver: zodResolver(budgetSchema),
    defaultValues: {
      category_id: budget?.category_id || '',
      amount: budget?.amount || 0,
      month: budget?.month || defaultMonth || new Date().getMonth() + 1,
      year: budget?.year || defaultYear || new Date().getFullYear(),
    },
  })

  const watchedCategoryId = watch('category_id')
  const watchedAmount = watch('amount')

  // Atualizar valores quando o budget muda
  useEffect(() => {
    if (budget) {
      setValue('category_id', budget.category_id)
      setValue('amount', budget.amount)
      setValue('month', budget.month)
      setValue('year', budget.year)
    } else {
      reset({
        category_id: '',
        amount: 0,
        month: defaultMonth || new Date().getMonth() + 1,
        year: defaultYear || new Date().getFullYear(),
      })
    }
  }, [budget, defaultMonth, defaultYear, setValue, reset])

  const handleClose = () => {
    reset()
    setError('')
    setSuccess('')
    onClose()
  }

  const handleFormSubmit = async (data: BudgetFormData) => {
    try {
      setError('')
      setSuccess('')
      await onSubmit(data)
      setSuccess(budget ? 'Orçamento atualizado com sucesso!' : 'Orçamento criado com sucesso!')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar orçamento')
    }
  }

  const selectedCategory = categories.find(cat => cat.id === watchedCategoryId)

  const months = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ]

  const currentYear = new Date().getFullYear()
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 2 + i)

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {budget ? 'Editar Orçamento' : 'Novo Orçamento'}
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <form onSubmit={handleSubmit(handleFormSubmit)}>
        <DialogContent dividers>
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

          {/* Preview do orçamento */}
          {selectedCategory && watchedAmount > 0 && (
            <Box
              sx={{
                p: 2,
                mb: 3,
                textAlign: 'center',
                bgcolor: selectedCategory.color + '10',
                border: `2px solid ${selectedCategory.color}20`,
                borderRadius: 2,
              }}
            >
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: selectedCategory.color + '20',
                  color: selectedCategory.color,
                  mx: 'auto',
                  mb: 1,
                }}
              >
                <Icon sx={{ fontSize: 24 }}>{selectedCategory.icon}</Icon>
              </Avatar>
              <Typography variant="h6" sx={{ color: selectedCategory.color }}>
                {selectedCategory.name}
              </Typography>
              <Typography variant="h5" fontWeight="bold">
                {formatCurrency(watchedAmount)}
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {months[watch('month') - 1]} {watch('year')}
              </Typography>
            </Box>
          )}

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="category_id"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.category_id}>
                    <InputLabel>Categoria *</InputLabel>
                    <Select
                      {...field}
                      label="Categoria *"
                      disabled={loading || isSubmitting}
                    >
                      {categories.map((category) => (
                        <MenuItem key={category.id} value={category.id}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Avatar
                              sx={{
                                width: 24,
                                height: 24,
                                bgcolor: category.color + '20',
                                color: category.color,
                              }}
                            >
                              <Icon sx={{ fontSize: 14 }}>{category.icon}</Icon>
                            </Avatar>
                            <Typography variant="body2">
                              {category.name}
                            </Typography>
                            {category.is_default && (
                              <Typography
                                variant="caption"
                                sx={{
                                  bgcolor: 'primary.main',
                                  color: 'white',
                                  px: 0.5,
                                  py: 0.25,
                                  borderRadius: 0.5,
                                  fontSize: '0.65rem',
                                  ml: 'auto',
                                }}
                              >
                                PADRÃO
                              </Typography>
                            )}
                          </Box>
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.category_id && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.category_id.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Controller
                name="amount"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Valor do orçamento"
                    type="number"
                    fullWidth
                    required
                    error={!!errors.amount}
                    helperText={errors.amount?.message}
                    disabled={loading || isSubmitting}
                    inputProps={{ 
                      step: '0.01', 
                      min: '0',
                      max: '999999.99' 
                    }}
                    InputProps={{
                      startAdornment: <Typography sx={{ mr: 1 }}>R$</Typography>,
                    }}
                  />
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="month"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.month}>
                    <InputLabel>Mês *</InputLabel>
                    <Select
                      {...field}
                      label="Mês *"
                      disabled={loading || isSubmitting}
                    >
                      {months.map((month, index) => (
                        <MenuItem key={index + 1} value={index + 1}>
                          {month}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.month && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.month.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>

            <Grid item xs={6}>
              <Controller
                name="year"
                control={control}
                render={({ field }) => (
                  <FormControl fullWidth error={!!errors.year}>
                    <InputLabel>Ano *</InputLabel>
                    <Select
                      {...field}
                      label="Ano *"
                      disabled={loading || isSubmitting}
                    >
                      {years.map((year) => (
                        <MenuItem key={year} value={year}>
                          {year}
                        </MenuItem>
                      ))}
                    </Select>
                    {errors.year && (
                      <Typography variant="caption" color="error" sx={{ mt: 1, ml: 2 }}>
                        {errors.year.message}
                      </Typography>
                    )}
                  </FormControl>
                )}
              />
            </Grid>
          </Grid>

          <Box sx={{ mt: 3, p: 2, bgcolor: 'info.light', borderRadius: 1 }}>
            <Typography variant="body2" color="info.dark">
              💡 <strong>Dica:</strong> Defina orçamentos realistas baseados no seu histórico de gastos. 
              Você receberá alertas quando atingir 50%, 80% e 100% do orçamento.
            </Typography>
          </Box>
        </DialogContent>

        <DialogActions>
          <Button onClick={handleClose} disabled={loading || isSubmitting}>
            Cancelar
          </Button>
          <Button
            type="submit"
            variant="contained"
            disabled={loading || isSubmitting}
            startIcon={isSubmitting && <CircularProgress size={16} />}
          >
            {budget ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 