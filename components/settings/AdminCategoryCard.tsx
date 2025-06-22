'use client'

import { useState } from 'react'
import { Category } from '@/types/database'
import {
  Card,
  CardContent,
  CardActions,
  Box,
  Typography,
  IconButton,
  Avatar,
  Icon,
  Chip,
  Button,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  alpha,
} from '@mui/material'
import {
  MoreVert,
  Edit,
  Delete,
  AdminPanelSettings,
  Public,
  Group,
} from '@mui/icons-material'

interface AdminCategoryCardProps {
  category: Category
  onEdit: () => void
  onDelete: () => void
}

export default function AdminCategoryCard({ category, onEdit, onDelete }: AdminCategoryCardProps) {
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const menuOpen = Boolean(menuAnchor)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchor(event.currentTarget)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
  }

  const handleEdit = () => {
    handleMenuClose()
    onEdit()
  }

  const handleDelete = () => {
    handleMenuClose()
    onDelete()
  }

  return (
    <Card 
      elevation={2}
      sx={{
        position: 'relative',
        transition: 'all 0.3s ease',
        border: '2px solid',
        borderColor: alpha(category.color, 0.2),
        '&:hover': {
          elevation: 4,
          transform: 'translateY(-2px)',
          borderColor: alpha(category.color, 0.4),
          boxShadow: `0 8px 25px ${alpha(category.color, 0.2)}`,
        }
      }}
    >
      {/* Admin Badge */}
      <Box
        sx={{
          position: 'absolute',
          top: 8,
          right: 8,
          zIndex: 1,
        }}
      >
        <Chip
          icon={<AdminPanelSettings />}
          label="Padrão"
          size="small"
          color="primary"
          variant="filled"
          sx={{
            bgcolor: 'primary.main',
            color: 'white',
            fontSize: '0.75rem',
            height: 24,
          }}
        />
      </Box>

      <CardContent sx={{ pb: 1 }}>
        {/* Header com Menu */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            {/* Avatar da Categoria */}
            <Avatar
              sx={{
                width: 56,
                height: 56,
                bgcolor: alpha(category.color, 0.15),
                color: category.color,
                mb: 2,
                border: `2px solid ${alpha(category.color, 0.3)}`,
              }}
            >
              <Icon sx={{ fontSize: 28 }}>{category.icon}</Icon>
            </Avatar>

            {/* Nome da Categoria */}
            <Typography 
              variant="h6" 
              sx={{ 
                fontWeight: 600,
                color: 'text.primary',
                mb: 1,
                lineHeight: 1.2,
              }}
            >
              {category.name}
            </Typography>

            {/* Informações Adicionais */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Public sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Global
                </Typography>
              </Box>
              
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Group sx={{ fontSize: 16, color: 'text.secondary' }} />
                <Typography variant="caption" color="text.secondary">
                  Todos os usuários
                </Typography>
              </Box>
            </Box>
          </Box>

          <IconButton
            size="small"
            onClick={handleMenuOpen}
            sx={{ mt: -1, mr: -1 }}
          >
            <MoreVert />
          </IconButton>
        </Box>

        {/* Color Preview */}
        <Box
          sx={{
            width: '100%',
            height: 4,
            borderRadius: 2,
            bgcolor: category.color,
            mt: 2,
          }}
        />
      </CardContent>

      <CardActions sx={{ pt: 0, pb: 2, px: 2 }}>
        <Box sx={{ display: 'flex', gap: 1, width: '100%' }}>
          <Button
            size="small"
            startIcon={<Edit />}
            onClick={onEdit}
            sx={{ 
              textTransform: 'none',
              flex: 1,
              fontSize: '0.8rem'
            }}
          >
            Editar
          </Button>
          <Button
            size="small"
            startIcon={<Delete />}
            onClick={onDelete}
            color="error"
            sx={{ 
              textTransform: 'none',
              flex: 1,
              fontSize: '0.8rem'
            }}
          >
            Excluir
          </Button>
        </Box>
      </CardActions>

      {/* Menu Dropdown */}
      <Menu
        anchorEl={menuAnchor}
        open={menuOpen}
        onClose={handleMenuClose}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem onClick={handleEdit}>
          <ListItemIcon>
            <Edit fontSize="small" />
          </ListItemIcon>
          <ListItemText>Editar categoria</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete} sx={{ color: 'error.main' }}>
          <ListItemIcon>
            <Delete fontSize="small" color="error" />
          </ListItemIcon>
          <ListItemText>Excluir categoria</ListItemText>
        </MenuItem>
      </Menu>
    </Card>
  )
} 