import { z } from 'zod'

// Validação para autenticação
export const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
})

export const registerSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  confirmPassword: z.string().min(6, 'Confirmação deve ter pelo menos 6 caracteres'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Senhas não coincidem",
  path: ["confirmPassword"],
})

// Validação para categorias
export const categorySchema = z.object({
  name: z.string()
    .min(1, 'Nome é obrigatório')
    .max(50, 'Nome muito longo')
    .refine(
      (name) => name.trim().length > 0,
      'Nome não pode estar vazio'
    ),
  color: z.string()
    .regex(/^#[0-9A-Fa-f]{6}$/, 'Cor deve estar no formato hexadecimal (#RRGGBB)'),
  icon: z.string()
    .min(1, 'Ícone é obrigatório')
    .max(50, 'Nome do ícone muito longo'),
})

// Validação para transações (atualizada)
export const transactionSchema = z.object({
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição muito longa'),
  type: z.enum(['income', 'expense'], {
    required_error: 'Tipo de transação é obrigatório',
  }),
  date: z.string().min(1, 'Data é obrigatória'),
  category_id: z.string().uuid('Categoria inválida').optional().nullable(),
  account_id: z.string().uuid('Conta inválida').optional().nullable(),
})

// Validação para contas
export const accountSchema = z.object({
  name: z.string().min(1, 'Nome é obrigatório').max(100, 'Nome muito longo'),
  type: z.enum(['checking', 'credit_card'], {
    required_error: 'Tipo de conta é obrigatório',
  }),
  initial_balance: z.number().default(0),
  is_default: z.boolean().default(false),
})

// Validação para transferências entre contas
export const accountTransferSchema = z.object({
  from_account_id: z.string().uuid('Conta de origem inválida'),
  to_account_id: z.string().uuid('Conta de destino inválida'),
  amount: z.number().positive('Valor deve ser positivo'),
  description: z.string().min(1, 'Descrição é obrigatória').max(200, 'Descrição muito longa'),
  date: z.string().min(1, 'Data é obrigatória'),
}).refine((data) => data.from_account_id !== data.to_account_id, {
  message: 'Conta de origem e destino devem ser diferentes',
  path: ['to_account_id'],
})

// Validação para orçamentos
export const budgetSchema = z.object({
  category_id: z.string().uuid('Categoria é obrigatória'),
  amount: z.number()
    .positive('Valor deve ser positivo')
    .max(999999.99, 'Valor muito alto'),
  month: z.number()
    .int('Mês deve ser um número inteiro')
    .min(0, 'Mês inválido')
    .max(12, 'Mês inválido'),
  year: z.number()
    .int('Ano deve ser um número inteiro')
    .min(2020, 'Ano muito antigo')
    .max(2050, 'Ano muito futuro'),
})

// Validação para filtros
export const filtersSchema = z.object({
  period: z.enum(['week', 'month', 'quarter', 'year', 'custom']),
  categories: z.array(z.string().uuid()).optional(),
  types: z.array(z.enum(['income', 'expense'])).optional(),
  amountRange: z.object({
    min: z.number().min(0),
    max: z.number().min(0),
  }).optional(),
  searchText: z.string().max(100).optional(),
  dateRange: z.object({
    start: z.string(),
    end: z.string(),
  }).optional(),
})

// Validação para importação CSV
export const csvImportSchema = z.object({
  transactions: z.array(
    z.object({
      date: z.string().min(1, 'Data é obrigatória'),
      description: z.string().min(1, 'Descrição é obrigatória'),
      amount: z.number().positive('Valor deve ser positivo'),
      type: z.enum(['income', 'expense']),
      category: z.string().optional(),
    })
  ).min(1, 'Pelo menos uma transação é necessária'),
})

// Schema para arquivo CSV
export const csvFileSchema = z.object({
  file: z.any().refine((file) => file instanceof File, {
    message: 'Arquivo obrigatório'
  }).refine((file) => file.type === 'text/csv' || file.name.endsWith('.csv'), {
    message: 'Arquivo deve ser CSV'
  }).refine((file) => file.size <= 5 * 1024 * 1024, {
    message: 'Arquivo deve ter no máximo 5MB'
  })
})

// Schema para linha individual do CSV
export const csvRowSchema = z.object({
  date: z.string()
    .min(1, 'Data é obrigatória')
    .refine((date) => {
      // Aceitar formatos: DD/MM/YYYY, YYYY-MM-DD, MM/DD/YYYY
      const formats = [
        /^\d{2}\/\d{2}\/\d{4}$/,
        /^\d{4}-\d{2}-\d{2}$/,
        /^\d{2}\/\d{2}\/\d{4}$/
      ]
      return formats.some(format => format.test(date))
    }, {
      message: 'Data deve estar no formato DD/MM/YYYY, YYYY-MM-DD ou MM/DD/YYYY'
    }),
  description: z.string()
    .min(1, 'Descrição é obrigatória')
    .max(200, 'Descrição deve ter no máximo 200 caracteres')
    .trim(),
  amount: z.string()
    .min(1, 'Valor é obrigatório')
    .refine((val) => {
      // Aceitar números com vírgula ou ponto decimal
      const cleaned = val.replace(/[^\d.,-]/g, '').replace(',', '.')
      return !isNaN(parseFloat(cleaned)) && parseFloat(cleaned) > 0
    }, {
      message: 'Valor deve ser um número positivo'
    }),
  type: z.string()
    .min(1, 'Tipo é obrigatório')
    .refine((type) => {
      const validTypes = ['income', 'expense', 'receita', 'despesa']
      return validTypes.includes(type.toLowerCase())
    }, {
      message: 'Tipo deve ser: income, expense, receita ou despesa'
    }),
  category: z.string().optional()
})

// Schema para opções de importação
export const csvImportOptionsSchema = z.object({
  skipDuplicates: z.boolean().default(true),
  overwriteDuplicates: z.boolean().default(false),
  createMissingCategories: z.boolean().default(false)
})

// Schema para validação de dados parseados
export const parsedCSVRowSchema = z.object({
  date: z.string(),
  description: z.string(),
  amount: z.number().positive(),
  type: z.enum(['income', 'expense']),
  categoryId: z.string().uuid().optional(),
  categoryName: z.string().optional(),
  rowIndex: z.number().int().min(0)
})

// Tipos TypeScript inferidos
export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterFormData = z.infer<typeof registerSchema>
export type CategoryFormData = z.infer<typeof categorySchema>
export type TransactionFormData = z.infer<typeof transactionSchema>
export type AccountFormData = z.infer<typeof accountSchema>
export type AccountTransferFormData = z.infer<typeof accountTransferSchema>
export type BudgetFormData = z.infer<typeof budgetSchema>
export type FiltersFormData = z.infer<typeof filtersSchema>
export type CsvImportData = z.infer<typeof csvImportSchema>
export type CsvFileData = z.infer<typeof csvFileSchema>
export type CsvRowData = z.infer<typeof csvRowSchema>
export type CsvImportOptionsData = z.infer<typeof csvImportOptionsSchema>
export type ParsedCsvRowData = z.infer<typeof parsedCSVRowSchema> 