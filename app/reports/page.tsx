'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  Button,
  IconButton,
  Alert,
  CircularProgress,
  Tabs,
  Tab,
  Divider
} from '@mui/material'
import { Icon } from '@mui/material'
import dayjs from 'dayjs'
import 'dayjs/locale/pt-br'
import { useAuth } from '@/contexts/AuthContext'
import useInsights from '@/hooks/useInsights'
import CategoryPieChart from '@/components/charts/CategoryPieChart'
import MonthlyComparison from '@/components/charts/MonthlyComparison'
import InsightsList from '@/components/insights/InsightsList'
import CustomInsightsReportsList from '@/components/insights/CustomInsightsReportsList'

dayjs.locale('pt-br')

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`reports-tabpanel-${index}`}
      aria-labelledby={`reports-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

export default function ReportsPage() {
  const { user } = useAuth()
  const [selectedMonth, setSelectedMonth] = useState(dayjs().month() + 1)
  const [selectedYear, setSelectedYear] = useState(dayjs().year())
  const [tabValue, setTabValue] = useState(0)

  const {
    insights,
    automaticInsights,
    customInsights,
    analytics,
    categoryData,
    loading,
    error,
    refreshInsights
  } = useInsights(selectedMonth, selectedYear)

  // Gerar anos disponíveis (últimos 3 anos + próximo ano)
  const currentYear = dayjs().year()
  const availableYears = Array.from(
    { length: 5 },
    (_, i) => currentYear - 2 + i
  )

  const handlePeriodChange = () => {
    refreshInsights()
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentDate = dayjs().year(selectedYear).month(selectedMonth - 1)
    const newDate = direction === 'prev' 
      ? currentDate.subtract(1, 'month')
      : currentDate.add(1, 'month')
    
    setSelectedMonth(newDate.month() + 1)
    setSelectedYear(newDate.year())
  }

  const currentMonthName = dayjs()
    .year(selectedYear)
    .month(selectedMonth - 1)
    .format('MMMM [de] YYYY')

  if (!user) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert severity="warning">
          Você precisa estar logado para acessar os relatórios.
        </Alert>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📊 Relatórios e Insights
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Análises inteligentes dos seus dados financeiros
        </Typography>
      </Box>

      {/* Controles de período */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            📅 {currentMonthName}
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
                onChange={(e) => setSelectedMonth(e.target.value as number)}
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
                onChange={(e) => setSelectedYear(e.target.value as number)}
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

            <Button
              variant="outlined"
              onClick={handlePeriodChange}
              disabled={loading}
              startIcon={loading ? <CircularProgress size={16} /> : <Icon>refresh</Icon>}
            >
              {loading ? 'Carregando...' : 'Atualizar'}
            </Button>
          </Box>
        </Box>
      </Paper>

      {/* Erro */}
      {error && (
        <Alert severity="error" sx={{ mb: 4 }}>
          <Typography variant="body2">
            Erro ao carregar dados: {error}
          </Typography>
          <Button size="small" onClick={refreshInsights} sx={{ mt: 1 }}>
            Tentar novamente
          </Button>
        </Alert>
      )}

      {/* Tabs de navegação */}
      <Paper elevation={1} sx={{ mb: 4 }}>
        <Tabs
          value={tabValue}
          onChange={(_, newValue) => setTabValue(newValue)}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab 
            label="Insights Automáticos" 
            icon={<Icon>auto_awesome</Icon>}
            iconPosition="start"
          />
          <Tab 
            label="Insights Personalizados" 
            icon={<Icon>psychology</Icon>}
            iconPosition="start"
          />
          <Tab 
            label="Gráficos" 
            icon={<Icon>pie_chart</Icon>}
            iconPosition="start"
          />
          <Tab 
            label="Comparação" 
            icon={<Icon>compare_arrows</Icon>}
            iconPosition="start"
          />
        </Tabs>
      </Paper>

      {/* Conteúdo das tabs */}
      <TabPanel value={tabValue} index={0}>
        {/* Tab Insights Automáticos */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">auto_awesome</Icon>
            Insights Automáticos
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Análises geradas automaticamente com base nos seus dados financeiros
          </Typography>
        </Box>
        <InsightsList 
          insights={automaticInsights} 
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={1}>
        {/* Tab Insights Personalizados */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Icon color="primary">psychology</Icon>
            Insights Personalizados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Alertas criados por você com condições específicas
          </Typography>
        </Box>
        
        <CustomInsightsReportsList 
          insights={insights} 
          loading={loading}
        />
      </TabPanel>

      <TabPanel value={tabValue} index={2}>
        {/* Tab Gráficos */}
        <Grid container spacing={4}>
          <Grid item xs={12} lg={8}>
            <Paper elevation={1} sx={{ p: 3 }}>
              <CategoryPieChart
                data={categoryData}
                title={`Gastos por Categoria - ${currentMonthName}`}
                height={450}
              />
            </Paper>
          </Grid>

          <Grid item xs={12} lg={4}>
            <Paper elevation={1} sx={{ p: 3, height: 'fit-content' }}>
              <Typography variant="h6" gutterBottom>
                📈 Resumo do Período
              </Typography>
              <Divider sx={{ mb: 2 }} />
              
              {analytics ? (
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Total de Gastos
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      R$ {analytics.current_month.total_expenses.toFixed(2)}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Número de Transações
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {analytics.current_month.transaction_count}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Categorias Utilizadas
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      {categoryData.length}
                    </Typography>
                  </Box>

                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      Média por Transação
                    </Typography>
                    <Typography variant="h6" fontWeight="bold">
                      R$ {analytics.current_month.transaction_count > 0 
                        ? (analytics.current_month.total_expenses / analytics.current_month.transaction_count).toFixed(2)
                        : '0.00'
                      }
                    </Typography>
                  </Box>

                  {categoryData.length > 0 && (
                    <Box>
                      <Typography variant="body2" color="text.secondary">
                        Categoria com Maior Gasto
                      </Typography>
                      <Typography variant="h6" fontWeight="bold">
                        {categoryData[0]?.name || 'N/A'}
                      </Typography>
                    </Box>
                  )}
                </Box>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  Carregando dados...
                </Typography>
              )}
            </Paper>
          </Grid>
        </Grid>
      </TabPanel>

      <TabPanel value={tabValue} index={3}>
        {/* Tab Comparação */}
        {analytics ? (
          <Paper elevation={1} sx={{ p: 3 }}>
            <MonthlyComparison analytics={analytics} />
          </Paper>
        ) : (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
            <Typography variant="body2" sx={{ mt: 2 }}>
              Carregando dados de comparação...
            </Typography>
          </Box>
        )}
      </TabPanel>

      {/* Footer */}
      <Box sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary">
          Os insights são atualizados automaticamente conforme você adiciona novas transações
        </Typography>
      </Box>
    </Container>
  )
} 