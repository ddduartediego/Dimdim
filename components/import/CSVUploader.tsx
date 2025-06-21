'use client'

import { useState, useCallback, useRef } from 'react'
import {
  Box,
  Paper,
  Typography,
  Button,
  LinearProgress,
  Alert,
  Stack,
  Icon,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Collapse
} from '@mui/material'
import { useDropzone } from 'react-dropzone'
import { formatCurrency } from '@/lib/utils'
import { CSV_FORMAT } from '@/types/database'

interface CSVUploaderProps {
  onFileSelected: (file: File) => void
  loading?: boolean
  error?: string | null
}

export default function CSVUploader({ onFileSelected, loading = false, error }: CSVUploaderProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [showFormat, setShowFormat] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      setSelectedFile(file)
      onFileSelected(file)
    }
  }, [onFileSelected])

  const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.csv']
    },
    maxFiles: 1,
    maxSize: 5 * 1024 * 1024, // 5MB
    disabled: loading
  })

  const handleRemoveFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  return (
    <Box>
      {/* Área de Upload */}
      <Paper
        {...getRootProps()}
        sx={{
          p: 4,
          border: 2,
          borderStyle: 'dashed',
          borderColor: isDragActive 
            ? 'primary.main' 
            : selectedFile 
              ? 'success.main' 
              : 'grey.300',
          bgcolor: isDragActive 
            ? 'primary.50' 
            : selectedFile 
              ? 'success.50' 
              : 'background.paper',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s ease-in-out',
          textAlign: 'center',
          '&:hover': {
            borderColor: loading ? 'grey.300' : 'primary.main',
            bgcolor: loading ? 'background.paper' : 'primary.50'
          }
        }}
      >
        <input {...getInputProps()} ref={fileInputRef} />
        
        <Stack spacing={2} alignItems="center">
          <Icon
            sx={{ 
              fontSize: 48, 
              color: selectedFile ? 'success.main' : 'grey.500' 
            }}
          >
            {selectedFile ? 'check_circle' : 'upload_file'}
          </Icon>
          
          {selectedFile ? (
            <>
              <Typography variant="h6" color="success.main">
                ✅ Arquivo Selecionado
              </Typography>
              <Chip
                label={selectedFile.name}
                color="success"
                onDelete={handleRemoveFile}
                deleteIcon={<Icon>close</Icon>}
              />
              <Typography variant="body2" color="text.secondary">
                Tamanho: {(selectedFile.size / 1024).toFixed(1)} KB
              </Typography>
            </>
          ) : isDragActive ? (
            <Typography variant="h6" color="primary">
              📁 Solte o arquivo aqui...
            </Typography>
          ) : (
            <>
              <Typography variant="h6" color="text.primary">
                📎 Clique ou arraste um arquivo CSV
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Máximo 5MB • Apenas arquivos .csv
              </Typography>
            </>
          )}
        </Stack>
      </Paper>

      {/* Erros de arquivo */}
      {fileRejections.length > 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Arquivo rejeitado:</strong>
          </Typography>
                     {fileRejections[0].errors.map((error: any, index: number) => (
             <Typography key={index} variant="body2">
               • {error.message}
             </Typography>
           ))}
        </Alert>
      )}

      {/* Erro geral */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Loading */}
      {loading && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="body2" gutterBottom>
            Processando arquivo...
          </Typography>
          <LinearProgress />
        </Box>
      )}

      {/* Informações do formato esperado */}
      <Box sx={{ mt: 3 }}>
        <Button
          variant="outlined"
          startIcon={<Icon>info</Icon>}
          onClick={() => setShowFormat(!showFormat)}
          size="small"
        >
          {showFormat ? 'Ocultar' : 'Ver'} Formato Esperado
        </Button>

        <Collapse in={showFormat}>
          <Paper elevation={1} sx={{ mt: 2, p: 3 }}>
            <Typography variant="h6" gutterBottom>
              📋 Formato do Arquivo CSV
            </Typography>
            
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              Seu arquivo deve conter as seguintes colunas (nesta ordem):
            </Typography>

            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell><strong>Coluna</strong></TableCell>
                    <TableCell><strong>Formato</strong></TableCell>
                    <TableCell><strong>Exemplo</strong></TableCell>
                    <TableCell><strong>Obrigatório</strong></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>DD/MM/YYYY ou YYYY-MM-DD</TableCell>
                    <TableCell>15/03/2024</TableCell>
                    <TableCell>✅ Sim</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Texto (até 200 caracteres)</TableCell>
                    <TableCell>Compra no supermercado</TableCell>
                    <TableCell>✅ Sim</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Valor</TableCell>
                    <TableCell>Número positivo (R$)</TableCell>
                    <TableCell>150.50 ou 150,50</TableCell>
                    <TableCell>✅ Sim</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Tipo</TableCell>
                    <TableCell>income/expense ou receita/despesa</TableCell>
                    <TableCell>expense</TableCell>
                    <TableCell>✅ Sim</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Categoria</TableCell>
                    <TableCell>Nome da categoria</TableCell>
                    <TableCell>Alimentação</TableCell>
                    <TableCell>❌ Opcional</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ mt: 3 }}>
              <Typography variant="body2" fontWeight="bold" gutterBottom>
                📝 Exemplo de arquivo CSV:
              </Typography>
              <Paper 
                sx={{ 
                  p: 2, 
                  bgcolor: 'grey.100', 
                  fontFamily: 'monospace',
                  fontSize: '0.875rem'
                }}
              >
                {`date,description,amount,type,category
15/03/2024,Compra no supermercado,150.50,expense,Alimentação
16/03/2024,Salário recebido,3000.00,income,
17/03/2024,Combustível,80.00,expense,Transporte`}
              </Paper>
            </Box>

            <Alert severity="info" sx={{ mt: 2 }}>
              <Typography variant="body2">
                <strong>💡 Dicas importantes:</strong><br/>
                • Use vírgula (,) como separador de colunas<br/>
                • A primeira linha deve conter os nomes das colunas<br/>
                • Categorias não encontradas podem ser criadas automaticamente<br/>
                • Duplicatas serão detectadas automaticamente
              </Typography>
            </Alert>
          </Paper>
        </Collapse>
      </Box>
    </Box>
  )
} 