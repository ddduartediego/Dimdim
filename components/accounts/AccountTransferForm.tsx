'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Divider,
} from '@mui/material'
import {
  SwapHoriz,
  Save,
  Cancel,
} from '@mui/icons-material'
import { accountTransferSchema, AccountTransferFormData } from '@/lib/validations'
import { AccountTransferData } from '@/types/database'
import AccountSelect from './AccountSelect'
import dayjs from 'dayjs'

interface AccountTransferFormProps {
  onSubmit: (data: AccountTransferData) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

export default function AccountTransferForm({
  onSubmit,
  onCancel,
  loading = false,
  error = null
}: AccountTransferFormProps) {
  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm<AccountTransferFormData>({
    resolver: zodResolver(accountTransferSchema),
    defaultValues: {
      from_account_id: '',
      to_account_id: '',
      amount: 0,
      description: '',
      date: dayjs().format('YYYY-MM-DD'),
    }
  })

  const fromAccountId = watch('from_account_id')
  const toAccountId = watch('to_account_id')
  const amount = watch('amount')

  const handleFormSubmit = async (data: AccountTransferFormData) => {
    const transferData: AccountTransferData = {
      from_account_id: data.from_account_id,
      to_account_id: data.to_account_id,
      amount: data.amount,
      description: data.description,
      date: data.date
    }

    await onSubmit(transferData)
  }

  const handleSwapAccounts = () => {
    const temp = fromAccountId
    setValue('from_account_id', toAccountId)
    setValue('to_account_id', temp)
  }

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Transfira dinheiro entre suas contas. Será criada uma despesa na conta de origem e uma receita na conta de destino.
      </Typography>

      {/* Conta de origem */}
      <AccountSelect
        label="Conta de Origem"
        value={fromAccountId || null}
        onChange={(accountId) => setValue('from_account_id', accountId || '')}
        error={!!errors.from_account_id}
        helperText={errors.from_account_id?.message}
        required
        disabled={isSubmitting || loading}
      />

      {/* Botão para trocar contas */}
      <Box display="flex" justifyContent="center" my={1}>
        <Button
          variant="outlined"
          size="small"
          onClick={handleSwapAccounts}
          disabled={!fromAccountId || !toAccountId || isSubmitting || loading}
          startIcon={<SwapHoriz />}
        >
          Trocar
        </Button>
      </Box>

      {/* Conta de destino */}
      <AccountSelect
        label="Conta de Destino"
        value={toAccountId || null}
        onChange={(accountId) => setValue('to_account_id', accountId || '')}
        error={!!errors.to_account_id}
        helperText={errors.to_account_id?.message}
        required
        disabled={isSubmitting || loading}
      />

      <Divider sx={{ my: 3 }} />

      {/* Valor */}
      <TextField
        {...register('amount', { valueAsNumber: true })}
        label="Valor da Transferência"
        type="number"
        fullWidth
        margin="normal"
        error={!!errors.amount}
        helperText={errors.amount?.message}
        disabled={isSubmitting || loading}
        inputProps={{ 
          step: '0.01',
          min: '0.01',
          placeholder: '0,00'
        }}
        InputProps={{
          startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>R$</Typography>
        }}
      />

      {/* Descrição */}
      <TextField
        {...register('description')}
        label="Descrição"
        fullWidth
        margin="normal"
        multiline
        rows={2}
        error={!!errors.description}
        helperText={errors.description?.message}
        disabled={isSubmitting || loading}
        placeholder="Ex: Transferência para pagamento de fatura"
      />

      {/* Data */}
      <TextField
        {...register('date')}
        label="Data da Transferência"
        type="date"
        fullWidth
        margin="normal"
        error={!!errors.date}
        helperText={errors.date?.message}
        disabled={isSubmitting || loading}
        InputLabelProps={{ shrink: true }}
      />

      {/* Resumo da transferência */}
      {fromAccountId && toAccountId && amount > 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          <Typography variant="body2" fontWeight="medium">
            Resumo da Transferência
          </Typography>
          <Typography variant="body2">
            • Débito de {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(amount)} na conta de origem
          </Typography>
          <Typography variant="body2">
            • Crédito de {new Intl.NumberFormat('pt-BR', { 
              style: 'currency', 
              currency: 'BRL' 
            }).format(amount)} na conta de destino
          </Typography>
        </Alert>
      )}

      <Box display="flex" gap={2} justifyContent="flex-end" mt={3}>
        <Button
          onClick={onCancel}
          disabled={isSubmitting || loading}
          startIcon={<Cancel />}
          variant="outlined"
        >
          Cancelar
        </Button>
        
        <Button
          type="submit"
          variant="contained"
          disabled={isSubmitting || loading || !fromAccountId || !toAccountId}
          startIcon={
            isSubmitting || loading ? 
            <CircularProgress size={16} /> : 
            <SwapHoriz />
          }
        >
          {isSubmitting || loading ? 
            'Transferindo...' : 
            'Realizar Transferência'
          }
        </Button>
      </Box>
    </Box>
  )
} 