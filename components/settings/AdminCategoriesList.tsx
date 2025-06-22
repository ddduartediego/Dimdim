'use client'

import { useState, useEffect } from 'react'
import { useAdminCategories } from '@/hooks/useAdminCategories'
import { Category } from '@/types/database'
import { CategoryFormData } from '@/lib/validations'
import {
  Box,
  Grid,
  Button,
  Alert,
  CircularProgress,
  Typography,
  Fab,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Chip,
  Stack,
} from '@mui/material'
import {
  Add,
  Close,
  AdminPanelSettings,
  Info,
} from '@mui/icons-material'
import AdminCategoryCard from './AdminCategoryCard'
import AdminCategoryForm from './AdminCategoryForm'

export default function AdminCategoriesList() {
  const {
    categories,
    loading,
    error,
    success,
    createCategory,
    updateCategory,
    deleteCategory,
    clearMessages
  } = useAdminCategories()

  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [infoDialogOpen, setInfoDialogOpen] = useState(false)

  const handleOpenForm = (category?: Category) => {
    setEditingCategory(category || null)
    setFormOpen(true)
  }

  const handleCloseForm = () => {
    setFormOpen(false)
    setEditingCategory(null)
  }

  const handleFormSubmit = async (data: CategoryFormData) => {
    if (editingCategory) {
      await updateCategory(editingCategory.id, data)
    } else {
      await createCategory(data)
    }
  }

  const handleDeleteCategory = async (category: Category) => {
    await deleteCategory(category.id)
  }

  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => {
        clearMessages()
      }, 4000)
      return () => clearTimeout(timer)
    }
  }, [success, clearMessages])

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="300px">
        <CircularProgress size={60} />
      </Box>
    )
  }

  return (
    <Box>
      {/* Messages */}
      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={clearMessages}>
          {error}
        </Alert>
      )}
      
      {success && (
        <Alert severity="success" sx={{ mb: 3 }} onClose={clearMessages}>
          {success}
        </Alert>
      )}

      {/* Header Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Categorias Padrão ({categories.length})
          </Typography>
          <IconButton 
            size="small" 
            color="info"
            onClick={() => setInfoDialogOpen(true)}
            sx={{ opacity: 0.7 }}
          >
            <Info />
          </IconButton>
        </Box>
        
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => handleOpenForm()}
          sx={{ textTransform: 'none', fontWeight: 500 }}
        >
          Nova Categoria Padrão
        </Button>
      </Box>

      {/* Stats */}
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Chip 
          icon={<AdminPanelSettings />}
          label={`${categories.length} Categorias Globais`}
          color="primary"
          variant="outlined"
        />
        <Chip 
          label="Disponível para todos os usuários"
          color="success"
          variant="outlined"
        />
      </Stack>

      {/* Categories Grid */}
      {categories.length === 0 ? (
        <Box 
          sx={{ 
            textAlign: 'center', 
            py: 8, 
            color: 'text.secondary',
            bgcolor: 'background.default',
            borderRadius: 2,
            border: '2px dashed',
            borderColor: 'divider'
          }}
        >
          <AdminPanelSettings sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
          <Typography variant="h6" gutterBottom>
            Nenhuma categoria padrão encontrada
          </Typography>
          <Typography variant="body2" sx={{ mb: 3 }}>
            Crie a primeira categoria padrão do sistema
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<Add />}
            onClick={() => handleOpenForm()}
          >
            Criar Primeira Categoria
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {categories.map((category) => (
            <Grid item xs={12} sm={6} md={4} key={category.id}>
              <AdminCategoryCard
                category={category}
                onEdit={() => handleOpenForm(category)}
                onDelete={() => handleDeleteCategory(category)}
              />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Form Dialog */}
      <AdminCategoryForm
        open={formOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        category={editingCategory}
        loading={loading}
      />

      {/* Info Dialog */}
      <Dialog open={infoDialogOpen} onClose={() => setInfoDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="h6">Sobre as Categorias Padrão</Typography>
            <IconButton onClick={() => setInfoDialogOpen(false)} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Typography paragraph>
            <strong>Categorias Padrão</strong> são categorias globais do sistema que ficam 
            disponíveis para todos os usuários automaticamente.
          </Typography>
          <Typography paragraph>
            <strong>Características:</strong>
          </Typography>
          <Box component="ul" sx={{ pl: 2 }}>
            <Typography component="li">Aparecem automaticamente para novos usuários</Typography>
            <Typography component="li">Não podem ser editadas ou excluídas pelos usuários</Typography>
            <Typography component="li">São identificadas com o ícone de administração</Typography>
            <Typography component="li">Facilitam o início de uso da aplicação</Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setInfoDialogOpen(false)}>Entendi</Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
} 