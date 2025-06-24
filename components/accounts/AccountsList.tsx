'use client'

import React, { useState } from 'react'
import {
  Box,
  Card,
  CardContent,
  Typography,
  IconButton,
  Chip,
  Grid,
  Alert,
  CircularProgress,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
} from '@mui/material'
import {
  AccountBalance,
  CreditCard,
  Edit,
  Delete,
  MoreVert,
  Star,
  StarBorder,
  Add,
  SwapHoriz,
} from '@mui/icons-material'
import useAccounts from '@/hooks/useAccounts'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Account, AccountBalance as AccountBalanceType } from '@/types/database'

interface AccountsListProps {
  onEditAccount: (account: Account) => void
  onCreateAccount: () => void
  onCreateTransfer: () => void
}

const AccountTypeIcons = {
  checking: AccountBalance,
  credit_card: CreditCard,
}

const AccountTypeLabels = {
  checking: 'Conta Corrente',
  credit_card: 'Cartão de Crédito',
}

export default function AccountsList({
  onEditAccount,
  onCreateAccount,
  onCreateTransfer
}: AccountsListProps) {
  const { 
    accounts, 
    accountBalances, 
    loading, 
    error, 
    deleteAccount, 
    setDefaultAccount 
  } = useAccounts()
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [accountToDelete, setAccountToDelete] = useState<Account | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedAccount, setSelectedAccount] = useState<Account | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const getAccountBalance = (accountId: string): AccountBalanceType | undefined => {
    return accountBalances.find(balance => balance.id === accountId)
  }

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, account: Account) => {
    setMenuAnchor(event.currentTarget)
    setSelectedAccount(account)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedAccount(null)
  }

  const handleDeleteClick = (account: Account) => {
    setAccountToDelete(account)
    setDeleteDialogOpen(true)
    handleMenuClose()
  }

  const handleDeleteConfirm = async () => {
    if (!accountToDelete) return

    setIsDeleting(true)
    const success = await deleteAccount(accountToDelete.id)
    setIsDeleting(false)

    if (success) {
      setDeleteDialogOpen(false)
      setAccountToDelete(null)
    }
  }

  const handleSetDefault = async (account: Account) => {
    await setDefaultAccount(account.id)
    handleMenuClose()
  }

  const getBalanceColor = (balance: number, type: 'checking' | 'credit_card') => {
    if (type === 'credit_card') {
      return balance < 0 ? 'error.main' : 'text.primary'
    }
    return balance >= 0 ? 'success.main' : 'error.main'
  }

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" p={4}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert severity="error" sx={{ m: 2 }}>
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header com botões de ação */}
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={3}>
        <Typography variant="h6">
          Minhas Contas ({accounts.length})
        </Typography>
        <Box display="flex" gap={1}>
          <Button
            variant="outlined"
            startIcon={<SwapHoriz />}
            onClick={onCreateTransfer}
            disabled={accounts.length < 2}
          >
            Transferir
          </Button>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={onCreateAccount}
          >
            Nova Conta
          </Button>
        </Box>
      </Box>

      {accounts.length === 0 ? (
        <Card>
          <CardContent>
            <Box textAlign="center" py={4}>
              <AccountBalance sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
              <Typography variant="h6" gutterBottom>
                Nenhuma conta cadastrada
              </Typography>
              <Typography variant="body2" color="text.secondary" mb={3}>
                Crie sua primeira conta para começar a organizar suas finanças
              </Typography>
              <Button
                variant="contained"
                startIcon={<Add />}
                onClick={onCreateAccount}
              >
                Criar Primeira Conta
              </Button>
            </Box>
          </CardContent>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {accounts.map((account) => {
            const balance = getAccountBalance(account.id)
            const IconComponent = AccountTypeIcons[account.type]

            return (
              <Grid item xs={12} md={6} lg={4} key={account.id}>
                <Card 
                  sx={{ 
                    height: '100%',
                    border: account.is_default ? 2 : 1,
                    borderColor: account.is_default ? 'primary.main' : 'divider'
                  }}
                >
                  <CardContent>
                    {/* Header do card */}
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
                      <Box display="flex" alignItems="center" gap={1}>
                        <IconComponent 
                          sx={{ 
                            fontSize: 24, 
                            color: account.is_default ? 'primary.main' : 'text.secondary' 
                          }} 
                        />
                        <Box>
                          <Typography variant="h6" noWrap>
                            {account.name}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {AccountTypeLabels[account.type]}
                          </Typography>
                        </Box>
                      </Box>
                      
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, account)}
                      >
                        <MoreVert />
                      </IconButton>
                    </Box>

                    {/* Saldo */}
                    <Box mb={2}>
                      <Typography variant="caption" color="text.secondary">
                        Saldo Atual
                      </Typography>
                      <Typography 
                        variant="h5" 
                        color={balance ? getBalanceColor(balance.current_balance, account.type) : 'text.primary'}
                        fontWeight="bold"
                      >
                        {balance ? formatCurrency(balance.current_balance) : 'Calculando...'}
                      </Typography>
                    </Box>

                    {/* Estatísticas */}
                    {balance && (
                      <Grid container spacing={1}>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Receitas
                          </Typography>
                          <Typography variant="body2" color="success.main">
                            {formatCurrency(balance.total_income)}
                          </Typography>
                        </Grid>
                        <Grid item xs={6}>
                          <Typography variant="caption" color="text.secondary">
                            Despesas
                          </Typography>
                          <Typography variant="body2" color="error.main">
                            {formatCurrency(balance.total_expenses)}
                          </Typography>
                        </Grid>
                      </Grid>
                    )}

                    {/* Chips de status */}
                    <Box display="flex" gap={1} mt={2}>
                      {account.is_default && (
                        <Chip
                          label="Padrão"
                          size="small"
                          color="primary"
                          variant="outlined"
                          icon={<Star sx={{ fontSize: 16 }} />}
                        />
                      )}
                      <Chip
                        label={`${balance?.transaction_count || 0} transações`}
                        size="small"
                        variant="outlined"
                      />
                    </Box>

                    {/* Data de criação */}
                    <Typography variant="caption" color="text.secondary" mt={1} display="block">
                      Criada em {formatDate(account.created_at)}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            )
          })}
        </Grid>
      )}

      {/* Menu de ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={() => selectedAccount && onEditAccount(selectedAccount)}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar</ListItemText>
        </MenuItem>
        
        {selectedAccount && !selectedAccount.is_default && (
          <MenuItem onClick={() => selectedAccount && handleSetDefault(selectedAccount)}>
            <ListItemIcon>
              <Star fontSize="small" />
            </ListItemIcon>
            <ListItemText>Definir como Padrão</ListItemText>
          </MenuItem>
        )}
        
        <MenuItem 
          onClick={() => selectedAccount && handleDeleteClick(selectedAccount)}
          sx={{ color: 'error.main' }}
        >
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir</ListItemText>
        </MenuItem>
      </Menu>

      {/* Dialog de confirmação de exclusão */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !isDeleting && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir a conta "{accountToDelete?.name}"?
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={1}>
            Esta ação não pode ser desfeita. A conta só pode ser excluída se não tiver transações associadas.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteConfirm}
            color="error"
            variant="contained"
            disabled={isDeleting}
            startIcon={isDeleting ? <CircularProgress size={16} /> : <Delete />}
          >
            {isDeleting ? 'Excluindo...' : 'Excluir'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 