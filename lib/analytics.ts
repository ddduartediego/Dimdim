import { supabase } from './supabase'
import { formatCurrency } from './utils'
import { MonthlyInsight, TransactionWithCategory } from '@/types/database'
import dayjs from 'dayjs'

export interface CategoryAnalytics {
  category_id: string | null
  category_name: string | null
  category_color: string | null
  category_icon: string | null
  current_month_amount: number
  previous_month_amount: number
  transaction_count: number
  percentage_of_total: number
  trend: 'up' | 'down' | 'stable'
  trend_percentage: number
}

export interface MonthlyAnalytics {
  current_month: {
    month: number
    year: number
    total_income: number
    total_expenses: number
    balance: number
    transaction_count: number
    categories: CategoryAnalytics[]
  }
  previous_month: {
    month: number
    year: number
    total_income: number
    total_expenses: number
    balance: number
    transaction_count: number
  }
  comparison: {
    income_change: number
    expenses_change: number
    balance_change: number
    savings_difference: number
  }
}

export class AnalyticsEngine {
  private userId: string

  constructor(userId: string) {
    this.userId = userId
  }

  async getMonthlyAnalytics(month: number, year: number): Promise<MonthlyAnalytics> {
    // Calcular mês anterior
    const previousDate = dayjs(`${year}-${month}-01`).subtract(1, 'month')
    const previousMonth = previousDate.month() + 1
    const previousYear = previousDate.year()

    // Buscar dados do mês atual
    const currentData = await this.getMonthData(month, year)
    
    // Buscar dados do mês anterior
    const previousData = await this.getMonthData(previousMonth, previousYear)

    // Calcular comparações
    const comparison = {
      income_change: currentData.total_income - previousData.total_income,
      expenses_change: currentData.total_expenses - previousData.total_expenses,
      balance_change: currentData.balance - previousData.balance,
      savings_difference: (currentData.total_income - currentData.total_expenses) - 
                         (previousData.total_income - previousData.total_expenses)
    }

    return {
      current_month: currentData,
      previous_month: previousData,
      comparison
    }
  }

  private async getMonthData(month: number, year: number) {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

    // Buscar transações do período
    const { data: transactions, error } = await supabase
      .from('transactions_with_category')
      .select('*')
      .eq('user_id', this.userId)
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      throw new Error(`Erro ao buscar dados do período: ${error.message}`)
    }

    const transactionsList = transactions || []

