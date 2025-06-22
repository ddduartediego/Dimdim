'use client'

import { useState } from 'react'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { categorySchema, CategoryFormData } from '@/lib/validations'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Grid,
  Avatar,
  Typography,
  Icon,
  IconButton,
  Paper,
  Alert,
  CircularProgress,
  Chip,
  Divider,
  alpha,
} from '@mui/material'
import { 
  Close, 
  Search, 
  AdminPanelSettings,
  Public,
  Group,
  Info,
} from '@mui/icons-material'
import { Category } from '@/types/database'
import IconSearchModal from '@/components/categories/IconSearchModal'
import { getPopularIcons } from '@/lib/materialIcons'

interface AdminCategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  category?: Category | null
  loading?: boolean
}

// Ícones populares para categorias padrão
const ADMIN_POPULAR_ICONS = getPopularIcons(24).map(icon => icon.name)

// Cores pré-definidas para categorias padrão
const ADMIN_PREDEFINED_COLORS = [
  '#FF9800', // Laranja - Alimentação
  '#2196F3', // Azul - Transporte  
  '#4CAF50', // Verde - Moradia
  '#F44336', // Vermelho - Saúde
  '#9C27B0', // Roxo - Lazer
  '#FF5722', // Vermelho escuro - Compras
  '#795548', // Marrom - Educação
  '#607D8B', // Azul acinzentado - Trabalho
  '#E91E63', // Rosa - Beleza
  '#3F51B5', // Índigo - Tecnologia
  '#009688', // Teal - Investimentos
  '#8BC34A', // Verde claro - Pets
  '#FFC107', // Amarelo - Viagem
  '#673AB7', // Deep Purple - Cultura
  '#CDDC39', // Lime - Esportes
  '#FF6F00', // Âmbar - Combustível
]

