import Papa from 'papaparse'
import dayjs from 'dayjs'
import customParseFormat from 'dayjs/plugin/customParseFormat'
import { supabase } from './supabase'
import { 
  CSVRow, 
  ParsedCSVRow, 
  CSVValidationError, 
  CSVImportResult, 
  DuplicateTransaction,
  TransactionWithCategory,
  Category,
  CSVImportOptions
} from '@/types/database'
import { csvRowSchema } from './validations'

dayjs.extend(customParseFormat)

export class CSVImporter {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  // Parse do arquivo CSV
  async parseCSVFile(file: File): Promise<{
    data: CSVRow[]
    errors: string[]
  }> {
    return new Promise((resolve) => {
      Papa.parse<CSVRow>(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => {
          // Normalizar nomes das colunas
          const headerMap: Record<string, string> = {
            'data': 'date',
            'date': 'date',
            'descrição': 'description',
            'description': 'description',
            'descricao': 'description',
            'valor': 'amount',
            'amount': 'amount',
            'tipo': 'type',
            'type': 'type',
            'categoria': 'category',
            'category': 'category'
          }
          return headerMap[header.toLowerCase()] || header
        },
        complete: (results: Papa.ParseResult<CSVRow>) => {
          const errors: string[] = []
          
          // Verificar headers obrigatórios
          const requiredHeaders = ['date', 'description', 'amount', 'type']
          const missingHeaders = requiredHeaders.filter(
            header => !results.meta.fields?.includes(header)
          )
          
          if (missingHeaders.length > 0) {
            errors.push(`Colunas obrigatórias faltando: ${missingHeaders.join(', ')}`)
          }

          if (results.errors.length > 0) {
            errors.push(...results.errors.map((err: Papa.ParseError) => err.message))
          }

          resolve({
            data: results.data || [],
            errors
          })
        },
        error: (error: Error) => {
          resolve({
            data: [],
            errors: [error.message]
          })
        }
      })
    })
  }

  // Validar e parsear linhas do CSV
  async validateAndParseRows(csvRows: CSVRow[]): Promise<{
    validRows: ParsedCSVRow[]
    invalidRows: CSVValidationError[]
  }> {
    const validRows: ParsedCSVRow[] = []
    const invalidRows: CSVValidationError[] = []

    // Buscar categorias do usuário para mapeamento
    const { data: categories, error: categoriesError } = await supabase
      .from('categories')
      .select('*')
      .or(`user_id.eq.${this.userId},is_default.eq.true`)

    if (categoriesError) {
      throw new Error(`Erro ao buscar categorias: ${categoriesError.message}`)
    }

    for (let i = 0; i < csvRows.length; i++) {
      const row = csvRows[i]
      const rowIndex = i + 1 // Linha 1 = primeiro dado (excluindo header)

      try {
        // Validar estrutura da linha
        const validatedRow = csvRowSchema.parse(row)
        
        // Parsear e normalizar dados
        const parsedRow: ParsedCSVRow = {
          date: this.parseDate(validatedRow.date),
          description: validatedRow.description.trim(),
          amount: this.parseAmount(validatedRow.amount),
          type: this.parseType(validatedRow.type),
          categoryId: undefined,
          categoryName: validatedRow.category,
          rowIndex
        }

        // Mapear categoria se fornecida
        if (validatedRow.category) {
          const category = this.findCategory(validatedRow.category, categories || [])
          if (category) {
            parsedRow.categoryId = category.id
            parsedRow.categoryName = category.name
          } else {
            parsedRow.categoryName = validatedRow.category // Manter nome original
          }
        }

        validRows.push(parsedRow)

      } catch (error: any) {
        if (error.errors) {
          // Erro de validação Zod
          error.errors.forEach((err: any) => {
            invalidRows.push({
              row: rowIndex,
              field: err.path.join('.'),
              message: err.message,
              value: err.path.reduce((obj: any, key: string) => obj?.[key], row)
            })
          })
        } else {
          // Erro genérico
          invalidRows.push({
            row: rowIndex,
            field: 'geral',
            message: error.message,
            value: JSON.stringify(row)
          })
        }
      }
    }

    return { validRows, invalidRows }
  }

  // Detectar transações duplicadas
  async detectDuplicates(parsedRows: ParsedCSVRow[]): Promise<{
    duplicates: DuplicateTransaction[]
    uniqueRows: ParsedCSVRow[]
  }> {
    // Buscar transações existentes do usuário nos últimos 2 anos
    const twoYearsAgo = dayjs().subtract(2, 'year').format('YYYY-MM-DD')
    
    const { data: existingTransactions, error } = await supabase
      .from('transactions_with_category')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', twoYearsAgo)

    if (error) {
      throw new Error(`Erro ao buscar transações existentes: ${error.message}`)
    }

    const duplicates: DuplicateTransaction[] = []
    const uniqueRows: ParsedCSVRow[] = []

    for (const csvRow of parsedRows) {
      const duplicate = this.findDuplicate(csvRow, existingTransactions || [])
      
      if (duplicate) {
        duplicates.push(duplicate)
      } else {
        uniqueRows.push(csvRow)
      }
    }

    return { duplicates, uniqueRows }
  }

  // Importar transações válidas
  async importTransactions(
    rows: ParsedCSVRow[], 
    options: CSVImportOptions = {
      skipDuplicates: true,
      overwriteDuplicates: false,
      createMissingCategories: false
    }
  ): Promise<{
    successCount: number
    errors: CSVValidationError[]
  }> {
    let successCount = 0
    const errors: CSVValidationError[] = []

    for (const row of rows) {
      try {
        // Criar categoria se necessário e solicitado
        let categoryId = row.categoryId
        if (!categoryId && row.categoryName && options.createMissingCategories) {
          categoryId = await this.createCategory(row.categoryName)
        }

        // Inserir transação
        const { error } = await supabase
          .from('transactions')
          .insert({
            user_id: this.userId,
            amount: row.amount,
            description: row.description,
            type: row.type,
            date: row.date,
            category_id: categoryId
          })

        if (error) {
          errors.push({
            row: row.rowIndex,
            field: 'inserção',
            message: error.message,
            value: row.description
          })
        } else {
          successCount++
        }

      } catch (error: any) {
        errors.push({
          row: row.rowIndex,
          field: 'processamento',
          message: error.message,
          value: row.description
        })
      }
    }

    return { successCount, errors }
  }

  // Processo completo de importação
  async importCSV(
    file: File, 
    options: CSVImportOptions = {
      skipDuplicates: true,
      overwriteDuplicates: false,
      createMissingCategories: false
    }
  ): Promise<CSVImportResult> {
    // 1. Parse do arquivo
    const { data: csvRows, errors: parseErrors } = await this.parseCSVFile(file)
    
    if (parseErrors.length > 0) {
      throw new Error(`Erro no parsing: ${parseErrors.join(', ')}`)
    }

    // 2. Validação e parsing das linhas
    const { validRows, invalidRows } = await this.validateAndParseRows(csvRows)

    // 3. Detecção de duplicatas
    const { duplicates, uniqueRows } = await this.detectDuplicates(validRows)

    // 4. Determinar quais linhas importar
    let rowsToImport = uniqueRows

    if (!options.skipDuplicates && options.overwriteDuplicates) {
      // Incluir duplicatas para sobrescrever
      rowsToImport = [...uniqueRows, ...duplicates.map(d => d.csvRow)]
    }

    // 5. Importar transações
    const { successCount, errors: importErrors } = await this.importTransactions(
      rowsToImport, 
      options
    )

    return {
      validRows,
      invalidRows: [...invalidRows, ...importErrors],
      duplicates: duplicates.map(d => d.csvRow),
      totalRows: csvRows.length,
      successfulImports: successCount
    }
  }

  // === FUNÇÕES AUXILIARES ===

  private parseDate(dateStr: string): string {
    const formats = ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY']
    
    for (const format of formats) {
      const parsed = dayjs(dateStr, format, true)
      if (parsed.isValid()) {
        return parsed.format('YYYY-MM-DD')
      }
    }
    
    throw new Error(`Data inválida: ${dateStr}`)
  }

  private parseAmount(amountStr: string): number {
    // Remover caracteres não numéricos exceto vírgula e ponto
    const cleaned = amountStr.replace(/[^\d.,-]/g, '').replace(',', '.')
    const amount = parseFloat(cleaned)
    
    if (isNaN(amount) || amount <= 0) {
      throw new Error(`Valor inválido: ${amountStr}`)
    }
    
    return amount
  }

  private parseType(typeStr: string): 'income' | 'expense' {
    const normalized = typeStr.toLowerCase()
    
    if (['income', 'receita'].includes(normalized)) {
      return 'income'
    } else if (['expense', 'despesa'].includes(normalized)) {
      return 'expense'
    }
    
    throw new Error(`Tipo inválido: ${typeStr}`)
  }

  private findCategory(categoryName: string, categories: Category[]): Category | null {
    const normalized = categoryName.toLowerCase().trim()
    
    return categories.find(cat => 
      cat.name.toLowerCase() === normalized
    ) || null
  }

  private findDuplicate(
    csvRow: ParsedCSVRow, 
    existingTransactions: TransactionWithCategory[]
  ): DuplicateTransaction | null {
    for (const transaction of existingTransactions) {
      // Verificar correspondência exata
      if (
        transaction.date === csvRow.date &&
        Math.abs(transaction.amount - csvRow.amount) < 0.01 &&
        transaction.description.toLowerCase() === csvRow.description.toLowerCase()
      ) {
        return {
          csvRow,
          existingTransaction: transaction,
          confidence: 'high'
        }
      }

      // Verificar correspondência parcial (mesmo dia, valor, tipo)
      if (
        transaction.date === csvRow.date &&
        Math.abs(transaction.amount - csvRow.amount) < 0.01 &&
        transaction.type === csvRow.type
      ) {
        return {
          csvRow,
          existingTransaction: transaction,
          confidence: 'medium'
        }
      }
    }

    return null
  }

  private async createCategory(categoryName: string): Promise<string> {
    const { data, error } = await supabase
      .from('categories')
      .insert({
        user_id: this.userId,
        name: categoryName.trim(),
        color: '#9E9E9E', // Cor padrão cinza
        icon: 'category', // Ícone padrão
        is_default: false
      })
      .select()
      .single()

    if (error) {
      throw new Error(`Erro ao criar categoria: ${error.message}`)
    }

    return data.id
  }
}

export default CSVImporter 