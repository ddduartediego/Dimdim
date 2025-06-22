'use client'

import { useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Switch,
  Alert,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Tooltip,
  Menu,
  MenuItem,
  Stack,
  Divider
} from '@mui/material'
import {
  Add,
  Edit,
  Delete,
  ContentCopy,
  MoreVert,
  Psychology,
  Lightbulb,
  TrendingUp,
  Warning,
  CheckCircle,
  Error,
  Info
} from '@mui/icons-material'
import { useCustomInsights } from '@/hooks/useCustomInsights'
import { CustomInsight } from '@/types/database'
import CustomInsightWizard from './CustomInsightWizard'

export default function CustomInsightsList() {
  const {
    insights,
    loading,
    error,
    deleteInsight,
    toggleInsight,
    duplicateInsight,
    refreshInsights
  } = useCustomInsights()

  const [wizardOpen, setWizardOpen] = useState(false)
  const [editingInsight, setEditingInsight] = useState<CustomInsight | null>(null)
  const [deletingInsight, setDeletingInsight] = useState<CustomInsight | null>(null)
  const [menuAnchor, setMenuAnchor] = useState<null | HTMLElement>(null)
  const [selectedInsight, setSelectedInsight] = useState<CustomInsight | null>(null)

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, insight: CustomInsight) => {
    setMenuAnchor(event.currentTarget)
    setSelectedInsight(insight)
  }

  const handleMenuClose = () => {
    setMenuAnchor(null)
    setSelectedInsight(null)
  }

  const handleEdit = () => {
    if (selectedInsight) {
      setEditingInsight(selectedInsight)
      setWizardOpen(true)
    }
    handleMenuClose()
  }

  const handleDuplicate = async () => {
    if (selectedInsight) {
      try {
        await duplicateInsight(selectedInsight.id)
      } catch (error) {
        console.error('Erro ao duplicar insight:', error)
      }
    }
    handleMenuClose()
  }

  const handleDeleteConfirm = () => {
    if (selectedInsight) {
      setDeletingInsight(selectedInsight)
    }
    handleMenuClose()
  }

  const handleDeleteExecute = async () => {
    if (deletingInsight) {
      try {
        await deleteInsight(deletingInsight.id)
        setDeletingInsight(null)
      } catch (error) {
        console.error('Erro ao deletar insight:', error)
      }
    }
  }

  const handleToggle = async (insight: CustomInsight) => {
    try {
      await toggleInsight(insight.id, !insight.is_active)
    } catch (error) {
      console.error('Erro ao alterar status do insight:', error)
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'success': return <CheckCircle sx={{ color: 'success.main' }} />
      case 'warning': return <Warning sx={{ color: 'warning.main' }} />
      case 'error': return <Error sx={{ color: 'error.main' }} />
      default: return <Info sx={{ color: 'info.main' }} />
    }
  }

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case 'success': return 'Sucesso'
      case 'warning': return 'Atenção'
      case 'error': return 'Crítico'
      default: return 'Informativo'
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'template': return 'Template'
      case 'custom': return 'Personalizado'
      default: return type
    }
  }

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    )
  }

  if (error) {
    return (
      <Alert 
        severity="error" 
        sx={{ mb: 2 }}
        action={
          <Button color="inherit" size="small" onClick={refreshInsights}>
            Tentar Novamente
          </Button>
        }
      >
        {error}
      </Alert>
    )
  }

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h6" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Psychology color="primary" />
            Insights Personalizados
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Crie alertas personalizados baseados em suas transações e orçamentos
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<Add />}
          onClick={() => {
            setEditingInsight(null)
            setWizardOpen(true)
          }}
        >
          Criar Insight
        </Button>
      </Box>

      {/* Lista de Insights */}
      {insights.length === 0 ? (
        <Card sx={{ textAlign: 'center', p: 4 }}>
          <Lightbulb sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
          <Typography variant="h6" gutterBottom>
            Nenhum insight personalizado criado
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Comece criando seu primeiro insight personalizado para receber alertas automáticos
            baseados em suas condições específicas.
          </Typography>
          <Button
            variant="outlined"
            startIcon={<Add />}
            onClick={() => {
              setEditingInsight(null)
              setWizardOpen(true)
            }}
          >
            Criar Primeiro Insight
          </Button>
        </Card>
      ) : (
        <Grid container spacing={2}>
          {insights.map((insight) => (
            <Grid item xs={12} md={6} lg={4} key={insight.id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  opacity: insight.is_active ? 1 : 0.7,
                  border: insight.is_active ? 1 : 0,
                  borderColor: insight.is_active ? 'primary.main' : 'transparent'
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  {/* Header do Card */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {getSeverityIcon(insight.severity)}
                      <Switch
                        checked={insight.is_active}
                        onChange={() => handleToggle(insight)}
                        size="small"
                      />
                    </Box>
                    <IconButton
                      size="small"
                      onClick={(e) => handleMenuOpen(e, insight)}
                    >
                      <MoreVert />
                    </IconButton>
                  </Box>

                  {/* Título */}
                  <Typography variant="h6" gutterBottom sx={{ fontSize: '1rem' }}>
                    {insight.name}
                  </Typography>

                  {/* Descrição */}
                  {insight.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {insight.description}
                    </Typography>
                  )}

                  {/* Chips de Info */}
                  <Stack direction="row" spacing={1} flexWrap="wrap" sx={{ mb: 2 }}>
                    <Chip
                      label={getSeverityLabel(insight.severity)}
                      size="small"
                      color={insight.severity === 'success' ? 'success' : 
                             insight.severity === 'warning' ? 'warning' :
                             insight.severity === 'error' ? 'error' : 'default'}
                      variant="outlined"
                    />
                    <Chip
                      label={getTypeLabel(insight.insight_type)}
                      size="small"
                      variant="outlined"
                    />
                  </Stack>

                  {/* Condições (Preview) */}
                  <Box sx={{ fontSize: '0.75rem', color: 'text.secondary' }}>
                    {insight.conditions ? (
                      <Typography variant="caption" component="div">
                        📋 Condição estruturada definida
                      </Typography>
                    ) : insight.formula ? (
                      <Typography variant="caption" component="div">
                        🧮 Fórmula: {insight.formula.length > 30 ? `${insight.formula.substring(0, 30)}...` : insight.formula}
                      </Typography>
                    ) : (
                      <Typography variant="caption" component="div" color="error">
                        ⚠️ Sem condições definidas
                      </Typography>
                    )}
                  </Box>
                </CardContent>

                <Divider />

                <CardActions sx={{ justifyContent: 'space-between', px: 2 }}>
                  <Typography variant="caption" color="text.secondary">
                    {insight.is_active ? 'Ativo' : 'Inativo'}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {new Date(insight.created_at).toLocaleDateString('pt-BR')}
                  </Typography>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Menu de Ações */}
      <Menu
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEdit}>
          <Edit sx={{ mr: 1 }} />
          Editar
        </MenuItem>
        <MenuItem onClick={handleDuplicate}>
          <ContentCopy sx={{ mr: 1 }} />
          Duplicar
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteConfirm} sx={{ color: 'error.main' }}>
          <Delete sx={{ mr: 1 }} />
          Excluir
        </MenuItem>
      </Menu>

      {/* Dialog de Confirmação de Exclusão */}
      <Dialog open={Boolean(deletingInsight)} onClose={() => setDeletingInsight(null)}>
        <DialogTitle>Confirmar Exclusão</DialogTitle>
        <DialogContent>
          <Typography>
            Tem certeza que deseja excluir o insight "{deletingInsight?.name}"?
            Esta ação não pode ser desfeita.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeletingInsight(null)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleDeleteExecute} 
            color="error" 
            variant="contained"
          >
            Excluir
          </Button>
        </DialogActions>
      </Dialog>

      {/* Wizard de Criação/Edição */}
      <CustomInsightWizard
        open={wizardOpen}
        onClose={() => {
          setWizardOpen(false)
          setEditingInsight(null)
        }}
        editingInsight={editingInsight}
      />
    </Box>
  )
} 