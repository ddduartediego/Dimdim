export interface Database {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string | null
          name: string
          color: string
          icon: string
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          name: string
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          name?: string
          color?: string
          icon?: string
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      transactions: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          account_id: string | null
          amount: number
          description: string
          type: 'income' | 'expense'
          date: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category_id?: string | null
          account_id?: string | null
          amount: number
          description: string
          type: 'income' | 'expense'
          date: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string | null
          account_id?: string | null
          amount?: number
          description?: string
          type?: 'income' | 'expense'
          date?: string
          created_at?: string
          updated_at?: string
        }
      }
      accounts: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'credit_card'
          initial_balance: number
          is_default: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          type: 'checking' | 'credit_card'
          initial_balance?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          type?: 'checking' | 'credit_card'
          initial_balance?: number
          is_default?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      budgets: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          category_id?: string
          amount?: number
          month?: number
          year?: number
          created_at?: string
          updated_at?: string
        }
      }
      custom_insights: {
        Row: {
          id: string
          user_id: string
          name: string
          description: string | null
          conditions: any | null
          formula: string | null
          is_active: boolean
          insight_type: 'custom' | 'template'
          template_id: string | null
          severity: 'info' | 'warning' | 'success' | 'error'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string
          name: string
          description?: string | null
          conditions?: any | null
          formula?: string | null
          is_active?: boolean
          insight_type?: 'custom' | 'template'
          template_id?: string | null
          severity?: 'info' | 'warning' | 'success' | 'error'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          description?: string | null
          conditions?: any | null
          formula?: string | null
          is_active?: boolean
          insight_type?: 'custom' | 'template'
          template_id?: string | null
          severity?: 'info' | 'warning' | 'success' | 'error'
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      transactions_with_category: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          account_id: string | null
          amount: number
          description: string
          type: 'income' | 'expense'
          date: string
          created_at: string
          updated_at: string
          category_name: string | null
          category_color: string | null
          category_icon: string | null
        }
      }
      transactions_with_account_and_category: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
          account_id: string | null
          amount: number
          description: string
          type: 'income' | 'expense'
          date: string
          created_at: string
          updated_at: string
          category_name: string | null
          category_color: string | null
          category_icon: string | null
          account_name: string | null
          account_type: 'checking' | 'credit_card' | null
        }
      }
      account_balances: {
        Row: {
          id: string
          user_id: string
          name: string
          type: 'checking' | 'credit_card'
          initial_balance: number
          is_default: boolean
          created_at: string
          updated_at: string
          current_balance: number
          total_income: number
          total_expenses: number
          transaction_count: number
        }
      }
      budget_statistics: {
        Row: {
          id: string
          user_id: string
          category_id: string
          amount: number
          month: number
          year: number
          created_at: string
          updated_at: string
          category_name: string
          category_color: string
          spent_amount: number
          percentage_used: number
        }
      }
    }
  }
}

// Tipos para categorias
export type Category = Database['public']['Tables']['categories']['Row']
export type CategoryInsert = Database['public']['Tables']['categories']['Insert']
export type CategoryUpdate = Database['public']['Tables']['categories']['Update']

// Tipos para contas
export type Account = Database['public']['Tables']['accounts']['Row']
export type AccountInsert = Database['public']['Tables']['accounts']['Insert']
export type AccountUpdate = Database['public']['Tables']['accounts']['Update']

// Tipos para transações (atualizados)
export type Transaction = Database['public']['Tables']['transactions']['Row']
export type TransactionInsert = Database['public']['Tables']['transactions']['Insert']
export type TransactionUpdate = Database['public']['Tables']['transactions']['Update']

// Tipos para orçamentos
export type Budget = Database['public']['Tables']['budgets']['Row']
export type BudgetInsert = Database['public']['Tables']['budgets']['Insert']
export type BudgetUpdate = Database['public']['Tables']['budgets']['Update']

// Tipos para views
export type TransactionWithCategory = Database['public']['Views']['transactions_with_category']['Row']
export type TransactionWithAccountAndCategory = Database['public']['Views']['transactions_with_account_and_category']['Row']
export type AccountBalance = Database['public']['Views']['account_balances']['Row']
export type BudgetStatistics = Database['public']['Views']['budget_statistics']['Row']

// Interfaces complementares
export interface User {
  id: string
  email: string
  created_at: string
}

export interface DashboardData {
  totalIncome: number
  totalExpenses: number
  balance: number
  recentTransactions: TransactionWithCategory[]
  categoriesData: CategorySpending[]
}

export interface CategorySpending {
  category_id: string | null
  category_name: string | null
  category_color: string | null
  category_icon: string | null
  total_amount: number
  transaction_count: number
}

export interface BudgetProgress {
  budget: Budget
  category: Category
  spent_amount: number
  percentage_used: number
  remaining_amount: number
  status: 'safe' | 'warning' | 'danger' | 'exceeded'
}

export interface MonthlyInsight {
  type: 'saving' | 'spending' | 'budget' | 'trend'
  severity: 'info' | 'warning' | 'success' | 'error'
  title: string
  description: string
  actionable: boolean
  data?: any
  source?: 'automatic' | 'custom' // Nova propriedade para identificar origem
  customInsightId?: string // ID do insight personalizado (se aplicável)
}

