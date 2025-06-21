import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'

// Configurar day.js para português brasileiro
dayjs.locale('pt-br')

export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value)
}

export const formatDate = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY')
}

export const formatDateTime = (date: string | Date): string => {
  return dayjs(date).format('DD/MM/YYYY HH:mm')
}

export const getDateRange = (period: 'day' | 'week' | 'month') => {
  const now = dayjs()
  
  switch (period) {
    case 'day':
      return {
        start: now.startOf('day').toISOString(),
        end: now.endOf('day').toISOString(),
      }
    case 'week':
      return {
        start: now.startOf('week').toISOString(),
        end: now.endOf('week').toISOString(),
      }
    case 'month':
      return {
        start: now.startOf('month').toISOString(),
        end: now.endOf('month').toISOString(),
      }
    default:
      return {
        start: now.startOf('month').toISOString(),
        end: now.endOf('month').toISOString(),
      }
  }
}

export const cn = (...classes: (string | undefined | null | false)[]): string => {
  return classes.filter(Boolean).join(' ')
} 