export default function AdminCategoryForm({
  open,
  onClose,
  onSubmit,
  category = null,
  loading = false,
}: AdminCategoryFormProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [iconSearchOpen, setIconSearchOpen] = useState(false)

  const {
    control,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<CategoryFormData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || '',
      color: category?.color || '#1976D2',
      icon: category?.icon || 'category',
    },
  })

  const watchedColor = watch('color')
  const watchedIcon = watch('icon')
  const watchedName = watch('name')

  const handleClose = () => {
    reset()
    setError('')
    setSuccess('')
    onClose()
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    try {
      setError('')
      setSuccess('')
      await onSubmit(data)
      setSuccess(category ? 'Categoria padrão atualizada com sucesso!' : 'Categoria padrão criada com sucesso!')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria padrão')
    }
  }

  const handleIconSelect = (iconName: string) => {
    setValue('icon', iconName)
    setIconSearchOpen(false)
  }

  return (
    <>
      <Dialog open={open} onClose={handleClose} maxWidth="md" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Box display="flex" alignItems="center" gap={2}>
              <AdminPanelSettings color="primary" />
              <Box>
                <Typography variant="h6">
                  {category ? 'Editar Categoria Padrão' : 'Nova Categoria Padrão'}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Configuração de categoria global do sistema
                </Typography>
              </Box>
            </Box>
            <IconButton onClick={handleClose} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>

        <form onSubmit={handleSubmit(handleFormSubmit)}>
          <DialogContent dividers>
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

            {/* Info Box */}
            <Alert severity="info" sx={{ mb: 3 }} icon={<Info />}>
              <Typography variant="body2">
                <strong>Categoria Padrão:</strong> Esta categoria ficará disponível globalmente para todos os usuários 
                do sistema e não poderá ser editada ou excluída por eles.
              </Typography>
            </Alert>

            {/* Preview da categoria */}
            <Paper
              elevation={2}
              sx={{
                p: 3,
                mb: 4,
                textAlign: 'center',
                bgcolor: alpha(watchedColor, 0.05),
                border: `2px solid ${alpha(watchedColor, 0.2)}`,
                borderRadius: 3,
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
                <Chip
                  icon={<AdminPanelSettings />}
                  label="Categoria Padrão"
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
              </Box>
              
              <Avatar
                sx={{
                  width: 80,
                  height: 80,
                  bgcolor: alpha(watchedColor, 0.15),
                  color: watchedColor,
                  mx: 'auto',
                  mb: 2,
                  border: `3px solid ${alpha(watchedColor, 0.3)}`,
                }}
              >
                <Icon sx={{ fontSize: 40 }}>{watchedIcon}</Icon>
              </Avatar>
              
              <Typography variant="h5" sx={{ color: watchedColor, fontWeight: 600, mb: 1 }}>
                {watchedName || 'Nome da categoria'}
              </Typography>
              
              <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mt: 2 }}>
                <Chip
                  icon={<Public />}
                  label="Global"
                  size="small"
                  variant="outlined"
                />
                <Chip
                  icon={<Group />}
                  label="Todos os usuários"
                  size="small"
                  variant="outlined"
                />
              </Box>
            </Paper>

            <Grid container spacing={4}>
              <Grid item xs={12}>
                <Controller
                  name="name"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Nome da categoria padrão"
                      fullWidth
                      required
                      error={!!errors.name}
                      helperText={errors.name?.message || "Este nome ficará visível para todos os usuários"}
                      disabled={loading || isSubmitting}
                      variant="outlined"
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Cor da categoria
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Escolha uma cor que represente bem esta categoria
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {ADMIN_PREDEFINED_COLORS.map((color) => (
                    <IconButton
                      key={color}
                      onClick={() => setValue('color', color)}
                      sx={{
                        width: 40,
                        height: 40,
                        bgcolor: color,
                        border: watchedColor === color ? '3px solid #1976D2' : '2px solid transparent',
                        borderRadius: 2,
                        '&:hover': {
                          transform: 'scale(1.1)',
                          boxShadow: `0 4px 12px ${alpha(color, 0.4)}`,
                        },
                        transition: 'all 0.2s ease',
                      }}
                    />
                  ))}
                </Box>
                <Controller
                  name="color"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Cor personalizada (hex)"
                      size="small"
                      sx={{ maxWidth: 200 }}
                      error={!!errors.color}
                      helperText={errors.color?.message}
                      disabled={loading || isSubmitting}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Ícone da categoria
                </Typography>
                <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 2 }}>
                  Ícones populares para categorias administrativas
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                  {ADMIN_POPULAR_ICONS.map((iconName) => (
                    <IconButton
                      key={iconName}
                      onClick={() => setValue('icon', iconName)}
                      sx={{
                        width: 48,
                        height: 48,
                        border: watchedIcon === iconName ? '2px solid #1976D2' : '1px solid',
                        borderColor: watchedIcon === iconName ? 'primary.main' : 'divider',
                        borderRadius: 2,
                        bgcolor: watchedIcon === iconName ? alpha('#1976D2', 0.1) : 'transparent',
                        color: watchedIcon === iconName ? 'primary.main' : 'text.secondary',
                        '&:hover': {
                          bgcolor: alpha('#1976D2', 0.1),
                          color: 'primary.main',
                        },
                      }}
                    >
                      <Icon>{iconName}</Icon>
                    </IconButton>
                  ))}
                </Box>
                <Button
                  startIcon={<Search />}
                  onClick={() => setIconSearchOpen(true)}
                  sx={{ textTransform: 'none' }}
                >
                  Buscar mais ícones
                </Button>
              </Grid>
            </Grid>
          </DialogContent>

          <DialogActions sx={{ p: 3 }}>
            <Button onClick={handleClose} disabled={loading || isSubmitting}>
              Cancelar
            </Button>
            <Button
              type="submit"
              variant="contained"
              disabled={loading || isSubmitting}
              startIcon={loading || isSubmitting ? <CircularProgress size={16} /> : <AdminPanelSettings />}
              sx={{ minWidth: 140 }}
            >
              {loading || isSubmitting
                ? 'Salvando...'
                : category
                ? 'Atualizar'
                : 'Criar Categoria'
              }
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Modal de busca de ícones */}
      <IconSearchModal
        open={iconSearchOpen}
        onClose={() => setIconSearchOpen(false)}
        onSelectIcon={handleIconSelect}
      />
    </>
  )
} 