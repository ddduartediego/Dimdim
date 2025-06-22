import { supabase } from './supabase'
import { formatCurrency } from './utils'
import { 
  CustomInsight, 
  CustomInsightResult, 
  InsightConditions, 
  MonthlyInsight,
  TransactionWithCategory 
} from '@/types/database'
import dayjs from 'dayjs'

/**
 * Engine para processamento de Insights Personalizados
 * Responsável por avaliar condições JSONB e gerar insights dinâmicos
 */
export class CustomInsightsEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  /**
   * Busca todos os insights personalizados ativos do usuário
   */
  async getActiveCustomInsights(): Promise<CustomInsight[]> {
    const { data, error } = await supabase
      .from('custom_insights')
      .select('*')
      .eq('user_id', this.userId)
      .eq('is_active', true)
      .order('created_at', { ascending: false })

    if (error) {
      throw new Error(`Erro ao buscar insights personalizados: ${error.message}`)
    }

    return data || []
  }

  /**
   * Avalia todos os insights personalizados para um período específico
   */
  async evaluateCustomInsights(month: number, year: number): Promise<MonthlyInsight[]> {
    try {
      const customInsights = await this.getActiveCustomInsights()
      
      if (customInsights.length === 0) {
        return []
      }

      // Buscar dados do período necessários para avaliação
      const periodData = await this.getPeriodData(month, year)
      
      const results: MonthlyInsight[] = []

      for (const insight of customInsights) {
        try {
          const result = await this.evaluateInsight(insight, periodData, month, year)
          if (result.triggered) {
            results.push({
              type: this.mapSeverityToType(insight.severity),
              severity: insight.severity,
              title: insight.name,
              description: result.message || insight.description || 'Condição personalizada foi atendida',
              actionable: insight.severity === 'warning' || insight.severity === 'error',
              data: result.data,
              source: 'custom',
              customInsightId: insight.id
            })
          }
        } catch (error) {
          console.error(`Erro ao avaliar insight ${insight.name}:`, error)
          // Continua com os outros insights mesmo se um falhar
        }
      }

      return results
    } catch (error) {
      console.error('Erro ao avaliar insights personalizados:', error)
      return []
    }
  }

  /**
   * Avalia um insight específico
   */
  private async evaluateInsight(
    insight: CustomInsight, 
    periodData: PeriodData, 
    month: number, 
    year: number
  ): Promise<CustomInsightResult> {
    // Se tem fórmula, usar parser de fórmula
    if (insight.formula && insight.formula.trim()) {
      return this.evaluateFormula(insight, insight.formula, periodData)
    }

    // Se tem condições JSONB, usar parser de condições
    if (insight.conditions) {
      return this.evaluateConditions(insight, insight.conditions as InsightConditions, periodData)
    }

    // Insight inválido
    return {
      insight,
      triggered: false,
      message: 'Insight sem condições válidas definidas'
    }
  }

  /**
   * Avalia condições estruturadas JSONB
   */
  private evaluateConditions(
    insight: CustomInsight,
    conditions: InsightConditions,
    periodData: PeriodData
  ): CustomInsightResult {
    try {
      const triggered = this.evaluateCondition(conditions, periodData)
      const currentValue = this.getCurrentValue(conditions.field, periodData, conditions.category)
      
      return {
        insight,
        triggered,
        currentValue,
        message: triggered ? this.generateConditionMessage(conditions, currentValue, periodData) : undefined,
        data: {
          field: conditions.field,
          operator: conditions.operator,
          expectedValue: conditions.value || conditions.function,
          actualValue: currentValue,
          category: conditions.category
        }
      }
    } catch (error) {
      console.error('Erro ao avaliar condições:', error)
      return {
        insight,
        triggered: false,
        message: `Erro na avaliação: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Avalia uma condição individual
   */
  private evaluateCondition(condition: InsightConditions, periodData: PeriodData): boolean {
    const currentValue = this.getCurrentValue(condition.field, periodData, condition.category)
    const expectedValue = this.getExpectedValue(condition, periodData)

    if (currentValue === null || currentValue === undefined) {
      return false
    }

    switch (condition.operator) {
      case '>':
        return Number(currentValue) > Number(expectedValue)
      case '<':
        return Number(currentValue) < Number(expectedValue)
      case '>=':
        return Number(currentValue) >= Number(expectedValue)
      case '<=':
        return Number(currentValue) <= Number(expectedValue)
      case '==':
        return Number(currentValue) === Number(expectedValue)
      case '!=':
        return Number(currentValue) !== Number(expectedValue)
      case 'contains':
        return String(currentValue).toLowerCase().includes(String(expectedValue).toLowerCase())
      case 'not_contains':
        return !String(currentValue).toLowerCase().includes(String(expectedValue).toLowerCase())
      default:
        throw new Error(`Operador não suportado: ${condition.operator}`)
    }
  }

  /**
   * Obtém valor atual baseado no campo especificado
   */
  private getCurrentValue(field: string, periodData: PeriodData, category?: string | null): number | string | null {
    switch (field) {
      case 'total_income':
        return periodData.totalIncome
        
      case 'total_expenses':
        return periodData.totalExpenses
        
      case 'balance':
        return periodData.balance
        
      case 'monthly_savings':
        return periodData.balance // savings = balance
        
      case 'transaction_count':
        return periodData.transactionCount
        
      case 'expenses_change_percentage':
        return periodData.expensesChangePercentage
        
      case 'category_amount':
        if (!category) return null
        const categoryData = periodData.categoriesData.find(c => 
          c.category_name === category || c.category_id === category
        )
        return categoryData ? categoryData.total_amount : 0
        
      case 'budget_percentage':
        if (!category) return null
        // Buscar dados de orçamento para a categoria
        const budgetData = periodData.budgetData?.find(b => 
          b.category_name === category || b.category_id === category
        )
        return budgetData ? budgetData.percentage_used : 0
        
      default:
        throw new Error(`Campo não suportado: ${field}`)
    }
  }

  /**
   * Obtém valor esperado (pode ser valor fixo ou resultado de função)
   */
  private getExpectedValue(condition: InsightConditions, periodData: PeriodData): number | string {
    if (condition.value !== undefined && condition.value !== null) {
      return condition.value
    }

    if (condition.function) {
      return this.evaluateFunction(condition.function, condition.field, periodData)
    }

    throw new Error('Condição sem valor ou função definida')
  }

  /**
   * Avalia funções estatísticas
   */
  private evaluateFunction(functionName: string, field: string, periodData: PeriodData): number {
    switch (functionName) {
      case 'average':
        return periodData.averages[field] || 0
        
      case 'average_plus_stddev':
        const avg = periodData.averages[field] || 0
        const stddev = periodData.standardDeviations[field] || 0
        return avg + stddev
        
      case 'previous_month':
        return periodData.previousMonth[field] || 0
        
      case 'max':
        return periodData.maximums[field] || 0
        
      case 'min':
        return periodData.minimums[field] || 0
        
      default:
        throw new Error(`Função não suportada: ${functionName}`)
    }
  }

  /**
   * Avalia fórmulas em texto livre (implementação básica)
   */
  private evaluateFormula(
    insight: CustomInsight,
    formula: string,
    periodData: PeriodData
  ): CustomInsightResult {
    try {
      // Parser básico de fórmulas
      // Ex: "total_expenses > 1000 AND category_amount['Alimentação'] > 500"
      
      // Substitui variáveis por valores reais
      let processedFormula = formula
      
      // Substituir variáveis simples
      processedFormula = processedFormula.replace(/total_expenses/g, String(periodData.totalExpenses))
      processedFormula = processedFormula.replace(/total_income/g, String(periodData.totalIncome))
      processedFormula = processedFormula.replace(/balance/g, String(periodData.balance))
      processedFormula = processedFormula.replace(/transaction_count/g, String(periodData.transactionCount))
      
      // Substituir referências de categoria (implementação simplificada)
      processedFormula = processedFormula.replace(
        /category_amount\['([^']+)'\]/g, 
        (match, categoryName) => {
          const categoryData = periodData.categoriesData.find(c => c.category_name === categoryName)
          return String(categoryData ? categoryData.total_amount : 0)
        }
      )

      // Avaliar expressão (CUIDADO: em produção usar parser mais seguro)
      // Por segurança, implementamos apenas comparações básicas
      const triggered = this.evaluateBasicExpression(processedFormula)
      
      return {
        insight,
        triggered,
        message: triggered ? `Fórmula personalizada atendida: ${formula}` : undefined,
        data: { 
          formula: formula,
          processedFormula: processedFormula,
          result: triggered 
        }
      }
    } catch (error) {
      console.error('Erro ao avaliar fórmula:', error)
      return {
        insight,
        triggered: false,
        message: `Erro na fórmula: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      }
    }
  }

  /**
   * Avaliador básico de expressões (versão segura)
   */
  private evaluateBasicExpression(expression: string): boolean {
    // Remove espaços
    const expr = expression.replace(/\s+/g, ' ').trim()
    
    // Padrões suportados (versão básica e segura)
    const patterns = [
      /^(\d+(?:\.\d+)?)\s*([><=!]+)\s*(\d+(?:\.\d+)?)$/,  // num > num
      /^(\d+(?:\.\d+)?)\s*([><=!]+)\s*(\d+(?:\.\d+)?)\s+(AND|OR)\s+(\d+(?:\.\d+)?)\s*([><=!]+)\s*(\d+(?:\.\d+)?)$/  // num > num AND/OR num > num
    ]

    // Tentar pattern simples primeiro
    const simpleMatch = expr.match(patterns[0])
    if (simpleMatch) {
      const [, left, operator, right] = simpleMatch
      return this.compareValues(Number(left), operator, Number(right))
    }

    // Tentar pattern composto
    const complexMatch = expr.match(patterns[1])
    if (complexMatch) {
      const [, left1, op1, right1, logic, left2, op2, right2] = complexMatch
      const result1 = this.compareValues(Number(left1), op1, Number(right1))
      const result2 = this.compareValues(Number(left2), op2, Number(right2))
      
      return logic === 'AND' ? (result1 && result2) : (result1 || result2)
    }

    // Se não reconhece o padrão, retorna false por segurança
    console.warn('Expressão não reconhecida:', expr)
    return false
  }

  /**
   * Compara dois valores usando operador
   */
  private compareValues(left: number, operator: string, right: number): boolean {
    switch (operator) {
      case '>': return left > right
      case '<': return left < right
      case '>=': return left >= right
      case '<=': return left <= right
      case '==': case '=': return left === right
      case '!=': return left !== right
      default: return false
    }
  }

  /**
   * Gera mensagem contextual para condição
   */
  private generateConditionMessage(
    condition: InsightConditions, 
    currentValue: number | string | null, 
    periodData: PeriodData
  ): string {
    const field = this.getFieldLabel(condition.field)
    const operator = this.getOperatorLabel(condition.operator)
    const expected = condition.value || condition.function
    const current = currentValue

    if (condition.category) {
      return `${field} da categoria "${condition.category}" (${formatCurrency(Number(current))}) ${operator} ${formatCurrency(Number(expected))}`
    }

    return `${field} atual (${this.formatValue(current)}) ${operator} ${this.formatValue(expected)}`
  }

  /**
   * Obtém dados completos do período para avaliação
   */
  private async getPeriodData(month: number, year: number): Promise<PeriodData> {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

    // Buscar transações do período
    const { data: transactions, error: transError } = await supabase
      .from('transactions_with_category')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (transError) {
      throw new Error(`Erro ao buscar transações: ${transError.message}`)
    }

    const transactionsList = transactions || []

    // Calcular totais
    const totalIncome = transactionsList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const totalExpenses = transactionsList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = totalIncome - totalExpenses

    // Agrupar por categoria
    const categoriesData = this.groupByCategory(transactionsList.filter(t => t.type === 'expense'))

    // Buscar dados de orçamento do período
    const { data: budgetData } = await supabase
      .from('budget_statistics')
      .select('*')
      .eq('user_id', this.userId)
      .eq('month', month)
      .eq('year', year)

    // Calcular dados do mês anterior para comparações
    const previousDate = dayjs(`${year}-${month}-01`).subtract(1, 'month')
    const previousMonth = await this.getPreviousMonthData(previousDate.month() + 1, previousDate.year())

    const expensesChangePercentage = previousMonth.totalExpenses > 0 
      ? ((totalExpenses - previousMonth.totalExpenses) / previousMonth.totalExpenses) * 100 
      : 0

    return {
      totalIncome,
      totalExpenses,
      balance,
      transactionCount: transactionsList.length,
      categoriesData,
      budgetData: budgetData || [],
      expensesChangePercentage,
      averages: {
        transaction_count: await this.calculateAverage('transaction_count', month, year),
        total_expenses: await this.calculateAverage('total_expenses', month, year),
      },
      standardDeviations: {
        transaction_count: await this.calculateStandardDeviation('transaction_count', month, year),
        total_expenses: await this.calculateStandardDeviation('total_expenses', month, year),
      },
      maximums: {
        total_expenses: await this.calculateMaximum('total_expenses', month, year),
      },
      minimums: {
        total_expenses: await this.calculateMinimum('total_expenses', month, year),
      },
      previousMonth
    }
  }

  /**
   * Obtém dados do mês anterior
   */
  private async getPreviousMonthData(month: number, year: number): Promise<any> {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

    const { data: transactions } = await supabase
      .from('transactions_with_category')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)

    const transactionsList = transactions || []

    return {
      totalIncome: transactionsList.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactionsList.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0),
      transactionCount: transactionsList.length
    }
  }

  /**
   * Agrupa transações por categoria
   */
  private groupByCategory(transactions: TransactionWithCategory[]) {
    const grouped = transactions.reduce((acc, transaction) => {
      const key = transaction.category_id || 'no-category'
      
      if (!acc[key]) {
        acc[key] = {
          category_id: transaction.category_id,
          category_name: transaction.category_name || 'Sem categoria',
          category_color: transaction.category_color || '#999999',
          category_icon: transaction.category_icon || 'category',
          total_amount: 0,
          transaction_count: 0,
        }
      }

      acc[key].total_amount += transaction.amount
      acc[key].transaction_count += 1

      return acc
    }, {} as Record<string, any>)

    return Object.values(grouped)
  }

  /**
   * Utilitários para cálculos estatísticos (implementação básica)
   */
  private async calculateAverage(field: string, currentMonth: number, currentYear: number): Promise<number> {
    // Implementação simplificada - buscar últimos 6 meses
    // Em produção, implementar cálculo mais robusto
    return 0
  }

  private async calculateStandardDeviation(field: string, currentMonth: number, currentYear: number): Promise<number> {
    return 0
  }

  private async calculateMaximum(field: string, currentMonth: number, currentYear: number): Promise<number> {
    return 0
  }

  private async calculateMinimum(field: string, currentMonth: number, currentYear: number): Promise<number> {
    return 0
  }

  /**
   * Utilitários de formatação e labels
   */
  private mapSeverityToType(severity: string): 'saving' | 'spending' | 'budget' | 'trend' {
    switch (severity) {
      case 'success': return 'saving'
      case 'error': case 'warning': return 'budget'
      default: return 'trend'
    }
  }

  private getFieldLabel(field: string): string {
    const labels: Record<string, string> = {
      'total_income': 'Receita total',
      'total_expenses': 'Gastos totais',
      'balance': 'Saldo',
      'monthly_savings': 'Economia mensal',
      'transaction_count': 'Número de transações',
      'expenses_change_percentage': 'Mudança percentual nos gastos',
      'category_amount': 'Valor da categoria',
      'budget_percentage': 'Percentual do orçamento'
    }
    return labels[field] || field
  }

  private getOperatorLabel(operator: string): string {
    const labels: Record<string, string> = {
      '>': 'é maior que',
      '<': 'é menor que',
      '>=': 'é maior ou igual a',
      '<=': 'é menor ou igual a',
      '==': 'é igual a',
      '!=': 'é diferente de',
      'contains': 'contém',
      'not_contains': 'não contém'
    }
    return labels[operator] || operator
  }

  private formatValue(value: any): string {
    if (typeof value === 'number') {
      // Se parece com dinheiro (valores grandes), formatar como moeda
      if (value > 10) {
        return formatCurrency(value)
      }
      // Senão, formatar como número
      return value.toFixed(2)
    }
    return String(value)
  }
}

/**
 * Interface para dados do período necessários para avaliação
 */
interface PeriodData {
  totalIncome: number
  totalExpenses: number
  balance: number
  transactionCount: number
  categoriesData: any[]
  budgetData: any[]
  expensesChangePercentage: number
  averages: Record<string, number>
  standardDeviations: Record<string, number>
  maximums: Record<string, number>
  minimums: Record<string, number>
  previousMonth: any
}

export default CustomInsightsEngine 