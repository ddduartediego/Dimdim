'use client'

import { useState } from 'react'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stepper,
  Step,
  StepLabel,
  Alert,
  Button,
  CircularProgress,
  Icon
} from '@mui/material'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/contexts/AuthContext'
import CSVUploader from '@/components/import/CSVUploader'
import CSVPreview from '@/components/import/CSVPreview'
import CSVImporter from '@/lib/csvImport'
import { CSVImportResult, CSVImportOptions } from '@/types/database'

const steps = [
  'Selecionar Arquivo',
  'Analisar Dados',
  'Confirmar Importação',
  'Finalizar'
]

export default function ImportPage() {
  const { user } = useAuth()
  const router = useRouter()
  const [activeStep, setActiveStep] = useState(0)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvResult, setCsvResult] = useState<CSVImportResult | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [importSuccess, setImportSuccess] = useState<{
    imported: number
    skipped: number
    errors: number
  } | null>(null)

  if (!user) {
    router.push('/login')
    return null
  }

  const handleFileSelected = async (file: File) => {
    setSelectedFile(file)
    setError(null)
    setLoading(true)

    try {
      const importer = new CSVImporter(user.id)
      
      // Primeira análise: apenas parsing e validação (sem importar)
      const { data: csvRows, errors: parseErrors } = await importer.parseCSVFile(file)
      
      if (parseErrors.length > 0) {
        throw new Error(`Erro no parsing: ${parseErrors.join(', ')}`)
      }

      // Validação e detecção de duplicatas
      const { validRows, invalidRows } = await importer.validateAndParseRows(csvRows)
      const { duplicates, uniqueRows } = await importer.detectDuplicates(validRows)

      const result: CSVImportResult = {
        validRows,
        invalidRows,
        duplicates: duplicates.map(d => d.csvRow), // Extrair apenas as linhas CSV
        totalRows: csvRows.length,
        successfulImports: 0 // Será atualizado na importação real
      }

      setCsvResult(result)
      setActiveStep(1) // Ir para o preview

    } catch (err: any) {
      setError(err.message || 'Erro inesperado ao processar arquivo')
      console.error('Erro na análise do CSV:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleImport = async (options: CSVImportOptions) => {
    if (!csvResult || !selectedFile) return

    setLoading(true)
    setError(null)

    try {
      const importer = new CSVImporter(user.id)
      
      // Importação real
      const result = await importer.importCSV(selectedFile, options)
      
      setCsvResult(result) // Atualizar com resultados da importação
      setImportSuccess({
        imported: result.successfulImports,
        skipped: result.duplicates.length,
        errors: result.invalidRows.length
      })
      setActiveStep(2) // Ir para tela de sucesso

    } catch (err: any) {
      setError(err.message || 'Erro inesperado durante a importação')
      console.error('Erro na importação:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleCancel = () => {
    setSelectedFile(null)
    setCsvResult(null)
    setError(null)
    setImportSuccess(null)
    setActiveStep(0)
  }

  const handleRestart = () => {
    handleCancel()
  }

  const handleGoToDashboard = () => {
              router.push('/main')
  }

  const handleGoToTransactions = () => {
              router.push('/main')
  }

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <CSVUploader
            onFileSelected={handleFileSelected}
            loading={loading}
            error={error}
          />
        )
      
      case 1:
        return csvResult ? (
          <CSVPreview
            result={csvResult}
            loading={loading}
            onImport={handleImport}
            onCancel={handleCancel}
          />
        ) : null

      case 2:
        return (
          <Paper elevation={1} sx={{ p: 4, textAlign: 'center' }}>
            <Icon sx={{ fontSize: 64, color: 'success.main', mb: 2 }}>
              check_circle
            </Icon>
            
            <Typography variant="h5" gutterBottom color="success.main">
              🎉 Importação Concluída!
            </Typography>
            
            {importSuccess && (
              <Box sx={{ my: 3 }}>
                <Typography variant="h6" gutterBottom>
                  📊 Resumo da Importação
                </Typography>
                
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, my: 2 }}>
                  <Box>
                    <Typography variant="h4" color="success.main" fontWeight="bold">
                      {importSuccess.imported}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Importadas
                    </Typography>
                  </Box>
                  
                  {importSuccess.skipped > 0 && (
                    <Box>
                      <Typography variant="h4" color="warning.main" fontWeight="bold">
                        {importSuccess.skipped}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Duplicatas
                      </Typography>
                    </Box>
                  )}
                  
                  {importSuccess.errors > 0 && (
                    <Box>
                      <Typography variant="h4" color="error.main" fontWeight="bold">
                        {importSuccess.errors}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Com Erro
                      </Typography>
                    </Box>
                  )}
                </Box>
              </Box>
            )}

            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', mt: 4 }}>
              <Button
                variant="outlined"
                onClick={handleRestart}
                startIcon={<Icon>refresh</Icon>}
              >
                Nova Importação
              </Button>
              
              <Button
                variant="contained"
                onClick={handleGoToTransactions}
                startIcon={<Icon>receipt_long</Icon>}
              >
                Ver Transações
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleGoToDashboard}
                startIcon={<Icon>dashboard</Icon>}
              >
                Ir ao Dashboard
              </Button>
            </Box>
          </Paper>
        )

      default:
        return null
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" fontWeight="bold" gutterBottom>
          📁 Importar Transações CSV
        </Typography>
        <Typography variant="body1" color="text.secondary">
          Importe suas transações em lote a partir de um arquivo CSV
        </Typography>
      </Box>

      {/* Stepper */}
      <Paper elevation={1} sx={{ p: 3, mb: 4 }}>
        <Stepper activeStep={activeStep} alternativeLabel>
          {steps.map((label, index) => (
            <Step key={label} completed={index < activeStep}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>
      </Paper>

      {/* Conteúdo da etapa atual */}
      <Box sx={{ mb: 4 }}>
        {renderStepContent()}
      </Box>

      {/* Loading global */}
      {loading && activeStep !== 1 && (
        <Box sx={{ 
          position: 'fixed', 
          top: 0, 
          left: 0, 
          right: 0, 
          bottom: 0, 
          bgcolor: 'rgba(0,0,0,0.5)', 
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <CircularProgress size={60} sx={{ mb: 2 }} />
            <Typography variant="h6">
              Processando arquivo...
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Aguarde enquanto analisamos seus dados
            </Typography>
          </Paper>
        </Box>
      )}

      {/* Erro global */}
      {error && activeStep === 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Erro:</strong> {error}
          </Typography>
          <Button 
            size="small" 
            onClick={() => setError(null)}
            sx={{ mt: 1 }}
          >
            Tentar Novamente
          </Button>
        </Alert>
      )}

      {/* Informações adicionais */}
      <Paper elevation={1} sx={{ p: 3, mt: 4, bgcolor: 'info.50' }}>
        <Typography variant="h6" gutterBottom>
          ℹ️ Informações Importantes
        </Typography>
        <Typography variant="body2" component="div">
          • <strong>Formato:</strong> Seu arquivo deve estar no formato CSV com encoding UTF-8<br/>
          • <strong>Duplicatas:</strong> O sistema detecta automaticamente transações duplicadas<br/>
          • <strong>Categorias:</strong> Categorias não encontradas podem ser criadas automaticamente<br/>
          • <strong>Backup:</strong> Recomendamos fazer backup dos dados antes da importação<br/>
          • <strong>Limite:</strong> Máximo de 1000 transações por importação
        </Typography>
      </Paper>
    </Container>
  )
} 