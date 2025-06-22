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
  ToggleButtonGroup,
  Card,
  CardContent,
  Alert,
  Divider,
  IconButton,
  Tooltip
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { MonthlyInsight } from '@/types/database'
import InsightCard from './InsightCard'

interface CustomInsightsReportsListProps {
  insights: MonthlyInsight[]
  loading?: boolean
}

export default function CustomInsightsReportsList({ insights, loading = false }: CustomInsightsReportsListProps) {
  const router = useRouter()
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all')
  const [showActiveOnly, setShowActiveOnly] = useState(false)

  // Filtrar insights personalizados
  const customInsights = insights.filter(insight => insight.source === 'custom')

  // Aplicar filtros
  const filteredInsights = customInsights.filter(insight => {
    if (selectedSeverity !== 'all' && insight.severity !== selectedSeverity) return false
    // Note: showActiveOnly seria implementado se tivéssemos informação sobre status ativo
    return true
  })

  // Agrupar por severidade para contadores
  const insightCounts = customInsights.reduce((acc, insight) => {
    acc[insight.severity] = (acc[insight.severity] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  // Estatísticas de insights personalizados
  const stats = {
    total: customInsights.length,
    triggered: customInsights.length, // Todos que aparecem aqui foram disparados
    critical: insightCounts.error || 0,
    warning: insightCounts.warning || 0,
    success: insightCounts.success || 0,
    info: insightCounts.info || 0
  }

  // Ações dos insights
  const handleInsightAction = (insight: MonthlyInsight) => {
    switch (insight.type) {
      case 'budget':
        router.push('/budgets')
        break
      case 'spending':
        router.push('/main')
        break
      case 'saving':
        router.push('/main')
        break
      default:
        console.log('Insight ação:', insight)
    }
  }

  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>
          Carregando insights personalizados...
        </Typography>
        <Grid container spacing={2}>
          {Array.from({ length: 3 }).map((_, index) => (
            <Grid item xs={12} md={6} lg={4} key={index}>
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

  if (customInsights.length === 0) {
    return (
      <Card sx={{ textAlign: 'center', p: 4 }}>
        <Icon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }}>psychology</Icon>
        <Typography variant="h6" gutterBottom>
          Nenhum insight personalizado ativo
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Crie seus próprios insights personalizados para receber alertas
          baseados em condições específicas dos seus dados financeiros.
        </Typography>
        <Stack direction="row" spacing={1} justifyContent="center">
          <Button
            variant="contained"
            onClick={() => router.push('/settings')}
            startIcon={<Icon>add</Icon>}
          >
            Criar Insight Personalizado
          </Button>
          <Button
            variant="outlined"
            onClick={() => router.push('/settings')}
            startIcon={<Icon>settings</Icon>}
          >
            Gerenciar Insights
          </Button>
        </Stack>
      </Card>
    )
  }

  return (
    <Box>
      {/* Estatísticas dos Insights Personalizados */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6" sx={{ color: 'white', display: 'flex', alignItems: 'center', gap: 1 }}>
              <Icon>psychology</Icon>
              Resumo dos Insights Personalizados
            </Typography>
            <Tooltip title="Gerenciar Insights">
              <IconButton 
                sx={{ color: 'white' }} 
                onClick={() => router.push('/settings')}
              >
                <Icon>settings</Icon>
              </IconButton>
            </Tooltip>
          </Box>
          
          <Grid container spacing={2}>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats.total}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Total Criados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: 'white', fontWeight: 'bold' }}>
                  {stats.triggered}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Disparados
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ff4444', fontWeight: 'bold' }}>
                  {stats.critical}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Críticos
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={6} sm={3}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="h4" sx={{ color: '#ffaa00', fontWeight: 'bold' }}>
                  {stats.warning}
                </Typography>
                <Typography variant="body2" sx={{ color: 'rgba(255,255,255,0.8)' }}>
                  Atenção
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Chips de resumo por severidade */}
      <Box sx={{ mb: 3 }}>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Status dos insights no período atual:
        </Typography>
        <Stack direction="row" spacing={1} flexWrap="wrap">
          <Chip
            icon={<Icon>check_circle</Icon>}
            label={`${stats.success} Positivos`}
            color="success"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>warning</Icon>}
            label={`${stats.warning} Atenção`}
            color="warning"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>error</Icon>}
            label={`${stats.critical} Críticos`}
            color="error"
            variant="outlined"
            size="small"
          />
          <Chip
            icon={<Icon>info</Icon>}
            label={`${stats.info} Informativos`}
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
              Filtrar por severidade:
            </Typography>
            <Tabs
              value={selectedSeverity}
              onChange={(_, value) => setSelectedSeverity(value)}
              variant="scrollable"
              scrollButtons="auto"
            >
              <Tab label="Todos" value="all" />
              <Tab label="Crítico" value="error" />
              <Tab label="Atenção" value="warning" />
              <Tab label="Sucesso" value="success" />
              <Tab label="Info" value="info" />
            </Tabs>
          </Box>
        </Stack>
      </Box>

      {/* Insights personalizados disparados */}
      {filteredInsights.length === 0 ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          <Typography variant="body2">
            Nenhum insight personalizado foi disparado com os filtros aplicados.
            {selectedSeverity !== 'all' && (
              <>
                {' '}
                <Button
                  size="small"
                  onClick={() => setSelectedSeverity('all')}
                  sx={{ ml: 1 }}
                >
                  Ver todos
                </Button>
              </>
            )}
          </Typography>
        </Alert>
      ) : (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">
              🎯 Insights Disparados ({filteredInsights.length})
            </Typography>
            <Button
              variant="outlined"
              size="small"
              startIcon={<Icon>add</Icon>}
              onClick={() => router.push('/settings')}
            >
              Criar Novo
            </Button>
          </Box>

          <Grid container spacing={2}>
            {filteredInsights.map((insight, index) => (
              <Grid item xs={12} md={6} lg={4} key={`${insight.customInsightId}-${index}`}>
                <Box sx={{ position: 'relative' }}>
                  {/* Badge indicando que é personalizado */}
                  <Chip
                    label="Personalizado"
                    size="small"
                    color="primary"
                    sx={{ 
                      position: 'absolute', 
                      top: 8, 
                      right: 8, 
                      zIndex: 1,
                      fontSize: '0.7rem',
                      height: 20
                    }}
                  />
                  <InsightCard
                    insight={insight}
                    onAction={handleInsightAction}
                  />
                </Box>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Call-to-action para criar mais insights */}
      {customInsights.length > 0 && (
        <Card sx={{ mt: 4, p: 3, bgcolor: 'action.hover' }}>
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              💡 Quer mais insights personalizados?
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Crie alertas específicos para suas necessidades financeiras
            </Typography>
            <Stack direction="row" spacing={1} justifyContent="center">
              <Button
                variant="contained"
                startIcon={<Icon>add</Icon>}
                onClick={() => router.push('/settings')}
              >
                Criar Insight
              </Button>
              <Button
                variant="outlined"
                startIcon={<Icon>settings</Icon>}
                onClick={() => router.push('/settings')}
              >
                Gerenciar Insights
              </Button>
            </Stack>
          </Box>
        </Card>
      )}
    </Box>
  )
} 