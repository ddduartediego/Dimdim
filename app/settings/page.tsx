'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Breadcrumbs,
  Link,
  Divider,
} from '@mui/material'
import {
  ArrowBack,
  Category as CategoryIcon,
  AdminPanelSettings,
  Psychology,
} from '@mui/icons-material'
import AdminCategoriesList from '@/components/settings/AdminCategoriesList'
import CustomInsightsList from '@/components/settings/CustomInsightsList'

interface TabPanelProps {
  children?: React.ReactNode
  index: number
  value: number
}

function TabPanel({ children, value, index }: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`settings-tabpanel-${index}`}
      aria-labelledby={`settings-tab-${index}`}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  )
}

function a11yProps(index: number) {
  return {
    id: `settings-tab-${index}`,
    'aria-controls': `settings-tabpanel-${index}`,
  }
}

export default function SettingsPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const handleBack = () => {
    router.push('/main')
  }

  if (!user) {
    router.push('/login')
    return null
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <AppBar position="static" elevation={0} sx={{ bgcolor: 'background.paper', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          <IconButton edge="start" onClick={handleBack} sx={{ mr: 2, color: 'text.primary' }}>
            <ArrowBack />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flex: 1 }}>
            <AdminPanelSettings sx={{ color: 'primary.main' }} />
            <Typography variant="h6" sx={{ color: 'text.primary', fontWeight: 600 }}>
              Configurações do Sistema
            </Typography>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Breadcrumbs */}
      <Container maxWidth="lg" sx={{ py: 2 }}>
        <Breadcrumbs aria-label="breadcrumb">
          <Link underline="hover" color="inherit" onClick={handleBack} sx={{ cursor: 'pointer' }}>
            Início
          </Link>
          <Typography color="text.primary">Configurações</Typography>
        </Breadcrumbs>
      </Container>

      {/* Content */}
      <Container maxWidth="lg">
        <Paper elevation={1} sx={{ overflow: 'hidden' }}>
          {/* Tabs Header */}
          <Box sx={{ borderBottom: 1, borderColor: 'divider', bgcolor: 'background.paper' }}>
            <Tabs 
              value={tabValue} 
              onChange={handleTabChange} 
              aria-label="configurações do sistema"
              sx={{ px: 2 }}
            >
              <Tab 
                icon={<CategoryIcon />} 
                label="Categorias Padrão" 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
                {...a11yProps(0)} 
              />
              <Tab 
                icon={<Psychology />} 
                label="Insights Personalizados" 
                iconPosition="start"
                sx={{ textTransform: 'none', fontWeight: 500 }}
                {...a11yProps(1)} 
              />
            </Tabs>
          </Box>

          {/* Tab Panels */}
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ px: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Gerenciar Categorias Padrão
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Configure as categorias padrão que estarão disponíveis para todos os usuários do sistema.
                  Estas categorias não podem ser editadas ou excluídas pelos usuários.
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <AdminCategoriesList />
            </Box>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            <Box sx={{ px: 3 }}>
              <Box sx={{ mb: 3 }}>
                <Typography variant="h5" gutterBottom sx={{ fontWeight: 600, color: 'text.primary' }}>
                  Insights Personalizados
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Crie e gerencie seus insights personalizados para receber alertas automáticos
                  baseados em condições específicas dos seus dados financeiros.
                </Typography>
              </Box>
              
              <Divider sx={{ mb: 3 }} />
              
              <CustomInsightsList />
            </Box>
          </TabPanel>
        </Paper>
      </Container>
    </Box>
  )
} 