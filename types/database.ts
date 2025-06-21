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
          amount?: number
          description?: string
          type?: 'income' | 'expense'
          date?: string
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
    }
    Views: {
      transactions_with_category: {
        Row: {
          id: string
          user_id: string
          category_id: string | null
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
}

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

// Formato esperado do CSV
export const CSV_FORMAT = {
  headers: ['date', 'description', 'amount', 'type', 'category'],
  dateFormats: ['DD/MM/YYYY', 'YYYY-MM-DD', 'MM/DD/YYYY'],
  types: ['income', 'expense', 'receita', 'despesa'],
  separator: ',',
  encoding: 'UTF-8'
} as const 