// ================================
// CUSTOM INSIGHTS TYPES
// ================================

export interface CustomInsight {
  id: string
  user_id: string
  name: string
  description: string | null
  conditions: InsightConditions | null
  formula: string | null
  is_active: boolean
  insight_type: 'custom' | 'template'
  template_id: string | null
  severity: 'info' | 'warning' | 'success' | 'error'
  created_at: string
  updated_at: string
}

export type CustomInsightInsert = Omit<CustomInsight, 'id' | 'created_at' | 'updated_at'> & {
  id?: string
  created_at?: string
  updated_at?: string
}

export type CustomInsightUpdate = Partial<CustomInsightInsert>

// Estrutura para condições de insights personalizados
export interface InsightConditions {
  field: string // Campo a ser avaliado (ex: 'category_amount', 'expenses_change_percentage')
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'contains' | 'not_contains'
  value?: number | string // Valor de comparação
  function?: string // Função estatística (ex: 'average_plus_stddev')
  category?: string | null // Categoria específica (se aplicável)
  logic?: 'AND' | 'OR' // Para combinação de condições
  children?: InsightConditions[] // Condições aninhadas
}

// Templates pré-definidos
export interface InsightTemplate {
  id: string
  name: string
  description: string
  defaultConditions: InsightConditions
  defaultSeverity: 'info' | 'warning' | 'success' | 'error'
  category: 'budget' | 'spending' | 'saving' | 'transaction' | 'trend'
  parameters: TemplateParameter[]
}

export interface TemplateParameter {
  key: string
  label: string
  type: 'number' | 'text' | 'category' | 'percentage'
  defaultValue?: any
  required: boolean
  description?: string
}

// Resultado de avaliação de insights personalizados
export interface CustomInsightResult {
  insight: CustomInsight
  triggered: boolean
  currentValue?: number | string
  message?: string
  data?: any
}

// Interface para ícones disponíveis
export interface AvailableIcon {
  id: string
  name: string
  description: string
  category: string
  keywords: string[]
  is_popular: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

// Tipo para inserção de ícones
export type AvailableIconInsert = Omit<AvailableIcon, 'id' | 'created_at' | 'updated_at'>

// Constantes para categorias padrão
export const DEFAULT_CATEGORIES = [
  { name: 'Alimentação', color: '#FF9800', icon: 'restaurant' },
  { name: 'Transporte', color: '#2196F3', icon: 'directions_car' },
  { name: 'Moradia', color: '#4CAF50', icon: 'home' },
  { name: 'Saúde', color: '#F44336', icon: 'local_hospital' },
  { name: 'Lazer', color: '#9C27B0', icon: 'sports_esports' },
] as const

// Tipos para filtros
export interface TransactionFilters {
  period: 'week' | 'month' | 'quarter' | 'year' | 'custom'
  categories: string[]
  accounts: string[]
  types: ('income' | 'expense')[]
  amountRange?: { min: number; max: number }
  searchText?: string
  dateRange?: { start: string; end: string }
}

// ========== CSV IMPORT TYPES ==========

export interface CSVRow {
  date: string
  description: string
  amount: string
  type: string
  category?: string
}

export interface ParsedCSVRow {
  date: string
  description: string
  amount: number
  type: 'income' | 'expense'
  categoryId?: string
  categoryName?: string
  rowIndex: number
}

export interface CSVValidationError {
  row: number
  field: string
  message: string
  value: any
}

export interface CSVImportResult {
  validRows: ParsedCSVRow[]
  invalidRows: CSVValidationError[]
  duplicates: ParsedCSVRow[]
  totalRows: number
  successfulImports: number
}

export interface CSVImportStats {
  total: number
  valid: number
  invalid: number
  duplicates: number
  imported: number
}

export interface DuplicateTransaction {
  csvRow: ParsedCSVRow
  existingTransaction: TransactionWithCategory
  confidence: 'high' | 'medium' | 'low'
}

export interface CSVImportOptions {
  skipDuplicates: boolean
  overwriteDuplicates: boolean
  createMissingCategories: boolean
}

// Tipos específicos para contas
export interface AccountFormData {
  name: string
  type: 'checking' | 'credit_card'
  initial_balance: number
  is_default: boolean
}

export interface AccountTransferData {
  from_account_id: string
  to_account_id: string
  amount: number
  description: string
  date: string
}

export interface AccountTransferResult {
  from_transaction_id: string
  to_transaction_id: string
  success: boolean
  error?: string
}

// Tipos para dashboard com filtros de conta
export interface DashboardDataWithAccounts extends DashboardData {
  accountsData: AccountBalance[]
  selectedAccountId?: string | null
}

// Formato esperado do CSV
export const CSV_FORMAT = {
  headers: ['date', 'description', 'amount', 'type', 'category'],
  dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'],
  types: ['income', 'expense', 'receita', 'despesa'],
  separator: ',',
  encoding: 'UTF-8'
} as const 