    // Calcular totais
    const total_income = transactionsList
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0)

    const total_expenses = transactionsList
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0)

    const balance = total_income - total_expenses

    // Agrupar por categoria (apenas despesas para análise)
    const expensesByCategory = this.groupByCategory(
      transactionsList.filter(t => t.type === 'expense')
    )

    return {
      month,
      year,
      total_income,
      total_expenses,
      balance,
      transaction_count: transactionsList.length,
      categories: expensesByCategory
    }
  }

  private groupByCategory(transactions: TransactionWithCategory[]): CategoryAnalytics[] {
    const grouped = transactions.reduce((acc, transaction) => {
      const key = transaction.category_id || 'no-category'
      
      if (!acc[key]) {
        acc[key] = {
          category_id: transaction.category_id,
          category_name: transaction.category_name || 'Sem categoria',
          category_color: transaction.category_color || '#999999',
          category_icon: transaction.category_icon || 'category',
          current_month_amount: 0,
          previous_month_amount: 0,
          transaction_count: 0,
          percentage_of_total: 0,
          trend: 'stable' as const,
          trend_percentage: 0
        }
      }

      acc[key].current_month_amount += transaction.amount
      acc[key].transaction_count += 1

      return acc
    }, {} as Record<string, CategoryAnalytics>)

    const categories = Object.values(grouped)
    const total = categories.reduce((sum, cat) => sum + cat.current_month_amount, 0)

    // Calcular percentuais
    categories.forEach(category => {
      category.percentage_of_total = total > 0 ? (category.current_month_amount / total) * 100 : 0
    })

    return categories.sort((a, b) => b.current_month_amount - a.current_month_amount)
  }

  async generateInsights(month: number, year: number): Promise<MonthlyInsight[]> {
    const analytics = await this.getMonthlyAnalytics(month, year)
    const insights: MonthlyInsight[] = []

    // Insight 1: Comparação de gastos totais
    this.addExpenseComparisonInsight(insights, analytics)

    // Insight 2: Maior categoria de gasto
    this.addTopCategoryInsight(insights, analytics)

    // Insight 3: Economia/Deficit do mês
    this.addSavingsInsight(insights, analytics)

    // Insight 4: Padrão de orçamento
    await this.addBudgetInsights(insights, month, year)

    // Insight 5: Meta de transações
    this.addTransactionPatternInsight(insights, analytics)

    return insights.filter(Boolean) // Remove insights vazios
  }

  private addExpenseComparisonInsight(insights: MonthlyInsight[], analytics: MonthlyAnalytics) {
    const { expenses_change } = analytics.comparison
    const percentageChange = analytics.previous_month.total_expenses > 0 
      ? (expenses_change / analytics.previous_month.total_expenses) * 100 
      : 0

    if (Math.abs(percentageChange) > 5) { // Só gera insight se mudança > 5%
      const isReduction = expenses_change < 0
      const absPercentage = Math.abs(percentageChange)

      insights.push({
        type: isReduction ? 'saving' : 'spending',
        severity: isReduction ? 'success' : 'warning',
        title: isReduction ? '🎉 Parabéns! Você gastou menos' : '⚠️ Aumento nos gastos',
        description: `Você ${isReduction ? 'economizou' : 'gastou'} ${absPercentage.toFixed(1)}% ${isReduction ? 'menos' : 'mais'} que o mês passado. ${isReduction ? 'Continue assim!' : 'Considere revisar seus gastos.'}`,
        actionable: !isReduction,
        data: { amount: Math.abs(expenses_change), percentage: absPercentage }
      })
    }
  }

  private addTopCategoryInsight(insights: MonthlyInsight[], analytics: MonthlyAnalytics) {
    const topCategory = analytics.current_month.categories[0]
    
    if (topCategory && topCategory.current_month_amount > 0) {
      insights.push({
        type: 'spending',
        severity: 'info',
        title: `💳 Maior gasto: ${topCategory.category_name}`,
        description: `Você gastou ${formatCurrency(topCategory.current_month_amount)} em ${topCategory.category_name} este mês (${topCategory.percentage_of_total.toFixed(1)}% do total).`,
        actionable: topCategory.percentage_of_total > 40, // Se > 40% do total
        data: { 
          category: topCategory.category_name, 
          amount: topCategory.current_month_amount,
          percentage: topCategory.percentage_of_total 
        }
      })
    }
  }

  private addSavingsInsight(insights: MonthlyInsight[], analytics: MonthlyAnalytics) {
    const currentSavings = analytics.current_month.total_income - analytics.current_month.total_expenses
    const { savings_difference } = analytics.comparison

    if (currentSavings > 0) {
      insights.push({
        type: 'saving',
        severity: 'success',
        title: '💰 Meta de economia alcançada',
        description: `Você economizou ${formatCurrency(currentSavings)} este mês! ${savings_difference > 0 ? `Isso é ${formatCurrency(savings_difference)} a mais que o mês passado.` : savings_difference < 0 ? `Isso é ${formatCurrency(Math.abs(savings_difference))} a menos que o mês passado.` : 'Manteve o mesmo valor do mês anterior.'}`,
        actionable: false,
        data: { savings: currentSavings, difference: savings_difference }
      })
    } else if (currentSavings < 0) {
      insights.push({
        type: 'spending',
        severity: 'error',
        title: '🚨 Deficit no orçamento',
        description: `Você gastou ${formatCurrency(Math.abs(currentSavings))} a mais do que ganhou este mês. Considere revisar seus gastos.`,
        actionable: true,
        data: { deficit: Math.abs(currentSavings) }
      })
    }
  }

  private async addBudgetInsights(insights: MonthlyInsight[], month: number, year: number) {
    try {
      const { data: budgetStats, error } = await supabase
        .from('budget_statistics')
        .select('*')
        .eq('month', month)
        .eq('year', year)
        .gte('percentage_used', 80) // Apenas orçamentos com 80%+ de uso

      if (error || !budgetStats || budgetStats.length === 0) return

      budgetStats.forEach(stat => {
        const isExceeded = stat.percentage_used >= 100
        
        insights.push({
          type: 'budget',
          severity: isExceeded ? 'error' : 'warning',
          title: `${isExceeded ? '🚨' : '⚠️'} Orçamento de ${stat.category_name}`,
          description: `${isExceeded ? 'Orçamento excedido!' : 'Limite próximo!'} Você ${isExceeded ? 'excedeu' : 'atingiu'} ${stat.percentage_used.toFixed(1)}% do orçamento de ${stat.category_name}.`,
          actionable: true,
          data: { 
            category: stat.category_name, 
            percentage: stat.percentage_used,
            amount: stat.spent_amount,
            budget: stat.amount 
          }
        })
      })
    } catch (error) {
      console.error('Erro ao buscar insights de orçamento:', error)
    }
  }

  private addTransactionPatternInsight(insights: MonthlyInsight[], analytics: MonthlyAnalytics) {
    const { current_month, previous_month } = analytics
    const transactionChange = current_month.transaction_count - previous_month.transaction_count

    if (Math.abs(transactionChange) >= 5) { // Só se diferença >= 5 transações
      const isIncrease = transactionChange > 0
      
      insights.push({
        type: 'trend',
        severity: 'info',
        title: `📊 Padrão de transações ${isIncrease ? 'aumentou' : 'diminuiu'}`,
        description: `Você fez ${Math.abs(transactionChange)} transações ${isIncrease ? 'a mais' : 'a menos'} que o mês passado (${current_month.transaction_count} vs ${previous_month.transaction_count}).`,
        actionable: false,
        data: { 
          current: current_month.transaction_count, 
          previous: previous_month.transaction_count,
          change: transactionChange 
        }
      })
    }
  }

  async getCategoryData(month: number, year: number) {
    const startDate = dayjs(`${year}-${month}-01`).format('YYYY-MM-DD')
    const endDate = dayjs(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD')

    const { data: transactions, error } = await supabase
      .from('transactions_with_category')
      .select('*')
      .eq('user_id', this.userId)
      .eq('type', 'expense') // Apenas despesas para o gráfico de pizza
      .gte('date', startDate)
      .lte('date', endDate)

    if (error) {
      throw new Error(`Erro ao buscar dados de categoria: ${error.message}`)
    }

    const grouped = this.groupByCategory(transactions || [])
    
    return grouped.map(cat => ({
      name: cat.category_name || 'Sem categoria',
      value: cat.current_month_amount,
      color: cat.category_color || '#999999',
      icon: cat.category_icon || 'category',
      percentage: cat.percentage_of_total
    }))
  }
}

export default AnalyticsEngine 