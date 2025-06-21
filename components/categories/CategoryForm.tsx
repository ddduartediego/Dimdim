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
} from '@mui/material'
import { Close } from '@mui/icons-material'
import { Category } from '@/types/database'

interface CategoryFormProps {
  open: boolean
  onClose: () => void
  onSubmit: (data: CategoryFormData) => Promise<void>
  category?: Category | null
  loading?: boolean
}

// Ícones disponíveis para categorias
const AVAILABLE_ICONS = [
  'restaurant',
  'directions_car',
  'home',
  'local_hospital',
  'sports_esports',
  'shopping_cart',
  'school',
  'work',
  'fitness_center',
  'local_gas_station',
  'phone',
  'pets',
  'flight',
  'hotel',
  'movie',
  'music_note',
  'book',
  'coffee',
  'local_cafe',
  'fastfood',
]

// Cores pré-definidas
const PREDEFINED_COLORS = [
  '#FF9800', // Laranja
  '#2196F3', // Azul
  '#4CAF50', // Verde
  '#F44336', // Vermelho
  '#9C27B0', // Roxo
  '#FF5722', // Vermelho escuro
  '#795548', // Marrom
  '#607D8B', // Azul acinzentado
  '#E91E63', // Rosa
  '#3F51B5', // Índigo
  '#009688', // Teal
  '#8BC34A', // Verde claro
  '#FFC107', // Amarelo
  '#673AB7', // Deep Purple
  '#CDDC39', // Lime
]

export default function CategoryForm({
  open,
  onClose,
  onSubmit,
  category = null,
  loading = false,
}: CategoryFormProps) {
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

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
      setSuccess(category ? 'Categoria atualizada com sucesso!' : 'Categoria criada com sucesso!')
      setTimeout(() => {
        handleClose()
      }, 1500)
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar categoria')
    }
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {category ? 'Editar Categoria' : 'Nova Categoria'}
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

          {/* Preview da categoria */}
          <Paper
            elevation={1}
            sx={{
              p: 2,
              mb: 3,
              textAlign: 'center',
              bgcolor: watchedColor + '10',
              border: `2px solid ${watchedColor}20`,
            }}
          >
            <Avatar
              sx={{
                width: 60,
                height: 60,
                bgcolor: watchedColor + '20',
                color: watchedColor,
                mx: 'auto',
                mb: 1,
              }}
            >
              <Icon sx={{ fontSize: 30 }}>{watchedIcon}</Icon>
            </Avatar>
            <Typography variant="h6" sx={{ color: watchedColor }}>
              {watch('name') || 'Nome da categoria'}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Controller
                name="name"
                control={control}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Nome da categoria"
                    fullWidth
                    required
                    error={!!errors.name}
                    helperText={errors.name?.message}
                    disabled={loading || isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Cor da categoria
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                {PREDEFINED_COLORS.map((color) => (
                  <IconButton
                    key={color}
                    onClick={() => setValue('color', color)}
                    sx={{
                      width: 32,
                      height: 32,
                      bgcolor: color,
                      border: watchedColor === color ? '3px solid #000' : '1px solid #ddd',
                      '&:hover': {
                        transform: 'scale(1.1)',
                      },
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
                    label="Cor personalizada"
                    type="color"
                    fullWidth
                    error={!!errors.color}
                    helperText={errors.color?.message}
                    disabled={loading || isSubmitting}
                  />
                )}
              />
            </Grid>

            <Grid item xs={12}>
              <Typography variant="subtitle2" gutterBottom>
                Ícone da categoria
              </Typography>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', maxHeight: 200, overflow: 'auto' }}>
                {AVAILABLE_ICONS.map((iconName) => (
                  <IconButton
                    key={iconName}
                    onClick={() => setValue('icon', iconName)}
                    sx={{
                      width: 40,
                      height: 40,
                      border: watchedIcon === iconName ? '2px solid #1976d2' : '1px solid #ddd',
                      bgcolor: watchedIcon === iconName ? '#1976d2' : 'transparent',
                      color: watchedIcon === iconName ? 'white' : '#666',
                      '&:hover': {
                        bgcolor: '#1976d2',
                        color: 'white',
                      },
                    }}
                  >
                    <Icon>{iconName}</Icon>
                  </IconButton>
                ))}
              </Box>
              {errors.icon && (
                <Typography variant="caption" color="error" sx={{ mt: 1, display: 'block' }}>
                  {errors.icon.message}
                </Typography>
              )}
            </Grid>
          </Grid>
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
            {category ? 'Atualizar' : 'Criar'}
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  )
} 