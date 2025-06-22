'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  CircularProgress,
} from '@mui/material'
import { Icon } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

dayjs.locale('pt-br')

interface MonthlyFilterProps {
  selectedMonth: number
  selectedYear: number
  onMonthChange: (month: number) => void
  onYearChange: (year: number) => void
  onRefresh?: () => void
  loading?: boolean
  title?: string
  showRefreshButton?: boolean
}

export default function MonthlyFilter({
  selectedMonth,
  selectedYear,
  onMonthChange,
  onYearChange,
  onRefresh,
  loading = false,
  title,
  showRefreshButton = true
}: MonthlyFilterProps) {
  // Gerar anos disponíveis (últimos 3 anos + próximo ano)
  const currentYear = dayjs().year()
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => currentYear - 2 + i
  )

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = dayjs().year(selectedYear).month(selectedMonth - 1)
    const newDate = direction === 'prev' 
      ? currentDate.subtract(1, 'month')
      : currentDate.add(1, 'month')
    
    onMonthChange(newDate.month() + 1)
    onYearChange(newDate.year())
  }

  const currentMonthName = dayjs()
    .year(selectedYear)
    .month(selectedMonth - 1)
    .format('MMMM [de] YYYY')

  return (
    <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
        <Typography variant="h6" sx={{ flexGrow: 1 }}>
          {title ? `${title} - ` : ''}📅 {currentMonthName}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
          <IconButton
            onClick={() => navigateMonth('prev')}
            size="small"
            disabled={loading}
          >
            <Icon>chevron_left</Icon>
          </IconButton>

          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Mês</InputLabel>
            <Select
              value={selectedMonth}
              label="Mês"
              onChange={(e) => onMonthChange(e.target.value as number)}
              disabled={loading}
            >
              {Array.from({ length: 12 }, (_, i) => (
                <MenuItem key={i + 1} value={i + 1}>
                  {dayjs().month(i).format('MMMM')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 100 }}>
            <InputLabel>Ano</InputLabel>
            <Select
              value={selectedYear}
              label="Ano"
              onChange={(e) => onYearChange(e.target.value as number)}
              disabled={loading}
            >
              {availableYears.map(year => (
                <MenuItem key={year} value={year}>
                  {year}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <IconButton
            onClick={() => navigateMonth('next')}
            size="small"
            disabled={loading}
          >
            <Icon>chevron_right</Icon>
          </IconButton>

          {showRefreshButton && onRefresh && (
            <Button
              variant="outlined"
              onClick={onRefresh}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Icon>refresh</Icon>}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          )}
        </Box>
      </Box>
    </Paper>
  )
} 