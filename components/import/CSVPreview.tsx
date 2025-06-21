'use client'

import { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Button,
  Stack,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  FormControlLabel,
  Switch,
  Icon,
  Badge,
  Tooltip
} from '@mui/material'
import { 
  CSVImportResult, 
  ParsedCSVRow, 
  CSVValidationError,
  CSVImportOptions 
} from '@/types/database'
import { formatCurrency } from '@/lib/utils'
import dayjs from 'dayjs'
import CategoryChip from '@/components/categories/CategoryChip'

interface CSVPreviewProps {
  result: CSVImportResult
  loading?: boolean
  onImport: (options: CSVImportOptions) => void
  onCancel: () => void
}

export default function CSVPreview({ result, loading = false, onImport, onCancel }: CSVPreviewProps) {
  const [importOptions, setImportOptions] = useState<CSVImportOptions>({
    skipDuplicates: true,
    overwriteDuplicates: false,
    createMissingCategories: false
  })

  const [expandedSections, setExpandedSections] = useState({
    valid: true,
    invalid: false,
    duplicates: false
  })

  const handleSectionToggle = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const getTypeChip = (type: 'income' | 'expense') => (
    <Chip
      label={type === 'income' ? 'Receita' : 'Despesa'}
      color={type === 'income' ? 'success' : 'error'}
      size="small"
    />
  )

  const getCategoryDisplay = (row: ParsedCSVRow) => {
    if (row.categoryId) {
      const mockCategory = {
        id: row.categoryId,
        user_id: '',
        name: row.categoryName || 'Categoria',
        color: '#999999',
        icon: 'category',
        is_default: false,
        created_at: '',
        updated_at: ''
      }
      return (
        <CategoryChip
          category={mockCategory}
        />
      )
    } else if (row.categoryName) {
      return (
        <Chip
          label={row.categoryName}
          variant="outlined"
          size="small"
          icon={<Icon fontSize="small">add</Icon>}
          sx={{ 
            borderStyle: 'dashed',
            color: 'warning.main',
            borderColor: 'warning.main'
          }}
        />
      )
    }
    return (
      <Chip
        label="Sem categoria"
        variant="outlined"
        size="small"
        color="default"
      />
    )
  }

  const handleImport = () => {
    onImport(importOptions)
  }

  return (
    <Box>
      {/* Resumo da Análise */}
      <Paper elevation={2} sx={{ p: 3, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          📊 Análise do Arquivo CSV
        </Typography>
        
        <Stack direction="row" spacing={2} flexWrap="wrap">
          <Chip
            icon={<Icon>description</Icon>}
            label={`${result.totalRows} linhas`}
            color="primary"
          />
          <Chip
            icon={<Icon>check_circle</Icon>}
            label={`${result.validRows.length} válidas`}
            color="success"
          />
          {result.invalidRows.length > 0 && (
            <Chip
              icon={<Icon>error</Icon>}
              label={`${result.invalidRows.length} com erro`}
              color="error"
            />
          )}
          {result.duplicates.length > 0 && (
            <Chip
              icon={<Icon>content_copy</Icon>}
              label={`${result.duplicates.length} duplicatas`}
              color="warning"
            />
          )}
        </Stack>

        {/* Opções de Importação */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            ⚙️ Opções de Importação
          </Typography>
          
          <Stack spacing={2}>
            <FormControlLabel
              control={
                <Switch
                  checked={importOptions.skipDuplicates}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    skipDuplicates: e.target.checked,
                    overwriteDuplicates: e.target.checked ? false : prev.overwriteDuplicates
                  }))}
                />
              }
              label="Pular duplicatas (recomendado)"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={importOptions.overwriteDuplicates}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    overwriteDuplicates: e.target.checked,
                    skipDuplicates: e.target.checked ? false : prev.skipDuplicates
                  }))}
                  disabled={importOptions.skipDuplicates}
                />
              }
              label="Sobrescrever duplicatas"
            />
            
            <FormControlLabel
              control={
                <Switch
                  checked={importOptions.createMissingCategories}
                  onChange={(e) => setImportOptions(prev => ({
                    ...prev,
                    createMissingCategories: e.target.checked
                  }))}
                />
              }
              label="Criar categorias ausentes automaticamente"
            />
          </Stack>
        </Box>
      </Paper>

      {/* Dados Válidos */}
      <Accordion 
        expanded={expandedSections.valid}
        onChange={() => handleSectionToggle('valid')}
      >
        <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
          <Badge badgeContent={result.validRows.length} color="success">
            <Typography variant="h6" sx={{ mr: 2 }}>
              ✅ Transações Válidas
            </Typography>
          </Badge>
        </AccordionSummary>
        <AccordionDetails>
          {result.validRows.length === 0 ? (
            <Alert severity="warning">
              Nenhuma transação válida encontrada.
            </Alert>
          ) : (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Categoria</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.validRows.slice(0, 10).map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {dayjs(row.date).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        <Tooltip title={row.description} arrow>
                          <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                            {row.description}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body2" 
                          fontWeight="bold"
                          color={row.type === 'income' ? 'success.main' : 'error.main'}
                        >
                          {formatCurrency(row.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getTypeChip(row.type)}
                      </TableCell>
                      <TableCell>
                        {getCategoryDisplay(row)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {result.validRows.length > 10 && (
            <Alert severity="info" sx={{ mt: 2 }}>
              Mostrando apenas as primeiras 10 transações. 
              Total: {result.validRows.length} transações válidas.
            </Alert>
          )}
        </AccordionDetails>
      </Accordion>

      {/* Erros de Validação */}
      {result.invalidRows.length > 0 && (
        <Accordion 
          expanded={expandedSections.invalid}
          onChange={() => handleSectionToggle('invalid')}
        >
          <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
            <Badge badgeContent={result.invalidRows.length} color="error">
              <Typography variant="h6" sx={{ mr: 2 }}>
                ❌ Erros de Validação
              </Typography>
            </Badge>
          </AccordionSummary>
          <AccordionDetails>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Linha</TableCell>
                    <TableCell>Campo</TableCell>
                    <TableCell>Erro</TableCell>
                    <TableCell>Valor</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.invalidRows.map((error, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <Chip label={error.row} size="small" color="error" />
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {error.field}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" color="error">
                          {error.message}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ fontFamily: 'monospace' }}>
                          {String(error.value)}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Duplicatas */}
      {result.duplicates.length > 0 && (
        <Accordion 
          expanded={expandedSections.duplicates}
          onChange={() => handleSectionToggle('duplicates')}
        >
          <AccordionSummary expandIcon={<Icon>expand_more</Icon>}>
            <Badge badgeContent={result.duplicates.length} color="warning">
              <Typography variant="h6" sx={{ mr: 2 }}>
                ⚠️ Duplicatas Encontradas
              </Typography>
            </Badge>
          </AccordionSummary>
          <AccordionDetails>
            <Alert severity="warning" sx={{ mb: 2 }}>
              As transações abaixo são similares a transações já existentes.
            </Alert>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Data</TableCell>
                    <TableCell>Descrição</TableCell>
                    <TableCell>Valor</TableCell>
                    <TableCell>Tipo</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {result.duplicates.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        {dayjs(row.date).format('DD/MM/YYYY')}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" noWrap sx={{ maxWidth: 200 }}>
                          {row.description}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" fontWeight="bold">
                          {formatCurrency(row.amount)}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getTypeChip(row.type)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </AccordionDetails>
        </Accordion>
      )}

      {/* Ações */}
      <Box sx={{ mt: 4, display: 'flex', gap: 2, justifyContent: 'center' }}>
        <Button
          variant="outlined"
          onClick={onCancel}
          disabled={loading}
          startIcon={<Icon>cancel</Icon>}
        >
          Cancelar
        </Button>
        
        <Button
          variant="contained"
          onClick={handleImport}
          disabled={loading || result.validRows.length === 0}
          startIcon={loading ? undefined : <Icon>upload</Icon>}
        >
          {loading ? 'Importando...' : `Importar ${result.validRows.length} Transações`}
        </Button>
      </Box>

      {result.validRows.length === 0 && (
        <Alert severity="error" sx={{ mt: 2 }}>
          <Typography variant="body2">
            <strong>Não há transações válidas para importar.</strong><br/>
            Corrija os erros no arquivo CSV e tente novamente.
          </Typography>
        </Alert>
      )}
    </Box>
  )
} 