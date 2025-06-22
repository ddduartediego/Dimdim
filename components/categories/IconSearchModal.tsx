'use client'

import { useState } from 'react'
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
  Chip,
  InputAdornment,
  Tabs,
  Tab,
} from '@mui/material'
import {
  Close,
  Search,
  Clear,
  Category as CategoryIcon,
} from '@mui/icons-material'
import { MaterialIcon, IconCategory, ICON_CATEGORIES } from '@/lib/materialIcons'
import { useIconSearch } from '@/hooks/useIconSearch'

interface IconSearchModalProps {
  open: boolean
  onClose: () => void
  onSelectIcon: (iconName: string) => void
}

export default function IconSearchModal({
  open,
  onClose,
  onSelectIcon,
}: IconSearchModalProps) {
  const {
    searchQuery,
    selectedCategory,
    selectedIcon,
    searchResults,
    isSearching,
    hasResults,
    setSearchQuery,
    setSelectedCategory,
    selectIcon,
    clearSearch,
  } = useIconSearch()

  const [tabValue, setTabValue] = useState(0)

  const handleClose = () => {
    clearSearch()
    onClose()
  }

  const handleConfirmSelection = () => {
    if (selectedIcon) {
      onSelectIcon(selectedIcon.name)
      handleClose()
    }
  }

  const handleIconClick = (icon: MaterialIcon) => {
    selectIcon(icon)
  }

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
    if (newValue === 0) {
      setSelectedCategory('Todos')
    }
  }

  const handleCategoryChange = (category: IconCategory) => {
    setSelectedCategory(category)
    setTabValue(1) // Mudar para aba de categorias
  }

  const renderIconGrid = () => {
    if (!hasResults) {
      return (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <CategoryIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" color="text.secondary" gutterBottom>
            {isSearching ? 'Nenhum ícone encontrado' : 'Digite algo para buscar'}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {isSearching 
              ? 'Tente usar outras palavras-chave ou limpe os filtros'
              : 'Use palavras como "casa", "comida", "carro", etc.'
            }
          </Typography>
        </Box>
      )
    }

    return (
      <Grid container spacing={1} sx={{ maxHeight: 400, overflow: 'auto' }}>
        {searchResults.map((icon) => (
          <Grid item xs={3} sm={2} md={1.5} key={icon.name}>
            <Paper
              elevation={selectedIcon?.name === icon.name ? 3 : 1}
              sx={{
                p: 1.5,
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s',
                border: selectedIcon?.name === icon.name ? '2px solid #1976d2' : '1px solid transparent',
                bgcolor: selectedIcon?.name === icon.name ? '#1976d210' : 'transparent',
                '&:hover': {
                  bgcolor: '#1976d215',
                  transform: 'scale(1.05)',
                },
              }}
              onClick={() => handleIconClick(icon)}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'transparent',
                  color: selectedIcon?.name === icon.name ? '#1976d2' : '#666',
                  mx: 'auto',
                  mb: 0.5,
                }}
              >
                <Icon sx={{ fontSize: 20 }}>{icon.name}</Icon>
              </Avatar>
              <Typography 
                variant="caption" 
                sx={{ 
                  fontSize: '0.65rem',
                  lineHeight: 1.2,
                  display: 'block',
                  color: selectedIcon?.name === icon.name ? '#1976d2' : 'text.secondary'
                }}
              >
                {icon.description}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    )
  }

  return (
    <Dialog 
      open={open} 
      onClose={handleClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{
        sx: { height: '80vh', maxHeight: 600 }
      }}
    >
      <DialogTitle>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            Buscar Ícones
          </Typography>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Barra de Busca */}
        <Box sx={{ mb: 3 }}>
          <TextField
            fullWidth
            placeholder="Digite palavras como 'casa', 'comida', 'trabalho'..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  <IconButton
                    size="small"
                    onClick={() => setSearchQuery('')}
                  >
                    <Clear />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </Box>

        {/* Abas de Navegação */}
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={handleTabChange}>
            <Tab label="Busca" />
            <Tab label="Categorias" />
          </Tabs>
        </Box>

        {/* Conteúdo das Abas */}
        {tabValue === 0 && (
          <Box>
            {/* Filtro de Categoria */}
            {selectedCategory !== 'Todos' && (
              <Box sx={{ mb: 2 }}>
                <Chip
                  label={`Categoria: ${selectedCategory}`}
                  onDelete={() => setSelectedCategory('Todos')}
                  color="primary"
                  variant="outlined"
                />
              </Box>
            )}

            {/* Grid de Ícones */}
            {renderIconGrid()}
          </Box>
        )}

        {tabValue === 1 && (
          <Box>
            <Typography variant="subtitle2" gutterBottom>
              Escolha uma categoria:
            </Typography>
            <Grid container spacing={1}>
              {ICON_CATEGORIES.map((category) => (
                <Grid item xs={6} sm={4} md={3} key={category}>
                  <Paper
                    elevation={1}
                    sx={{
                      p: 2,
                      textAlign: 'center',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      bgcolor: selectedCategory === category ? '#1976d210' : 'transparent',
                      border: selectedCategory === category ? '2px solid #1976d2' : '1px solid transparent',
                      '&:hover': {
                        bgcolor: '#1976d215',
                        transform: 'scale(1.02)',
                      },
                    }}
                    onClick={() => handleCategoryChange(category)}
                  >
                    <Typography variant="body2" fontWeight="medium">
                      {category}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* Preview do Ícone Selecionado */}
        {selectedIcon && (
          <Box sx={{ mt: 3, p: 2, bgcolor: '#f5f5f5', borderRadius: 1 }}>
            <Typography variant="subtitle2" gutterBottom>
              Ícone Selecionado:
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Avatar
                sx={{
                  width: 48,
                  height: 48,
                  bgcolor: '#1976d220',
                  color: '#1976d2',
                }}
              >
                <Icon sx={{ fontSize: 28 }}>{selectedIcon.name}</Icon>
              </Avatar>
              <Box>
                <Typography variant="body1" fontWeight="medium">
                  {selectedIcon.description}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Categoria: {selectedIcon.category}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Nome técnico: {selectedIcon.name}
                </Typography>
              </Box>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirmSelection}
          disabled={!selectedIcon}
          startIcon={selectedIcon && <Icon>{selectedIcon.name}</Icon>}
        >
          {selectedIcon ? 'Usar este Ícone' : 'Selecione um Ícone'}
        </Button>
      </DialogActions>
    </Dialog>
  )
} 