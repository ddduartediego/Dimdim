'use client'

import { useState, useEffect } from 'react'
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Avatar,
  Typography,
  Icon,
  FormHelperText,
} from '@mui/material'
import { Category } from '@/types/database'
import { supabase } from '@/lib/supabase'

interface CategorySelectProps {
  value: string | null
  onChange: (categoryId: string | null) => void
  label?: string
  error?: boolean
  helperText?: string
  required?: boolean
  fullWidth?: boolean
  includeEmpty?: boolean
  emptyLabel?: string
}

export default function CategorySelect({
  value,
  onChange,
  label = 'Categoria',
  error = false,
  helperText,
  required = false,
  fullWidth = true,
  includeEmpty = true,
  emptyLabel = 'Sem categoria',
}: CategorySelectProps) {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    try {
      setLoading(true)
      
      // Buscar categorias padrão e do usuário
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('is_default', { ascending: false })
        .order('name')

      if (error) {
        console.error('Erro ao buscar categorias:', error)
        return
      }

      setCategories(data || [])
    } catch (err) {
      console.error('Erro ao carregar categorias:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (categoryId: string) => {
    if (categoryId === '') {
      onChange(null)
    } else {
      onChange(categoryId)
    }
  }

  return (
    <FormControl fullWidth={fullWidth} error={error} required={required}>
      <InputLabel id="category-select-label">{label}</InputLabel>
      <Select
        labelId="category-select-label"
        value={value || ''}
        onChange={(e) => handleChange(e.target.value as string)}
        label={label}
        disabled={loading}
      >
        {includeEmpty && (
          <MenuItem value="">
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar sx={{ width: 24, height: 24, bgcolor: '#f5f5f5' }}>
                <Icon sx={{ fontSize: 14, color: '#999' }}>category</Icon>
              </Avatar>
              <Typography variant="body2" color="text.secondary">
                {emptyLabel}
              </Typography>
            </Box>
          </MenuItem>
        )}
        
        {categories.map((category) => (
          <MenuItem key={category.id} value={category.id}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Avatar
                sx={{
                  width: 24,
                  height: 24,
                  bgcolor: category.color + '20',
                  color: category.color,
                }}
              >
                <Icon sx={{ fontSize: 14 }}>{category.icon}</Icon>
              </Avatar>
              <Typography variant="body2">
                {category.name}
              </Typography>
              {category.is_default && (
                <Typography
                  variant="caption"
                  sx={{
                    bgcolor: 'primary.main',
                    color: 'white',
                    px: 0.5,
                    py: 0.25,
                    borderRadius: 0.5,
                    fontSize: '0.65rem',
                    ml: 'auto',
                  }}
                >
                  PADRÃO
                </Typography>
              )}
            </Box>
          </MenuItem>
        ))}
      </Select>
      {helperText && <FormHelperText>{helperText}</FormHelperText>}
    </FormControl>
  )
} 