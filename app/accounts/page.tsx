'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Container,
  Typography,
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Alert,
} from '@mui/material'
import { ArrowBack } from '@mui/icons-material'
import AccountsList from '@/components/accounts/AccountsList'
import AccountForm from '@/components/accounts/AccountForm'
import AccountTransferForm from '@/components/accounts/AccountTransferForm'
import useAccounts from '@/hooks/useAccounts'
import { Account, AccountFormData, AccountTransferData } from '@/types/database'

type DialogMode = 'create' | 'edit' | 'transfer' | null

export default function AccountsPage() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const { 
    createAccount, 
    updateAccount, 
    createTransfer, 
    error: accountsError 
  } = useAccounts()

  const [dialogMode, setDialogMode] = useState<DialogMode>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [formError, setFormError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  // Redirects se não autenticado
  if (!authLoading && !user) {
    router.push('/login')
    return null
  }

  const handleCreateAccount = () => {
    setSelectedAccount(null)
    setDialogMode('create')
    setFormError(null)
    setSuccess(null)
  }

  const handleEditAccount = (account: Account) => {
    setSelectedAccount(account)
    setDialogMode('edit')
    setFormError(null)
    setSuccess(null)
  }

  const handleCreateTransfer = () => {
    setDialogMode('transfer')
    setFormError(null)
    setSuccess(null)
  }

  const handleCloseDialog = () => {
    setDialogMode(null)
    setSelectedAccount(null)
    setFormError(null)
  }

  const handleAccountSubmit = async (data: AccountFormData): Promise<boolean> => {
    try {
      setFormError(null)
      setSuccess(null)

      let success: boolean

      if (dialogMode === 'create') {
        success = await createAccount(data)
        if (success) {
          setSuccess('Conta criada com sucesso!')
        }
      } else if (dialogMode === 'edit' && selectedAccount) {
        success = await updateAccount(selectedAccount.id, data)
        if (success) {
          setSuccess('Conta atualizada com sucesso!')
        }
      } else {
        return false
      }

      if (success) {
        setTimeout(() => {
          handleCloseDialog()
          setSuccess(null)
        }, 1500)
      }

      return success
    } catch (error: any) {
      setFormError(error.message || 'Erro inesperado ao salvar conta')
      return false
    }
  }

  const handleTransferSubmit = async (data: AccountTransferData): Promise<boolean> => {
    try {
      setFormError(null)
      setSuccess(null)

      const result = await createTransfer(data)

      if (result.success) {
        setSuccess('Transferência realizada com sucesso!')
        setTimeout(() => {
          handleCloseDialog()
          setSuccess(null)
        }, 1500)
        return true
      } else {
        setFormError(result.error || 'Erro ao realizar transferência')
        return false
      }
    } catch (error: any) {
      setFormError(error.message || 'Erro inesperado ao realizar transferência')
      return false
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      {/* Header */}
      <Box display="flex" alignItems="center" gap={2} mb={3}>
        <Button
          variant="outlined"
          startIcon={<ArrowBack />}
          onClick={() => router.push('/main')}
          sx={{ minWidth: 'auto' }}
        >
          Voltar
        </Button>
        <Box flex={1}>
          <Typography variant="h4" component="h1" gutterBottom>
            Contas
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Gerencie suas contas bancárias e cartões de crédito
          </Typography>
        </Box>
      </Box>

      {/* Mensagens globais */}
      {success && (
        <Alert severity="success" sx={{ mb: 2 }}>
          {success}
        </Alert>
      )}

      {accountsError && !formError && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {accountsError}
        </Alert>
      )}

      {/* Lista de contas */}
      <AccountsList
        onCreateAccount={handleCreateAccount}
        onEditAccount={handleEditAccount}
        onCreateTransfer={handleCreateTransfer}
      />

      {/* Dialog de formulário de conta */}
      <Dialog 
        open={dialogMode === 'create' || dialogMode === 'edit'} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {dialogMode === 'create' ? 'Nova Conta' : 'Editar Conta'}
        </DialogTitle>
        <DialogContent>
          <AccountForm
            account={selectedAccount}
            onSubmit={handleAccountSubmit}
            onCancel={handleCloseDialog}
            error={formError}
          />
        </DialogContent>
      </Dialog>

      {/* Dialog de transferência */}
      <Dialog 
        open={dialogMode === 'transfer'} 
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Transferência Entre Contas
        </DialogTitle>
        <DialogContent>
          <AccountTransferForm
            onSubmit={handleTransferSubmit}
            onCancel={handleCloseDialog}
            error={formError}
          />
        </DialogContent>
      </Dialog>
    </Container>
  )
} 