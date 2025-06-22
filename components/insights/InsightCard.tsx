'use client'

import {
  Card,
  CardContent,
  Typography,
  Box,
  Chip,
  Icon,
  Button,
  Alert,
  AlertTitle
} from '@mui/material'
import { MonthlyInsight } from '@/types/database'

interface InsightCardProps {
  insight: MonthlyInsight
  onAction?: (insight: MonthlyInsight) => void
}

export default function InsightCard({ insight, onAction }: InsightCardProps) {
  
  const getSeverityColor = (severity: MonthlyInsight['severity']) => {
    switch (severity) {
      case 'success':
        return 'success'
      case 'warning':
        return 'warning'
      case 'error':
        return 'error'
      case 'info':
      default:
        return 'info'
    }
  }

  const getTypeIcon = (type: MonthlyInsight['type']) => {
    switch (type) {
      case 'saving':
        return 'savings'
      case 'spending':
        return 'shopping_cart'
      case 'budget':
        return 'account_balance_wallet'
      case 'trend':
        return 'trending_up'
      default:
        return 'info'
    }
  }

  const getTypeLabel = (type: MonthlyInsight['type']) => {
    switch (type) {
      case 'saving':
        return 'Economia'
      case 'spending':
        return 'Gastos'
      case 'budget':
        return 'Orçamento'
      case 'trend':
        return 'Tendência'
      default:
        return 'Informação'
    }
  }

  return (
    <Card 
      sx={{ 
        height: '100%',
        border: (theme) => insight.severity === 'error' ? `2px solid ${theme.palette.error.main}` :
                           insight.severity === 'warning' ? `1px solid ${theme.palette.warning.main}` :
                           insight.severity === 'success' ? `1px solid ${theme.palette.success.main}` :
                           undefined,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-2px)',
          boxShadow: 3
        }
      }}
    >
      <CardContent>
        {/* Header com tipo e severidade */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
            <Icon 
              color={getSeverityColor(insight.severity)}
              sx={{ fontSize: 20 }}
            >
              {getTypeIcon(insight.type)}
            </Icon>
            <Chip
              label={getTypeLabel(insight.type)}
              size="small"
              color={getSeverityColor(insight.severity)}
              variant="outlined"
            />
            {insight.source === 'custom' && (
              <Chip
                label="Personalizado"
                size="small"
                color="primary"
                variant="filled"
                sx={{ fontSize: '0.7rem', height: 20 }}
              />
            )}
          </Box>
          
          {insight.actionable && (
            <Icon sx={{ fontSize: 16, color: 'warning.main' }}>
              priority_high
            </Icon>
          )}
        </Box>

        {/* Título principal */}
        <Typography 
          variant="h6" 
          gutterBottom
          sx={{
            fontSize: '1rem',
            fontWeight: 600,
            lineHeight: 1.3,
            mb: 1
          }}
        >
          {insight.title}
        </Typography>

        {/* Descrição */}
        <Typography 
          variant="body2" 
          color="text.secondary"
          sx={{
            lineHeight: 1.4,
            mb: insight.actionable ? 2 : 0
          }}
        >
          {insight.description}
        </Typography>

        {/* Botão de ação se aplicável */}
        {insight.actionable && onAction && (
          <Button
            variant="outlined"
            size="small"
            color={getSeverityColor(insight.severity)}
            onClick={() => onAction(insight)}
            sx={{ mt: 1 }}
          >
            {insight.type === 'budget' ? 'Ver Orçamentos' :
             insight.type === 'spending' ? 'Ver Transações' :
             'Tomar Ação'}
          </Button>
        )}

        {/* Dados adicionais se disponíveis */}
        {insight.data && (
          <Box sx={{ mt: 2, pt: 2, borderTop: 1, borderColor: 'divider' }}>
            {insight.data.amount && (
              <Typography variant="caption" color="text.secondary" display="block">
                Valor: R$ {insight.data.amount.toFixed(2)}
              </Typography>
            )}
            {insight.data.percentage && (
              <Typography variant="caption" color="text.secondary" display="block">
                Percentual: {insight.data.percentage.toFixed(1)}%
              </Typography>
            )}
            {insight.data.category && (
              <Typography variant="caption" color="text.secondary" display="block">
                Categoria: {insight.data.category}
              </Typography>
            )}
          </Box>
        )}
      </CardContent>
    </Card>
  )
} 