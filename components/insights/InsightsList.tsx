'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Grid,
  Tabs,
  Tab,
  Chip,
  Button,
  Stack,
  Icon,
  ToggleButton,
  ToggleButtonGroup
} from '@mui/material'
import { MonthlyInsight } from '@/types/database'
import InsightCard from './InsightCard'
import { useRouter } from 'next/navigation'

interface InsightsListProps {
  insights: MonthlyInsight[]
  loading?: boolean
}

export default function InsightsList({ insights, loading = false }: InsightsListProps) {
  const router = useRouter()
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [showActionableOnly, setShowActionableOnly] = useState(false)

  // Filtrar insights
  const filteredInsights = insights.filter(insight => {
    if (selectedSeverity !== 'all' && insight.severity !== selectedSeverity) return false
    if (selectedType !== 'all' && insight.type !== selectedType) return false
    if (showActionableOnly && !insight.actionable) return false
    return true
  })

  // Agrupar por severidade para contadores
  const insightCounts = insights.reduce((acc, insight) => {
    acc[insight.severity] = (acc[insight.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Ações dos insights
  const handleInsightAction = (insight: MonthlyInsight) => {
    switch (insight.type) {
      case 'budget':
        router.push('/budgets')
        break
      case 'spending':
        router.push('/transactions')
        break
      case 'saving':
        router.push('/dashboard')
        break
      default:
        console.log('Insight ação:', insight)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Carregando insights...
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 4 }).map((_, index) => (
            <Grid item xs={12} md={6} key={index}>
              <Box
                sx={{
                  height: 180,
                  bgcolor: 'action.hover',
                  borderRadius: 1,
                  animation: 'pulse 1.5s ease-in-out infinite'
                }}
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    )
  }

  if (!insights || insights.length === 0) {
    return (
      <Box 
        sx={{ 
          p: 4, 
          textAlign: 'center',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: 2
        }}
      >
        <Icon sx={{ fontSize: 48, color: 'text.secondary' }}>lightbulb</Icon>
        <Typography variant="h6" color="text.secondary">
          Nenhum insight disponível
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Adicione mais transações e defina orçamentos para receber insights personalizados
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={() => router.push('/transactions')}
            startIcon={<Icon>add</Icon>}
          >
            Adicionar Transação
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/budgets')}
            startIcon={<Icon>account_balance_wallet</Icon>}
          >
            Definir Orçamentos
          </Button>
        </Stack>
      </Box>
    )
  }

  return (
    <Box>
      {/* Header com resumo */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Seus Insights Mensais
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Análises automáticas baseadas nos seus dados financeiros
        </Typography>
        
        {/* Chips de resumo */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Chip
            icon={<Icon>check_circle</Icon>}
            label={`${insightCounts.success || 0} Positivos`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>warning</Icon>}
            label={`${insightCounts.warning || 0} Atenção`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>error</Icon>}
            label={`${insightCounts.error || 0} Críticos`}
            color="error"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>info</Icon>}
            label={`${insightCounts.info || 0} Informativos`}
            color="info"
            variant="outlined"
            size="small"
          />
        </Stack>
      </Box>

      {/* Filtros */}
      <Box sx={{ mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems="start">
          {/* Filtro por severidade */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Severidade:
            </Typography>
            <Tabs
              value={selectedSeverity}
              onChange={(_, value) => setSelectedSeverity(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos" value="all" />
              <Tab label="Sucesso" value="success" />
              <Tab label="Atenção" value="warning" />
              <Tab label="Crítico" value="error" />
              <Tab label="Info" value="info" />
            </Tabs>
          </Box>

          {/* Filtro por tipo */}
          <Box>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Tipo:
            </Typography>
            <Tabs
              value={selectedType}
              onChange={(_, value) => setSelectedType(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos" value="all" />
              <Tab label="Economia" value="saving" />
              <Tab label="Gastos" value="spending" />
              <Tab label="Orçamento" value="budget" />
              <Tab label="Tendência" value="trend" />
            </Tabs>
          </Box>

          {/* Toggle apenas acionáveis */}
          <Box sx={{ mt: { xs: 1, sm: 3 } }}>
            <ToggleButtonGroup
              value={showActionableOnly}
              exclusive
              onChange={(_, value) => setShowActionableOnly(value !== null ? value : false)}
              size="small"
            >
              <ToggleButton value={true}>
                <Icon sx={{ mr: 1 }}>priority_high</Icon>
                Apenas Acionáveis
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Stack>
      </Box>

      {/* Lista de insights */}
      {filteredInsights.length === 0 ? (
        <Box sx={{ textAlign: 'center', py: 4 }}>
          <Typography variant="body1" color="text.secondary">
            Nenhum insight encontrado com os filtros aplicados
          </Typography>
          <Button
            variant="text"
            onClick={() => {
              setSelectedSeverity('all')
              setSelectedType('all')
              setShowActionableOnly(false)
            }}
            sx={{ mt: 1 }}
          >
            Limpar filtros
          </Button>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredInsights.map((insight, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
              <InsightCard
                insight={insight}
                onAction={handleInsightAction}
              />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  )
} 