'use client'

import { Chip, Avatar, Box } from '@mui/material'
import { Icon } from '@mui/material'
import { AdminPanelSettings as AdminIcon } from '@mui/icons-material'
import { Category } from '@/types/database'

interface CategoryChipProps {
  category: Category | null
  size?: 'small' | 'medium'
  variant?: 'filled' | 'outlined'
  onDelete?: () => void
  clickable?: boolean
  onClick?: () => void
}

export default function CategoryChip({
  category,
  size = 'small',
  variant = 'filled',
  onDelete,
  clickable = false,
  onClick,
}: CategoryChipProps) {
  if (!category) {
    return (
      <Chip
        label="Sem categoria"
        size={size}
        variant="outlined"
        sx={{
          borderColor: '#ccc',
          color: '#666',
        }}
      />
    )
  }

  const isDefaultCategory = category.is_default === true

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
      <Chip
        avatar={
          <Avatar
            sx={{
              bgcolor: category.color + '20',
              color: category.color,
              width: size === 'small' ? 20 : 24,
              height: size === 'small' ? 20 : 24,
              fontSize: size === 'small' ? '0.75rem' : '0.875rem',
            }}
          >
            <Icon sx={{ fontSize: 'inherit' }}>{category.icon}</Icon>
          </Avatar>
        }
        label={category.name}
        size={size}
        variant={variant}
        clickable={clickable}
        onDelete={onDelete}
        onClick={onClick}
        sx={{
          backgroundColor: variant === 'filled' ? category.color + '15' : 'transparent',
          borderColor: variant === 'outlined' ? category.color : 'transparent',
          color: category.color,
          fontWeight: 500,
          '&:hover': {
            backgroundColor: category.color + '25',
          },
          '& .MuiChip-deleteIcon': {
            color: category.color,
            '&:hover': {
              color: category.color,
              opacity: 0.8,
            },
          },
        }}
      />
      {isDefaultCategory && (
        <AdminIcon 
          sx={{ 
            fontSize: size === 'small' ? 12 : 14, 
            color: 'primary.main',
            opacity: 0.7
          }} 
        />
      )}
    </Box>
  )
} 