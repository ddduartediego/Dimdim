'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Box,
  Paper,
  Typography,
  TextField,
  FormControl,
  Select,
  MenuItem,
  Button,
  Grid,
  Chip,
  IconButton,
  Collapse,
  InputAdornment,
  Stack,
} from '@mui/material'
import {
  FilterList,
  Clear,
  ExpandMore,
  ExpandLess,
  Search,
  Category,
  TrendingUp,
  TrendingDown,
  AttachMoney,
  CalendarToday,
} from '@mui/icons-material'
import { TransactionWithCategory } from '@/types/database'

export interface TransactionFiltersData {
  date?: string
  description?: string
  categoryId?: string
  type?: 'income' | 'expense' | ''
  valueFrom?: number
  valueTo?: number
}

interface TransactionFiltersProps {
  transactions: TransactionWithCategory[]
  onFiltersChange: (filteredTransactions: TransactionWithCategory[]) => void
  onFiltersDataChange?: (filters: TransactionFiltersData) => void
  selectedMonth: number
  selectedYear: number
}

export default function TransactionFilters({ 
  transactions, 
  onFiltersChange,
  onFiltersDataChange,
  selectedMonth,
  selectedYear
}: TransactionFiltersProps) {
  const [filtersOpen, setFiltersOpen] = useState(false)
  const [filters, setFilters] = useState<TransactionFiltersData>({})

  // Debug: monitorar mudanças no estado filters
  useEffect(() => {
    console.log('Estado filters mudou:', filters)
  }, [filters])

  // Calcular limites de data para o mês/ano selecionado
  const startOfMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-01`
  // selectedMonth é 1-indexed, então para pegar o último dia do mês atual, usamos selectedMonth (sem -1) 
  // e day 0 que retorna o último dia do mês anterior (que é o mês atual)
  const endOfMonth = `${selectedYear}-${selectedMonth.toString().padStart(2, '0')}-${new Date(selectedYear, selectedMonth, 0).getDate().toString().padStart(2, '0')}`
  
  // Debug das datas calculadas
  console.log('Filtro de data - Período:', { selectedMonth, selectedYear, startOfMonth, endOfMonth })

  // Extrair categorias únicas das transações
  const uniqueCategories = transactions.reduce((acc, transaction) => {
    if (transaction.category_id && transaction.category_name) {
      const key = transaction.category_id
      if (!acc[key]) {
        acc[key] = {
          id: transaction.category_id,
          name: transaction.category_name,
          color: transaction.category_color || '#1976D2'
        }
      }
    }
    return acc
  }, {} as Record<string, { id: string; name: string; color: string }>)

  const categories = Object.values(uniqueCategories)

  const applyFilters = useCallback((newFilters: TransactionFiltersData) => {
    let filtered = [...transactions]
    
    console.log('ApplyFilters chamado com:', newFilters)
    console.log('Transações disponíveis:', transactions.length)

    // Filtro por data específica
    if (newFilters.date) {
      console.log('Filtrando por data:', newFilters.date)
      console.log('Primeiras 3 transações (datas):', transactions.slice(0, 3).map(t => ({ date: t.date, description: t.description })))
      
      const beforeFilter = filtered.length
      filtered = filtered.filter(t => t.date === newFilters.date!)
      const afterFilter = filtered.length
      
      console.log(`Filtro de data: ${beforeFilter} → ${afterFilter} transações`)
    }

    // Filtro por descrição
    if (newFilters.description) {
      const searchTerm = newFilters.description.toLowerCase()
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(searchTerm)
      )
    }

    // Filtro por categoria
    if (newFilters.categoryId) {
      if (newFilters.categoryId === 'no-category') {
        filtered = filtered.filter(t => !t.category_id)
      } else {
        filtered = filtered.filter(t => t.category_id === newFilters.categoryId)
      }
    }

    // Filtro por tipo
    if (newFilters.type) {
      filtered = filtered.filter(t => t.type === newFilters.type)
    }

    // Filtro por valor
    if (newFilters.valueFrom !== undefined && newFilters.valueFrom > 0) {
      filtered = filtered.filter(t => t.amount >= newFilters.valueFrom!)
    }
    if (newFilters.valueTo !== undefined && newFilters.valueTo > 0) {
      filtered = filtered.filter(t => t.amount <= newFilters.valueTo!)
    }

    console.log('Resultado final do filtro:', filtered.length, 'transações')
    onFiltersChange(filtered)
  }, [transactions, onFiltersChange])

  // Limpar filtro de data quando mês/ano muda
  useEffect(() => {
    console.log('useEffect limpeza - mudança de período:', { selectedMonth, selectedYear, hasDateFilter: !!filters.date })
    if (filters.date) {
      console.log('Limpando filtro de data devido a mudança de período')
      const newFilters = { ...filters }
      delete newFilters.date
      setFilters(newFilters)
      applyFilters(newFilters)
      
      if (onFiltersDataChange) {
        onFiltersDataChange(newFilters)
      }
    }
  }, [selectedMonth, selectedYear])

  const handleFilterChange = (key: keyof TransactionFiltersData, value: any) => {
    console.log('handleFilterChange chamado:', { key, value, currentFilters: filters })
    const newFilters = { ...filters, [key]: value }
    console.log('Novos filtros:', newFilters)
    setFilters(newFilters)
    applyFilters(newFilters)
    
    if (onFiltersDataChange) {
      onFiltersDataChange(newFilters)
    }
  }

  const clearFilters = () => {
    const emptyFilters: TransactionFiltersData = {}
    setFilters(emptyFilters)
    applyFilters(emptyFilters)
    
    if (onFiltersDataChange) {
      onFiltersDataChange(emptyFilters)
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => 
    value !== undefined && value !== '' && value !== 0
  )

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => 
      value !== undefined && value !== '' && value !== 0
    ).length
  }

  return (
    <Paper 
      elevation={0} 
      sx={{ 
        mb: 3, 
        border: '1px solid',
        borderColor: 'divider',
        borderRadius: 3,
        overflow: 'hidden',
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          borderColor: 'primary.main',
          boxShadow: '0 4px 20px rgba(0,0,0,0.08)'
        }
      }}
    >
      {/* Header do Filtro */}
      <Box 
        sx={{ 
          p: 2.5, 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          backgroundColor: 'grey.50',
          borderBottom: filtersOpen ? '1px solid' : 'none',
          borderColor: 'divider'
        }}
      >
        <Stack direction="row" alignItems="center" spacing={1.5}>
          <Box
            sx={{
              p: 1,
              borderRadius: 2,
              backgroundColor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <FilterList sx={{ fontSize: 18 }} />
          </Box>
          <Box>
            <Typography variant="subtitle1" fontWeight="600" color="text.primary">
              Filtros Avançados
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Refine sua busca de transações
            </Typography>
          </Box>
          {hasActiveFilters && (
            <Chip 
              label={`${getActiveFiltersCount()} filtro${getActiveFiltersCount() > 1 ? 's' : ''}`}
              size="small" 
              color="primary" 
              variant="filled"
              sx={{ 
                fontWeight: 600,
                borderRadius: 2,
                height: 24
              }}
            />
          )}
        </Stack>
        
        <Stack direction="row" alignItems="center" spacing={1}>
          {hasActiveFilters && (
            <Button
              size="small"
              variant="outlined"
              startIcon={<Clear />}
              onClick={clearFilters}
              sx={{
                borderRadius: 2,
                textTransform: 'none',
                fontWeight: 500,
                px: 2
              }}
            >
              Limpar
            </Button>
          )}
          <IconButton
            onClick={() => setFiltersOpen(!filtersOpen)}
            sx={{
              borderRadius: 2,
              backgroundColor: filtersOpen ? 'primary.main' : 'transparent',
              color: filtersOpen ? 'white' : 'text.secondary',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                backgroundColor: filtersOpen ? 'primary.dark' : 'action.hover'
              }
            }}
          >
            {filtersOpen ? <ExpandLess /> : <ExpandMore />}
          </IconButton>
        </Stack>
      </Box>

      {/* Filtros Expandidos */}
      <Collapse in={filtersOpen} timeout={300}>
        <Box sx={{ p: 3, backgroundColor: 'white' }}>
          <Grid container spacing={3}>
            {/* Filtro de Data */}
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <CalendarToday sx={{ fontSize: 16, color: 'primary.main' }} />
                  Data
                </Typography>
                <TextField
                  type="date"
                  fullWidth
                  size="small"
                  value={filters.date || ''}
                  onChange={(e) => {
                    console.log('Data selecionada:', e.target.value)
                    handleFilterChange('date', e.target.value)
                  }}
                  onBlur={() => console.log('Campo data onBlur - valor atual:', filters.date)}
                  inputProps={{ 
                    min: startOfMonth, 
                    max: endOfMonth,
                    'data-testid': 'date-filter'
                  }}
                  placeholder="Selecione uma data"
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      backgroundColor: 'white',
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                      '&.Mui-focused fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                    '& input[type="date"]': {
                      cursor: 'pointer',
                      minHeight: '20px',
                      '&::-webkit-calendar-picker-indicator': {
                        cursor: 'pointer',
                        filter: 'brightness(0) saturate(100%) invert(27%) sepia(51%) saturate(2878%) hue-rotate(346deg) brightness(104%) contrast(97%)',
                      },
                    },
                  }}
                />
                <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
                  Período: {startOfMonth} até {endOfMonth}
                </Typography>
              </Box>
            </Grid>

            {/* Filtro de Descrição */}
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Search sx={{ fontSize: 16, color: 'primary.main' }} />
                  Descrição
                </Typography>
                <TextField
                  fullWidth
                  size="small"
                  value={filters.description || ''}
                  onChange={(e) => handleFilterChange('description', e.target.value)}
                  placeholder="Buscar transação..."
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Search sx={{ fontSize: 20, color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>

            {/* Filtro de Categoria */}
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <Category sx={{ fontSize: 16, color: 'primary.main' }} />
                  Categoria
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.categoryId || ''}
                    onChange={(e) => handleFilterChange('categoryId', e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: 'grey.300'
                          }}
                        />
                        Todas as categorias
                      </Box>
                    </MenuItem>
                    <MenuItem value="no-category">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'warning.main' }}>
                        <Box
                          sx={{
                            width: 12,
                            height: 12,
                            borderRadius: '50%',
                            backgroundColor: 'transparent',
                            border: '2px dashed',
                            borderColor: 'warning.main'
                          }}
                        />
                        Sem categoria
                      </Box>
                    </MenuItem>
                    {categories.map(category => (
                      <MenuItem key={category.id} value={category.id}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Box
                            sx={{
                              width: 12,
                              height: 12,
                              borderRadius: '50%',
                              backgroundColor: category.color
                            }}
                          />
                          {category.name}
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Filtro de Tipo */}
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <TrendingUp sx={{ fontSize: 16, color: 'primary.main' }} />
                  Tipo
                </Typography>
                <FormControl fullWidth size="small">
                  <Select
                    value={filters.type || ''}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    displayEmpty
                    sx={{
                      borderRadius: 2,
                      '&:hover .MuiOutlinedInput-notchedOutline': {
                        borderColor: 'primary.main',
                      },
                    }}
                  >
                    <MenuItem value="">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'text.secondary' }}>
                        Todos os tipos
                      </Box>
                    </MenuItem>
                    <MenuItem value="income">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'success.main' }}>
                        <TrendingUp sx={{ fontSize: 16 }} />
                        Receita
                      </Box>
                    </MenuItem>
                    <MenuItem value="expense">
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: 'error.main' }}>
                        <TrendingDown sx={{ fontSize: 16 }} />
                        Despesa
                      </Box>
                    </MenuItem>
                  </Select>
                </FormControl>
              </Box>
            </Grid>

            {/* Filtros de Valor */}
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                  Valor Mínimo
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={filters.valueFrom || ''}
                  onChange={(e) => handleFilterChange('valueFrom', parseFloat(e.target.value) || undefined)}
                  placeholder="0,00"
                  inputProps={{ step: '0.01', min: '0' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2" color="text.secondary">R$</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6} lg={4}>
              <Box>
                <Typography 
                  variant="body2" 
                  fontWeight="600" 
                  color="text.primary" 
                  sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}
                >
                  <AttachMoney sx={{ fontSize: 16, color: 'primary.main' }} />
                  Valor Máximo
                </Typography>
                <TextField
                  type="number"
                  fullWidth
                  size="small"
                  value={filters.valueTo || ''}
                  onChange={(e) => handleFilterChange('valueTo', parseFloat(e.target.value) || undefined)}
                  placeholder="0,00"
                  inputProps={{ step: '0.01', min: '0' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Typography variant="body2" color="text.secondary">R$</Typography>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    '& .MuiOutlinedInput-root': {
                      borderRadius: 2,
                      '&:hover fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  }}
                />
              </Box>
            </Grid>
          </Grid>
        </Box>
      </Collapse>
    </Paper>
  )
} 