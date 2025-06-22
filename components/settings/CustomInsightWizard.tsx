'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  Box,
  Typography,
  Card,
  CardContent,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  RadioGroup,
  FormControlLabel,
  Radio,
  Alert,
  Grid,
  Chip,
  Divider,
  CircularProgress
} from '@mui/material'
import {
  Close,
  NavigateNext,
  NavigateBefore,
  Save,
  Preview,
  Psychology,
  SmartToy
} from '@mui/icons-material'
import { useCustomInsights } from '@/hooks/useCustomInsights'
import { CustomInsight, InsightTemplate, InsightConditions } from '@/types/database'
import CategorySelect from '@/components/categories/CategorySelect'

interface CustomInsightWizardProps {
  open: boolean
  onClose: () => void
  editingInsight?: CustomInsight | null
}

const steps = [
  'Escolher Tipo',
  'Configurar Condições', 
  'Definir Detalhes',
  'Revisar e Salvar'
]

export default function CustomInsightWizard({ open, onClose, editingInsight }: CustomInsightWizardProps) {
  const { templates, createInsight, updateInsight } = useCustomInsights()
  
  const [activeStep, setActiveStep] = useState(0)
  const [insightType, setInsightType] = useState<'template' | 'custom'>('template')
  const [selectedTemplate, setSelectedTemplate] = useState<InsightTemplate | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    conditions: null as InsightConditions | null,
    formula: '',
    severity: 'info' as 'info' | 'warning' | 'success' | 'error',
    is_active: true
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Reset form quando abre/fecha
  useEffect(() => {
    if (open) {
      if (editingInsight) {
        // Modo edição
        setFormData({
          name: editingInsight.name,
          description: editingInsight.description || '',
          conditions: editingInsight.conditions as InsightConditions | null,
          formula: editingInsight.formula || '',
          severity: editingInsight.severity,
          is_active: editingInsight.is_active
        })
        setInsightType(editingInsight.insight_type)
        if (editingInsight.template_id) {
          const template = templates.find(t => t.id === editingInsight.template_id)
          setSelectedTemplate(template || null)
        }
      } else {
        // Modo criação
        setFormData({
          name: '',
          description: '',
          conditions: null,
          formula: '',
          severity: 'info',
          is_active: true
        })
        setInsightType('template')
        setSelectedTemplate(null)
      }
      setActiveStep(0)
      setError(null)
    }
  }, [open, editingInsight, templates])

  const handleNext = () => {
    setActiveStep((prev) => prev + 1)
  }

  const handleBack = () => {
    setActiveStep((prev) => prev - 1)
  }

  const handleTypeChange = (type: 'template' | 'custom') => {
    setInsightType(type)
    setSelectedTemplate(null)
    setFormData(prev => ({
      ...prev,
      conditions: null,
      formula: ''
    }))
  }

  const handleTemplateSelect = (template: InsightTemplate) => {
    setSelectedTemplate(template)
    setFormData(prev => ({
      ...prev,
      name: template.name,
      description: template.description,
      conditions: template.defaultConditions,
      severity: template.defaultSeverity
    }))
  }

  const handleConditionsChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      conditions: {
        ...prev.conditions,
        [field]: value
      } as InsightConditions
    }))
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      setError(null)

      const insightData = {
        name: formData.name,
        description: formData.description,
        conditions: insightType === 'template' ? formData.conditions : null,
        formula: insightType === 'custom' ? formData.formula : null,
        insight_type: insightType,
        template_id: selectedTemplate?.id || null,
        severity: formData.severity,
        is_active: formData.is_active,
        user_id: '' // Será definido no hook
      }

      if (editingInsight) {
        await updateInsight(editingInsight.id, insightData)
      } else {
        await createInsight(insightData)
      }

      onClose()
    } catch (err: any) {
      setError(err.message || 'Erro ao salvar insight')
    } finally {
      setLoading(false)
    }
  }

  const canProceed = () => {
    switch (activeStep) {
      case 0: // Escolher tipo
        return insightType === 'custom' || selectedTemplate !== null
      case 1: // Configurar condições
        if (insightType === 'template') {
          return formData.conditions !== null
        } else {
          return formData.formula.trim() !== ''
        }
      case 2: // Definir detalhes
        return formData.name.trim() !== ''
      default:
        return true
    }
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0: // Escolher Tipo
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Como você gostaria de criar seu insight?
            </Typography>
            
            <RadioGroup 
              value={insightType} 
              onChange={(e) => handleTypeChange(e.target.value as 'template' | 'custom')}
              sx={{ mb: 3 }}
            >
              <FormControlLabel 
                value="template" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">📋 Usar Template Pré-definido</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Escolha um dos templates prontos e personalize os parâmetros
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel 
                value="custom" 
                control={<Radio />} 
                label={
                  <Box>
                    <Typography variant="body1">🧮 Criar Fórmula Personalizada</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Crie uma condição completamente personalizada usando fórmulas
                    </Typography>
                  </Box>
                }
              />
            </RadioGroup>

            {insightType === 'template' && (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  Selecione um Template:
                </Typography>
                <Grid container spacing={2}>
                  {templates.map((template) => (
                    <Grid item xs={12} md={6} key={template.id}>
                      <Card 
                        sx={{ 
                          cursor: 'pointer',
                          border: selectedTemplate?.id === template.id ? 2 : 1,
                          borderColor: selectedTemplate?.id === template.id ? 'primary.main' : 'divider'
                        }}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <CardContent>
                          <Typography variant="h6" gutterBottom>
                            {template.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {template.description}
                          </Typography>
                          <Box sx={{ mt: 1 }}>
                            <Chip label={template.category} size="small" />
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Box>
            )}
          </Box>
        )

      case 1: // Configurar Condições
        return (
          <Box>
            {insightType === 'template' && selectedTemplate ? (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Configurar Template: {selectedTemplate.name}
                </Typography>
                
                {selectedTemplate.parameters.map((param) => (
                  <Box key={param.key} sx={{ mb: 2 }}>
                    {param.type === 'category' ? (
                      <FormControl fullWidth>
                        <CategorySelect
                          value={formData.conditions?.[param.key as keyof InsightConditions] as string || ''}
                          onChange={(value) => handleConditionsChange(param.key, value)}
                          label={param.label}
                          required={param.required}
                        />
                      </FormControl>
                    ) : (
                      <TextField
                        fullWidth
                        label={param.label}
                        type={param.type === 'number' || param.type === 'percentage' ? 'number' : 'text'}
                        value={formData.conditions?.[param.key as keyof InsightConditions] || param.defaultValue || ''}
                        onChange={(e) => handleConditionsChange(param.key, 
                          param.type === 'number' || param.type === 'percentage' 
                            ? Number(e.target.value) 
                            : e.target.value
                        )}
                        helperText={param.description}
                        required={param.required}
                      />
                    )}
                  </Box>
                ))}
              </Box>
            ) : (
              <Box>
                <Typography variant="h6" gutterBottom>
                  Criar Fórmula Personalizada
                </Typography>
                
                <Alert severity="info" sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    Crie uma fórmula usando as variáveis disponíveis:
                    <br />• total_expenses, total_income, balance
                    <br />• transaction_count, expenses_change_percentage
                    <br />• category_amount[&apos;Nome da Categoria&apos;]
                  </Typography>
                </Alert>

                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  label="Fórmula"
                  placeholder="Ex: total_expenses > 1000 AND category_amount[&apos;Alimentação&apos;] > 500"
                  value={formData.formula}
                  onChange={(e) => setFormData(prev => ({ ...prev, formula: e.target.value }))}
                  helperText="Use operadores: >, <, >=, <=, ==, != e lógicos AND, OR"
                />
              </Box>
            )}
          </Box>
        )

      case 2: // Definir Detalhes
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Detalhes do Insight
            </Typography>
            
            <TextField
              fullWidth
              label="Nome do Insight"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              sx={{ mb: 2 }}
              required
            />

            <TextField
              fullWidth
              multiline
              rows={3}
              label="Descrição (opcional)"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              sx={{ mb: 2 }}
            />

            <FormControl fullWidth sx={{ mb: 2 }}>
              <InputLabel>Nível de Severidade</InputLabel>
              <Select
                value={formData.severity}
                onChange={(e) => setFormData(prev => ({ ...prev, severity: e.target.value as any }))}
                label="Nível de Severidade"
              >
                <MenuItem value="info">📘 Informativo</MenuItem>
                <MenuItem value="success">✅ Sucesso</MenuItem>
                <MenuItem value="warning">⚠️ Atenção</MenuItem>
                <MenuItem value="error">🚨 Crítico</MenuItem>
              </Select>
            </FormControl>
          </Box>
        )

      case 3: // Revisar e Salvar
        return (
          <Box>
            <Typography variant="h6" gutterBottom>
              Revisão Final
            </Typography>
            
            <Card sx={{ mb: 2 }}>
              <CardContent>
                <Typography variant="subtitle1" gutterBottom>
                  <strong>{formData.name}</strong>
                </Typography>
                {formData.description && (
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {formData.description}
                  </Typography>
                )}
                
                <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                  <Chip 
                    label={insightType === 'template' ? 'Template' : 'Personalizado'} 
                    size="small" 
                  />
                  <Chip 
                    label={formData.severity} 
                    size="small"
                    color={formData.severity === 'success' ? 'success' : 
                           formData.severity === 'warning' ? 'warning' :
                           formData.severity === 'error' ? 'error' : 'default'}
                  />
                </Box>

                <Divider sx={{ my: 1 }} />
                
                <Typography variant="body2" color="text.secondary">
                  <strong>Condição:</strong>
                </Typography>
                {insightType === 'template' && formData.conditions ? (
                  <Typography variant="body2">
                    {JSON.stringify(formData.conditions, null, 2)}
                  </Typography>
                ) : (
                  <Typography variant="body2">
                    {formData.formula}
                  </Typography>
                )}
              </CardContent>
            </Card>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
          </Box>
        )

      default:
        return null
    }
  }

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth="md" 
      fullWidth
      PaperProps={{ sx: { minHeight: '600px' } }}
    >
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Psychology color="primary" />
        {editingInsight ? 'Editar Insight' : 'Criar Novo Insight'}
      </DialogTitle>

      <DialogContent>
        <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {renderStepContent()}
      </DialogContent>

      <DialogActions sx={{ p: 3 }}>
        <Button onClick={onClose} startIcon={<Close />}>
          Cancelar
        </Button>

        <Box sx={{ flex: 1 }} />

        {activeStep > 0 && (
          <Button onClick={handleBack} startIcon={<NavigateBefore />}>
            Voltar
          </Button>
        )}

        {activeStep < steps.length - 1 ? (
          <Button 
            variant="contained" 
            onClick={handleNext}
            disabled={!canProceed()}
            endIcon={<NavigateNext />}
          >
            Próximo
          </Button>
        ) : (
          <Button 
            variant="contained" 
            onClick={handleSave}
            disabled={!canProceed() || loading}
            startIcon={loading ? <CircularProgress size={16} /> : <Save />}
          >
            {loading ? 'Salvando...' : (editingInsight ? 'Atualizar' : 'Criar Insight')}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  )
} 