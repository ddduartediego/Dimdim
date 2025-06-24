'use client'

import React from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  Box,
  Typography,
  Chip,
} from '@mui/material'
import { 
  AccountBalance,
  CreditCard,
} from '@mui/icons-material'
import useAccounts from '@/hooks/useAccounts'
import { formatCurrency } from '@/lib/utils'

interface AccountSelectProps {
  value: string | null
  onChange: (accountId: string | null) => void
  error?: boolean
  helperText?: string
  label?: string
  required?: boolean
  disabled?: boolean
  showBalance?: boolean
}

const AccountTypeIcons = {
  checking: AccountBalance,
  credit_card: CreditCard,
}

const AccountTypeLabels = {
  checking: 'Conta Corrente',
  credit_card: 'Cartão de Crédito',
}

export default function AccountSelect({
  value,
  onChange,
  error = false,
  helperText,
  label = 'Conta',
  required = false,
  disabled = false,
  showBalance = true
}: AccountSelectProps) {
  const { accounts, accountBalances, loading } = useAccounts()

  const getAccountBalance = (accountId: string) => {
    return accountBalances.find(balance => balance.id === accountId)
  }

  return (
    <FormControl 
      fullWidth 
      margin="normal" 
      error={error}
      disabled={disabled || loading}
      required={required}
    >
      <InputLabel>{label}</InputLabel>
      <Select
        value={value || ''}
        onChange={(e) => onChange(e.target.value || null)}
        label={label}
        renderValue={(selected) => {
          if (!selected) return ''
          
          const account = accounts.find(acc => acc.id === selected)
          if (!account) return selected

          const balance = getAccountBalance(account.id)
          const IconComponent = AccountTypeIcons[account.type]

          return (
            <Box display="flex" alignItems="center" gap={1}>
              <IconComponent sx={{ fontSize: 20, color: 'text.secondary' }} />
              <Typography variant="body2">
                {account.name}
                {showBalance && balance && (
                  <Typography 
                    component="span" 
                    variant="caption" 
                    color="text.secondary"
                    sx={{ ml: 1 }}
                  >
                    ({formatCurrency(balance.current_balance)})
                  </Typography>
                )}
              </Typography>
              {account.is_default && (
                <Chip 
                  label="Padrão" 
                  size="small" 
                  variant="outlined"
                  sx={{ ml: 'auto', fontSize: '0.6rem', height: 20 }}
                />
              )}
            </Box>
          )
        }}
      >
        <MenuItem value="">
          <Typography color="text.secondary" fontStyle="italic">
            Selecionar conta
          </Typography>
        </MenuItem>
        
        {accounts.map((account) => {
          const balance = getAccountBalance(account.id)
          const IconComponent = AccountTypeIcons[account.type]

          return (
            <MenuItem key={account.id} value={account.id}>
              <Box display="flex" alignItems="center" gap={1} width="100%">
                <IconComponent sx={{ fontSize: 20, color: 'text.secondary' }} />
                <Box flex={1}>
                  <Typography variant="body2">
                    {account.name}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {AccountTypeLabels[account.type]}
                    {showBalance && balance && (
                      <> • {formatCurrency(balance.current_balance)}</>
                    )}
                  </Typography>
                </Box>
                {account.is_default && (
                  <Chip 
                    label="Padrão" 
                    size="small" 
                    variant="outlined"
                    sx={{ fontSize: '0.6rem', height: 20 }}
                  />
                )}
              </Box>
            </MenuItem>
          )
        })}
        
        {accounts.length === 0 && !loading && (
          <MenuItem disabled>
            <Typography color="text.secondary" fontStyle="italic">
              Nenhuma conta cadastrada
            </Typography>
          </MenuItem>
        )}
      </Select>
      
      {helperText && (
        <FormHelperText>{helperText}</FormHelperText>
      )}
    </FormControl>
  )
} 