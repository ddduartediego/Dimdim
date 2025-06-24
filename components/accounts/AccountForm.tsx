'use client'

import React from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import {
  Box,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormControlLabel,
  Switch,
  Button,
  Alert,
  CircularProgress,
  Typography,
  FormHelperText,
} from '@mui/material'
import {
  AccountBalance,
  CreditCard,
  Save,
  Cancel,
} from '@mui/icons-material'
import { accountSchema, AccountFormData } from '@/lib/validations'
import { Account } from '@/types/database'

interface AccountFormProps {
  account?: Account | null
  onSubmit: (data: AccountFormData) => Promise<boolean>
  onCancel: () => void
  loading?: boolean
  error?: string | null
}

const AccountTypeOptions = [
  {
    value: 'checking' as const,
    label: 'Conta Corrente',
    icon: AccountBalance,
    description: 'Conta bancária para movimentações diárias'
  },
  {
    value: 'credit_card' as const,
    label: 'Cartão de Crédito',
    icon: CreditCard,
    description: 'Cartão de crédito para compras parceladas'
  }
]

export default function AccountForm({
  account = null,
  onSubmit,
  onCancel,
  loading = false,
  error = null
}: AccountFormProps) {
  const isEditing = !!account

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
    defaultValues: {
      name: account?.name || '',
      type: account?.type || 'checking',
      initial_balance: account?.initial_balance || 0,
      is_default: account?.is_default || false,
    }
  })

  const selectedType = watch('type')
  const isDefault = watch('is_default')

  const handleFormSubmit = async (data: AccountFormData) => {
    const success = await onSubmit(data)
    if (success && !isEditing) {
      reset()
    }
  }

  const selectedTypeInfo = AccountTypeOptions.find(opt => opt.value === selectedType)

  return (
    <Box component="form" onSubmit={handleSubmit(handleFormSubmit)}>
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      <TextField
        {...register('name')}
        label="Nome da Conta"
        fullWidth
        margin="normal"
        error={!!errors.name}
        helperText={errors.name?.message}
        disabled={isSubmitting || loading}
        placeholder="Ex: Conta Santander, Cartão Nubank"
      />

      <FormControl 
        fullWidth 
        margin="normal" 
        error={!!errors.type}
        disabled={isSubmitting || loading}
      >
        <InputLabel>Tipo de Conta</InputLabel>
        <Select
          {...register('type')}
          label="Tipo de Conta"
          value={selectedType}
          onChange={(e) => setValue('type', e.target.value as 'checking' | 'credit_card')}
        >
          {AccountTypeOptions.map((option) => {
            const IconComponent = option.icon
            return (
              <MenuItem key={option.value} value={option.value}>
                <Box display="flex" alignItems="center" gap={1}>
                  <IconComponent sx={{ fontSize: 20, color: 'text.secondary' }} />
                  <Box>
                    <Typography variant="body2">
                      {option.label}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {option.description}
                    </Typography>
                  </Box>
                </Box>
              </MenuItem>
            )
          })}
        </Select>
        {errors.type && (
          <FormHelperText>{errors.type.message}</FormHelperText>
        )}
      </FormControl>

      <TextField
        {...register('initial_balance', { valueAsNumber: true })}
        label="Saldo Inicial"
        type="number"
        fullWidth
        margin="normal"
        error={!!errors.initial_balance}
        helperText={errors.initial_balance?.message || 'O saldo atual será calculado automaticamente'}
        disabled={isSubmitting || loading}
        inputProps={{ 
          step: '0.01',
          placeholder: '0,00'
        }}
        InputProps={{
          startAdornment: <Typography color="text.secondary" sx={{ mr: 1 }}>R$</Typography>
        }}
      />

      <FormControlLabel
        control={
          <Switch
            {...register('is_default')}
            checked={isDefault}
            onChange={(e) => setValue('is_default', e.target.checked)}
            disabled={isSubmitting || loading}
          />
        }
        label={
          <Box>
            <Typography variant="body2">
              Definir como conta padrão
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Será selecionada automaticamente em novas transações
            </Typography>
          </Box>
        }
        sx={{ mt: 2, mb: 1, width: '100%', justifyContent: 'space-between' }}
      />

      {selectedTypeInfo && (
        <Alert severity="info" sx={{ mt: 2, mb: 2 }}>
          <Box display="flex" alignItems="center" gap={1}>
            <selectedTypeInfo.icon sx={{ fontSize: 20 }} />
            <Box>
              <Typography variant="body2" fontWeight="medium">
                {selectedTypeInfo.label}
              </Typography>
              <Typography variant="caption">
                {selectedTypeInfo.description}
              </Typography>
            </Box>
          </Box>
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
          disabled={isSubmitting || loading}
          startIcon={
            isSubmitting || loading ? 
            <CircularProgress size={16} /> : 
            <Save />
          }
        >
          {isSubmitting || loading ? 
            'Salvando...' : 
            isEditing ? 'Atualizar Conta' : 'Criar Conta'
          }
        </Button>
      </Box>
    </Box>
  )
} 