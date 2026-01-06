'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, ComposedChart
} from 'recharts'
import {
  TrendingUp, TrendingDown, DollarSign, Calendar, Target,
  Activity, AlertTriangle, CheckCircle, ArrowUp, ArrowDown,
  PieChart as PieIcon, BarChart3, LineChart as LineIcon, Calendar as CalendarIcon,
  Clock, FileText, CreditCard, Receipt, Wrench, Percent
} from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import {
  VehicleIncomeBreakdown,
  VehicleExpenseBreakdown,
  VehicleProfitabilityAnalysis,
  fetchVehicleIncomeBreakdown,
  fetchVehicleExpenseBreakdown,
  fetchVehicleProfitabilityAnalysis,
  fetchVehicle,
  fetchVehicleContracts,
  fetchVehiclePayments,
  fetchVehicleExpenses,
  Vehicle,
  Contract,
  Payment,
  VehicleExpenseItem
} from '@/lib/api'

interface AdvancedFinancialAnalyticsProps {
  vehicleId: number;
}

type ViewType = 'overview' | 'income' | 'expenses' | 'profitability' | 'trends';

export default function AdvancedFinancialAnalytics({ vehicleId }: AdvancedFinancialAnalyticsProps) {
  const [activeView, setActiveView] = useState<ViewType>('overview')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Data states
  const [incomeData, setIncomeData] = useState<VehicleIncomeBreakdown | null>(null)
  const [expenseData, setExpenseData] = useState<VehicleExpenseBreakdown | null>(null)
  const [profitabilityData, setProfitabilityData] = useState<VehicleProfitabilityAnalysis | null>(null)

  // Date filters
  const [dateRange, setDateRange] = useState({
    startDate: '',
    endDate: ''
  })

  useEffect(() => {
    loadFinancialData()
  }, [vehicleId, dateRange])

  const loadFinancialData = async () => {
    setLoading(true)
    setError(null)

    try {
      // Try to fetch pre-calculated data first
      try {
        const [income, expense, profitability] = await Promise.all([
          fetchVehicleIncomeBreakdown(vehicleId, dateRange.startDate || undefined, dateRange.endDate || undefined),
          fetchVehicleExpenseBreakdown(vehicleId, dateRange.startDate || undefined, dateRange.endDate || undefined),
          fetchVehicleProfitabilityAnalysis(vehicleId)
        ])

        setIncomeData(income)
        setExpenseData(expense)
        setProfitabilityData(profitability)
      } catch (apiError) {
        console.warn('Backend analytics endpoints failed, falling back to client-side calculation', apiError)

        // Fallback: Fetch raw data and calculate
        const [vehicle, contracts, payments, expenses] = await Promise.all([
          fetchVehicle(vehicleId),
          fetchVehicleContracts(vehicleId),
          fetchVehiclePayments(vehicleId),
          fetchVehicleExpenses(vehicleId)
        ])

        // Calculate Income Data
        const successfulPayments = payments.filter(p => p.status === 'SUCCESS')
        const totalIncome = successfulPayments.reduce((sum, p) => sum + Number(p.amount), 0)
        const totalPending = contracts.filter(c => c.status === 'ACTIVE').reduce((sum, c) => sum + Number(c.balance_due || 0), 0) // Approximation

        // Group payments by month
        const paymentsByMonth = successfulPayments.reduce((acc, p) => {
          const month = new Date(p.created_at).toLocaleString('default', { month: 'short' })
          acc[month] = (acc[month] || 0) + Number(p.amount)
          return acc
        }, {} as Record<string, number>)

        const monthlyIncomeTrend = Object.entries(paymentsByMonth).map(([month, amount]) => ({ month, amount, income: amount }))

        const calculatedIncomeData: VehicleIncomeBreakdown = {
          total_income: totalIncome,
          total_pending: totalPending,
          income_by_source: [
            { source: 'Contracts', amount: totalIncome, percentage: 100, count: contracts.length }
          ],
          monthly_income_trend: monthlyIncomeTrend,
          income_trends: {
            monthly: monthlyIncomeTrend,
            weekly: [] // Simplified
          },
          contracts: contracts.map(c => ({
            contract_id: c.id.toString(),
            contract_number: c.contract_number,
            client_name: c.client_name || c.client?.email || 'Unknown',
            start_date: c.start_date,
            end_date: c.end_date,
            total_value: Number(c.total_contract_value),
            amount_paid: Number(c.amount_paid || 0), // Assuming this field exists or needs calc
            balance_due: Number(c.balance_due || 0),
            status: c.status
          })),
          payments: payments.map(p => ({
            payment_id: p.id.toString(),
            amount: Number(p.amount),
            payment_date: p.created_at,
            method: p.method,
            status: p.status,
            contract_number: p.contract_number || 'N/A' // backend might verify this field
          }))
        }

        // Calculate Expense Data
        const totalExpenses = expenses.reduce((sum, e) => sum + Number(e.total_amount), 0)

        // Group expenses by category
        const expensesByCategoryMap = expenses.reduce((acc, e) => {
          const cat = typeof e.category === 'string' ? e.category : (e.category as any)?.name || 'Uncategorized'
          if (!acc[cat]) acc[cat] = { amount: 0, count: 0 }
          acc[cat].amount += Number(e.total_amount)
          acc[cat].count += 1
          return acc
        }, {} as Record<string, { amount: number, count: number }>)

        const expensesByCategory = Object.entries(expensesByCategoryMap).map(([category, data]) => ({
          category,
          amount: data.amount,
          count: data.count,
          percentage: totalExpenses > 0 ? (data.amount / totalExpenses) * 100 : 0
        }))

        // Group expenses by month
        const expensesByMonthMap = expenses.reduce((acc, e) => {
          const month = new Date((e as any).expense_date || new Date()).toLocaleString('default', { month: 'short' })
          acc[month] = (acc[month] || 0) + Number(e.total_amount)
          return acc
        }, {} as Record<string, number>)

        const monthlyExpenseTrend = Object.entries(expensesByMonthMap).map(([month, amount]) => ({ month, amount }))

        const calculatedExpenseData: VehicleExpenseBreakdown = {
          total_expenses: totalExpenses,
          expenses_by_category: expensesByCategory,
          monthly_expense_trend: monthlyExpenseTrend,
          expenses_by_month: monthlyExpenseTrend.map(m => ({ ...m, count: 0 })), // count simplified
          expenses_by_week: []
        }

        // Calculate Profitability
        const purchasePrice = Number(vehicle.purchase_price || 0)
        const netProfit = totalIncome - totalExpenses
        const roi = purchasePrice > 0 ? (netProfit / purchasePrice) * 100 : 0

        // Months in service
        const createdAt = new Date(vehicle.created_at || new Date())
        const now = new Date()
        const monthsInService = Math.max(1, (now.getFullYear() - createdAt.getFullYear()) * 12 + (now.getMonth() - createdAt.getMonth()))

        const calculatedProfitability: VehicleProfitabilityAnalysis = {
          vehicle_id: vehicle.id.toString(),
          registration_number: vehicle.registration_number,
          performance_metrics: {
            total_income: totalIncome,
            total_expenses: totalExpenses,
            revenue_per_contract: contracts.length > 0 ? totalIncome / contracts.length : 0,
            utilization_rate: 0, // Hard to calc without trip data
            net_profit_loss: netProfit
          },
          time_analysis: {
            months_in_service: monthsInService,
            avg_monthly_income: totalIncome / monthsInService,
            avg_monthly_expenses: totalExpenses / monthsInService,
            break_even_point: netProfit > 0 ? 'Reached' : 'Not Reached',
            payback_period_months: (totalIncome / monthsInService) > 0 ? Math.ceil(purchasePrice / (totalIncome / monthsInService)) : 0
          },
          investment_analysis: {
            purchase_price: purchasePrice,
            total_invested: purchasePrice + totalExpenses, // Simplified
            total_returns: totalIncome,
            net_gain_loss: netProfit,
            roi_percentage: roi
          },
          financial_health: {
            is_profitable: netProfit > 0,
            expense_ratio_percentage: totalIncome > 0 ? (totalExpenses / totalIncome) * 100 : 0,
            profit_margin_percentage: totalIncome > 0 ? (netProfit / totalIncome) * 100 : 0,
            payback_period_months: 0
          }
        }

        setIncomeData(calculatedIncomeData)
        setExpenseData(calculatedExpenseData)
        setProfitabilityData(calculatedProfitability)
      }
    } catch (error) {
      console.error('Error loading financial data:', error)
      setError('Failed to load financial data')
    } finally {
      setLoading(false)
    }
  }

  const formatCurrency = (amount: number) => {
    return `KSh ${amount.toLocaleString()}`
  }

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return colors.adminSuccess
      case 'active': return colors.adminPrimary
      case 'pending': return colors.adminWarning
      case 'cancelled': return colors.adminError
      default: return colors.textSecondary
    }
  }

  const getProfitabilityStatus = () => {
    if (!profitabilityData) return { color: colors.textSecondary, text: 'Unknown' }

    const { financial_health } = profitabilityData
    if (financial_health.is_profitable) {
      return { color: colors.adminSuccess, text: 'Profitable' }
    } else if (financial_health.profit_margin_percentage > -10) {
      return { color: colors.adminWarning, text: 'Break-even' }
    } else {
      return { color: colors.adminError, text: 'Loss-making' }
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: colors.adminPrimary }}></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="p-6 text-center" style={{ color: colors.adminError }}>
        <AlertTriangle size={48} className="mx-auto mb-4" />
        <p>{error}</p>
        <button
          onClick={loadFinancialData}
          className="mt-4 px-4 py-2 rounded-lg"
          style={{ backgroundColor: colors.adminPrimary, color: 'white' }}
        >
          Retry
        </button>
      </div>
    )
  }

  const profitabilityStatus = getProfitabilityStatus()

  // Navigation tabs
  const navTabs = [
    { id: 'overview' as ViewType, label: 'Overview', icon: <Activity size={18} /> },
    { id: 'income' as ViewType, label: 'Income Analysis', icon: <TrendingUp size={18} /> },
    { id: 'expenses' as ViewType, label: 'Expense Analysis', icon: <TrendingDown size={18} /> },
    { id: 'profitability' as ViewType, label: 'ROI & Profitability', icon: <Target size={18} /> },
    { id: 'trends' as ViewType, label: 'Trends', icon: <LineIcon size={18} /> },
  ]

  const renderOverview = () => (
    <div className="space-y-6">
      {/* Key Metrics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg border"
          style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminSuccess}05` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <DollarSign size={20} style={{ color: colors.adminSuccess }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total Income</span>
            </div>
            <ArrowUp size={16} style={{ color: colors.adminSuccess }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(incomeData?.total_income || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {incomeData?.contracts?.length || 0} contracts
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg border"
          style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminError}05` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <TrendingDown size={20} style={{ color: colors.adminError }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total Expenses</span>
            </div>
            <ArrowDown size={16} style={{ color: colors.adminError }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(expenseData?.total_expenses || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {expenseData?.expenses_by_category?.length || 0} categories
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg border"
          style={{ borderColor: colors.borderLight, backgroundColor: `${profitabilityStatus.color}05` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Target size={20} style={{ color: profitabilityStatus.color }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Net Profit</span>
            </div>
            {profitabilityData?.performance_metrics?.net_profit_loss && profitabilityData.performance_metrics.net_profit_loss > 0 ?
              <ArrowUp size={16} style={{ color: colors.adminSuccess }} /> :
              <ArrowDown size={16} style={{ color: colors.adminError }} />
            }
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(profitabilityData?.performance_metrics?.net_profit_loss || 0)}
          </div>
          <div className="text-xs" style={{ color: profitabilityStatus.color }}>
            {profitabilityStatus.text}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg border"
          style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}
        >
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Activity size={20} style={{ color: colors.adminPrimary }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>ROI</span>
            </div>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {profitabilityData?.investment_analysis?.roi_percentage?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {profitabilityData?.time_analysis?.payback_period_months ?
              `Payback: ${profitabilityData.time_analysis.payback_period_months} months` :
              'No payback yet'
            }
          </div>
        </motion.div>
      </div>

      {/* Quick Charts */}
      {incomeData?.income_trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Monthly Income Trend
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={incomeData.income_trends.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <YAxis
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Income']}
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
                />
                <Line
                  type="monotone"
                  dataKey="income"
                  stroke={colors.adminSuccess}
                  strokeWidth={2}
                  dot={{ fill: colors.adminSuccess }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Expense Categories
            </h3>
            {expenseData?.expenses_by_category && expenseData.expenses_by_category.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={expenseData.expenses_by_category}
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    dataKey="amount"
                    label={({ payload, percent }: any) => `${payload.category} (${(percent * 100).toFixed(1)}%)`}
                  >
                    {expenseData.expenses_by_category.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={[colors.adminError, colors.adminWarning, colors.adminAccent][index % 3]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => [formatCurrency(value), 'Amount']} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[200px]" style={{ color: colors.textSecondary }}>
                <div className="text-center">
                  <PieIcon size={48} className="mx-auto mb-2 opacity-50" />
                  <p>No expense data available</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )

  const renderIncomeAnalysis = () => (
    <div className="space-y-6">
      {/* Income Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminSuccess}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} style={{ color: colors.adminSuccess }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total Income</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(incomeData?.total_income || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            From {incomeData?.contracts?.length || 0} contracts
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminWarning}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock size={20} style={{ color: colors.adminWarning }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Pending Income</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(Math.abs(incomeData?.total_pending || 0))}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Outstanding receivables
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} style={{ color: colors.adminPrimary }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Avg per Contract</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(incomeData?.contracts?.length ? (incomeData.total_income / incomeData.contracts.length) : 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Revenue efficiency
          </div>
        </div>
      </div>

      {/* Contracts and Payments Tables */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Contracts Table */}
        <div className="border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="p-4 border-b" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Contract Performance</h3>
          </div>
          <div className="p-4">
            {incomeData?.contracts && incomeData.contracts.length > 0 ? (
              <div className="space-y-3">
                {incomeData.contracts.map((contract, index) => (
                  <div key={contract.contract_id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}05` }}>
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {contract.contract_number}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {contract.client_name || 'N/A'} • {contract.status}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {new Date(contract.start_date).toLocaleDateString()} - {new Date(contract.end_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: getStatusColor(contract.status) }}>
                        {formatCurrency(contract.amount_paid)}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        of {formatCurrency(contract.total_value)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <FileText size={48} className="mx-auto mb-4 opacity-50" />
                <p>No contracts found</p>
              </div>
            )}
          </div>
        </div>

        {/* Payments Table */}
        <div className="border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="p-4 border-b" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Payment History</h3>
          </div>
          <div className="p-4">
            {incomeData?.payments && incomeData.payments.length > 0 ? (
              <div className="space-y-3">
                {incomeData.payments.map((payment, index) => (
                  <div key={payment.payment_id} className="flex items-center justify-between p-3 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}05` }}>
                    <div>
                      <div className="font-medium" style={{ color: colors.textPrimary }}>
                        {payment.method}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {payment.contract_number}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {new Date(payment.payment_date).toLocaleDateString()}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold" style={{ color: getStatusColor(payment.status) }}>
                        {formatCurrency(payment.amount)}
                      </div>
                      <div className="text-xs" style={{ color: colors.textSecondary }}>
                        {payment.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8" style={{ color: colors.textSecondary }}>
                <CreditCard size={48} className="mx-auto mb-4 opacity-50" />
                <p>No payments recorded</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Income Trends */}
      {incomeData?.income_trends && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Monthly Income Trend</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={incomeData.income_trends.monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <YAxis
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Income']}
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke={colors.adminSuccess}
                  strokeWidth={2}
                  fill={`${colors.adminSuccess}20`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Weekly Income Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={incomeData.income_trends.weekly}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <YAxis
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Income']}
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
                />
                <Bar dataKey="income" fill={colors.adminSuccess} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )

  const renderExpenseAnalysis = () => (
    <div className="space-y-6">
      {/* Expense Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminError}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Receipt size={20} style={{ color: colors.adminError }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total Expenses</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(expenseData?.total_expenses || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Across all categories
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminWarning}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Wrench size={20} style={{ color: colors.adminWarning }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Categories</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {expenseData?.expenses_by_category?.length || 0}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Expense types
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminAccent}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={20} style={{ color: colors.adminAccent }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Monthly Avg</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(
              expenseData?.expenses_by_month?.length
                ? expenseData.expenses_by_month.reduce((sum, month) => sum + month.amount, 0) / expenseData.expenses_by_month.length
                : 0
            )}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Spending rate
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Activity size={20} style={{ color: colors.adminPrimary }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Largest Category</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {expenseData?.expenses_by_category?.length ?
              Math.max(...expenseData.expenses_by_category.map(c => c.percentage || 0)).toFixed(1) + '%'
              : '0%'
            }
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            {expenseData?.expenses_by_category?.length ?
              expenseData.expenses_by_category.reduce((max, cat) => (cat.percentage || 0) > (max.percentage || 0) ? cat : max).category
              : 'N/A'
            }
          </div>
        </div>
      </div>

      {/* Category Breakdown and Monthly Trends */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Expense Categories</h3>
          {expenseData?.expenses_by_category && expenseData.expenses_by_category.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={expenseData.expenses_by_category}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ payload, percent }: any) =>
                    percent > 0.05 ? `${payload.category} (${(percent * 100).toFixed(1)}%)` : ''
                  }
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="amount"
                >
                  {expenseData.expenses_by_category.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={[colors.adminError, colors.adminWarning, colors.adminAccent, colors.adminPrimary][index % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(value: number, name, props: any) => [
                    formatCurrency(value),
                    `${props.payload.category} (${props.payload.count} items)`
                  ]}
                />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]" style={{ color: colors.textSecondary }}>
              <div className="text-center">
                <PieIcon size={48} className="mx-auto mb-2 opacity-50" />
                <p>No expense categories</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Monthly Expense Trend</h3>
          {expenseData?.expenses_by_month && expenseData.expenses_by_month.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <ComposedChart data={expenseData.expenses_by_month}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis
                  dataKey="month"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <YAxis
                  yAxisId="amount"
                  orientation="left"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <YAxis
                  yAxisId="count"
                  orientation="right"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <Tooltip
                  formatter={(value: number, name: string) => {
                    if (name === 'amount') return [formatCurrency(value), 'Amount']
                    return [value, 'Count']
                  }}
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
                />
                <Legend />
                <Bar yAxisId="amount" dataKey="amount" fill={colors.adminError} name="Amount" />
                <Line yAxisId="count" type="monotone" dataKey="count" stroke={colors.adminWarning} strokeWidth={2} name="Count" />
              </ComposedChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px]" style={{ color: colors.textSecondary }}>
              <div className="text-center">
                <BarChart3 size={48} className="mx-auto mb-2 opacity-50" />
                <p>No monthly expense data</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Detailed Category List */}
      {expenseData?.expenses_by_category && expenseData.expenses_by_category.length > 0 && (
        <div className="border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="p-4 border-b" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold" style={{ color: colors.textPrimary }}>Detailed Category Breakdown</h3>
          </div>
          <div className="p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {expenseData.expenses_by_category.map((category, index) => (
                <div
                  key={index}
                  className="p-4 rounded-lg border"
                  style={{
                    borderColor: colors.borderLight,
                    backgroundColor: `${[colors.adminError, colors.adminWarning, colors.adminAccent, colors.adminPrimary][index % 4]}05`
                  }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <div className="font-semibold" style={{ color: colors.textPrimary }}>
                        {category.category}
                      </div>
                      <div className="text-sm" style={{ color: colors.textSecondary }}>
                        {category.count} transactions
                      </div>
                    </div>
                    <div
                      className="text-lg font-bold"
                      style={{ color: [colors.adminError, colors.adminWarning, colors.adminAccent, colors.adminPrimary][index % 4] }}
                    >
                      {category.percentage ? category.percentage.toFixed(1) : '0.0'}%
                    </div>
                  </div>
                  <div className="text-xl font-bold" style={{ color: colors.textPrimary }}>
                    {formatCurrency(category.amount)}
                  </div>
                  <div
                    className="w-full h-2 bg-gray-200 rounded-full mt-2"
                  >
                    <div
                      className="h-2 rounded-full"
                      style={{
                        width: `${category.percentage || 0}%`,
                        backgroundColor: [colors.adminError, colors.adminWarning, colors.adminAccent, colors.adminPrimary][index % 4]
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  const renderProfitabilityAnalysis = () => (
    <div className="space-y-6">
      {/* Investment Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <DollarSign size={20} style={{ color: colors.adminPrimary }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Purchase Price</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(profitabilityData?.investment_analysis?.purchase_price || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Initial investment
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminSuccess}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={20} style={{ color: colors.adminSuccess }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Total Returns</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(profitabilityData?.investment_analysis?.total_returns || 0)}
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Revenue generated
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${profitabilityStatus.color}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Target size={20} style={{ color: profitabilityStatus.color }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Net Gain/Loss</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(profitabilityData?.investment_analysis?.net_gain_loss || 0)}
          </div>
          <div className="text-xs" style={{ color: profitabilityStatus.color }}>
            {profitabilityStatus.text}
          </div>
        </div>

        <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminAccent}05` }}>
          <div className="flex items-center gap-2 mb-2">
            <Percent size={20} style={{ color: colors.adminAccent }} />
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>ROI</span>
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {profitabilityData?.investment_analysis?.roi_percentage?.toFixed(1) || '0.0'}%
          </div>
          <div className="text-xs" style={{ color: colors.textSecondary }}>
            Return on investment
          </div>
        </div>
      </div>

      {/* Financial Health Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Financial Health Indicators</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Expense Ratio</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.min(profitabilityData?.financial_health?.expense_ratio_percentage || 0, 100)}%`,
                      backgroundColor: (profitabilityData?.financial_health?.expense_ratio_percentage || 0) > 70 ? colors.adminError :
                        (profitabilityData?.financial_health?.expense_ratio_percentage || 0) > 40 ? colors.adminWarning : colors.adminSuccess
                    }}
                  />
                </div>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {profitabilityData?.financial_health?.expense_ratio_percentage?.toFixed(1) || '0.0'}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Profit Margin</span>
              <div className="flex items-center gap-2">
                <div className="w-32 h-2 bg-gray-200 rounded-full">
                  <div
                    className="h-2 rounded-full"
                    style={{
                      width: `${Math.max(0, Math.min(profitabilityData?.financial_health?.profit_margin_percentage || 0, 100))}%`,
                      backgroundColor: (profitabilityData?.financial_health?.profit_margin_percentage || 0) > 20 ? colors.adminSuccess :
                        (profitabilityData?.financial_health?.profit_margin_percentage || 0) > 0 ? colors.adminWarning : colors.adminError
                    }}
                  />
                </div>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {profitabilityData?.financial_health?.profit_margin_percentage?.toFixed(1) || '0.0'}%
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Payback Period</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {profitabilityData?.financial_health?.payback_period_months?.toFixed(1) || 'N/A'} months
              </span>
            </div>

            <div className="flex items-center justify-between">
              <span style={{ color: colors.textSecondary }}>Profitability Status</span>
              <div className="flex items-center gap-2">
                {profitabilityData?.financial_health?.is_profitable ? (
                  <CheckCircle size={16} style={{ color: colors.adminSuccess }} />
                ) : (
                  <AlertTriangle size={16} style={{ color: colors.adminError }} />
                )}
                <span
                  className="font-medium"
                  style={{ color: profitabilityData?.financial_health?.is_profitable ? colors.adminSuccess : colors.adminError }}
                >
                  {profitabilityData?.financial_health?.is_profitable ? 'Profitable' : 'Not Profitable'}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Performance Metrics</h3>
          <div className="space-y-4">
            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Revenue per Contract</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {formatCurrency(profitabilityData?.performance_metrics?.revenue_per_contract || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Utilization Rate</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {profitabilityData?.performance_metrics?.utilization_rate?.toFixed(1) || '0.0'}%
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Months in Service</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {profitabilityData?.time_analysis?.months_in_service || 0} months
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Avg Monthly Income</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {formatCurrency(profitabilityData?.time_analysis?.avg_monthly_income || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Avg Monthly Expenses</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {formatCurrency(profitabilityData?.time_analysis?.avg_monthly_expenses || 0)}
              </span>
            </div>

            <div className="flex justify-between">
              <span style={{ color: colors.textSecondary }}>Break-even Point</span>
              <span className="font-medium" style={{ color: colors.textPrimary }}>
                {profitabilityData?.time_analysis?.break_even_point || 'Not reached'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ROI Visualization */}
      <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Investment Analysis Chart</h3>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={[
            { name: 'Investment', amount: profitabilityData?.investment_analysis?.purchase_price || 0, type: 'expense' },
            { name: 'Returns', amount: profitabilityData?.investment_analysis?.total_returns || 0, type: 'income' },
            { name: 'Net Position', amount: profitabilityData?.investment_analysis?.net_gain_loss || 0, type: 'net' }
          ]}>
            <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
            <XAxis
              dataKey="name"
              tick={{ fill: colors.textSecondary, fontSize: 12 }}
              axisLine={{ stroke: colors.borderLight }}
            />
            <YAxis
              tick={{ fill: colors.textSecondary, fontSize: 12 }}
              axisLine={{ stroke: colors.borderLight }}
              tickFormatter={(value) => `KSh ${(Math.abs(value) / 1000000).toFixed(1)}M`}
            />
            <Tooltip
              formatter={(value: number) => [formatCurrency(Math.abs(value)), 'Amount']}
              contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
            />
            <Bar dataKey="amount">
              {[
                { name: 'Investment', amount: -(profitabilityData?.investment_analysis?.purchase_price || 0), type: 'expense' },
                { name: 'Returns', amount: profitabilityData?.investment_analysis?.total_returns || 0, type: 'income' },
                { name: 'Net Position', amount: profitabilityData?.investment_analysis?.net_gain_loss || 0, type: 'net' }
              ].map((entry, index) => (
                <Cell key={`cell-${index}`} fill={
                  entry.type === 'expense' ? colors.adminError :
                    entry.type === 'income' ? colors.adminSuccess :
                      entry.amount >= 0 ? colors.adminSuccess : colors.adminError
                } />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  )

  const renderTrendsAnalysis = () => {
    // Combine income and expense data for trend analysis
    const combinedMonthlyData = incomeData?.income_trends?.monthly?.map(month => {
      const expenseMonth = expenseData?.expenses_by_month?.find(exp => exp.month === month.month)
      return {
        month: month.month,
        income: month.income,
        expenses: expenseMonth?.amount || 0,
        profit: month.income - (expenseMonth?.amount || 0)
      }
    }) || []

    const combinedWeeklyData = incomeData?.income_trends?.weekly?.map(week => {
      const expenseWeek = expenseData?.expenses_by_week?.find(exp => exp.week === week.week)
      return {
        week: week.week,
        income: week.income,
        expenses: expenseWeek?.amount || 0,
        profit: week.income - (expenseWeek?.amount || 0)
      }
    }) || []

    return (
      <div className="space-y-6">
        {/* Trend Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminSuccess}05` }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={20} style={{ color: colors.adminSuccess }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Income Trend</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {combinedMonthlyData.length > 1 ?
                (combinedMonthlyData[combinedMonthlyData.length - 1].income > combinedMonthlyData[combinedMonthlyData.length - 2].income ? '+' : '') +
                (((combinedMonthlyData[combinedMonthlyData.length - 1].income - combinedMonthlyData[combinedMonthlyData.length - 2].income) /
                  (combinedMonthlyData[combinedMonthlyData.length - 2].income || 1) * 100).toFixed(1)) + '%'
                : '0%'
              }
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Month-over-month
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminError}05` }}>
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown size={20} style={{ color: colors.adminError }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Expense Trend</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {combinedMonthlyData.length > 1 ?
                (combinedMonthlyData[combinedMonthlyData.length - 1].expenses > combinedMonthlyData[combinedMonthlyData.length - 2].expenses ? '+' : '') +
                (((combinedMonthlyData[combinedMonthlyData.length - 1].expenses - combinedMonthlyData[combinedMonthlyData.length - 2].expenses) /
                  (combinedMonthlyData[combinedMonthlyData.length - 2].expenses || 1) * 100).toFixed(1)) + '%'
                : '0%'
              }
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Month-over-month
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminPrimary}05` }}>
            <div className="flex items-center gap-2 mb-2">
              <Activity size={20} style={{ color: colors.adminPrimary }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Profit Trend</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {combinedMonthlyData.length > 1 ?
                (combinedMonthlyData[combinedMonthlyData.length - 1].profit > combinedMonthlyData[combinedMonthlyData.length - 2].profit ? '+' : '') +
                (((combinedMonthlyData[combinedMonthlyData.length - 1].profit - combinedMonthlyData[combinedMonthlyData.length - 2].profit) /
                  Math.abs(combinedMonthlyData[combinedMonthlyData.length - 2].profit || 1) * 100).toFixed(1)) + '%'
                : '0%'
              }
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Month-over-month
            </div>
          </div>

          <div className="p-4 rounded-lg border" style={{ borderColor: colors.borderLight, backgroundColor: `${colors.adminAccent}05` }}>
            <div className="flex items-center gap-2 mb-2">
              <Target size={20} style={{ color: colors.adminAccent }} />
              <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>Volatility</span>
            </div>
            <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
              {combinedMonthlyData.length > 0 ?
                (Math.max(...combinedMonthlyData.map(d => d.profit)) - Math.min(...combinedMonthlyData.map(d => d.profit)) > 0 ? 'High' : 'Low')
                : 'Low'
              }
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Profit stability
            </div>
          </div>
        </div>

        {/* Combined Financial Trends */}
        <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Combined Financial Trends</h3>
          <ResponsiveContainer width="100%" height={400}>
            <ComposedChart data={combinedMonthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
              <XAxis
                dataKey="month"
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: colors.borderLight }}
              />
              <YAxis
                tick={{ fill: colors.textSecondary, fontSize: 12 }}
                axisLine={{ stroke: colors.borderLight }}
                tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
              />
              <Tooltip
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
              />
              <Legend />
              <Area type="monotone" dataKey="income" stackId="1" stroke={colors.adminSuccess} fill={`${colors.adminSuccess}40`} name="Income" />
              <Area type="monotone" dataKey="expenses" stackId="2" stroke={colors.adminError} fill={`${colors.adminError}40`} name="Expenses" />
              <Line type="monotone" dataKey="profit" stroke={colors.adminPrimary} strokeWidth={3} name="Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Weekly vs Monthly Comparison */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Weekly Profit Pattern</h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={combinedWeeklyData}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis
                  dataKey="week"
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                />
                <YAxis
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  axisLine={{ stroke: colors.borderLight }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip
                  formatter={(value: number) => [formatCurrency(value), 'Profit']}
                  contentStyle={{ backgroundColor: 'white', border: `1px solid ${colors.borderLight}` }}
                />
                <Area
                  type="monotone"
                  dataKey="profit"
                  stroke={colors.adminPrimary}
                  fill={`${colors.adminPrimary}20`}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <div className="p-6 border rounded-lg" style={{ borderColor: colors.borderLight }}>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>Trend Analysis Summary</h3>
            <div className="space-y-4">
              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminSuccess}05` }}>
                <div className="font-medium" style={{ color: colors.textPrimary }}>Best Performing Month</div>
                <div style={{ color: colors.textSecondary }}>
                  {combinedMonthlyData.length > 0 ?
                    combinedMonthlyData.reduce((max, month) => month.profit > max.profit ? month : max).month +
                    ' - ' + formatCurrency(Math.max(...combinedMonthlyData.map(d => d.profit)))
                    : 'No data available'
                  }
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminError}05` }}>
                <div className="font-medium" style={{ color: colors.textPrimary }}>Lowest Performing Month</div>
                <div style={{ color: colors.textSecondary }}>
                  {combinedMonthlyData.length > 0 ?
                    combinedMonthlyData.reduce((min, month) => month.profit < min.profit ? month : min).month +
                    ' - ' + formatCurrency(Math.min(...combinedMonthlyData.map(d => d.profit)))
                    : 'No data available'
                  }
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminPrimary}05` }}>
                <div className="font-medium" style={{ color: colors.textPrimary }}>Average Monthly Profit</div>
                <div style={{ color: colors.textSecondary }}>
                  {combinedMonthlyData.length > 0 ?
                    formatCurrency(combinedMonthlyData.reduce((sum, month) => sum + month.profit, 0) / combinedMonthlyData.length)
                    : formatCurrency(0)
                  }
                </div>
              </div>

              <div className="p-3 rounded-lg" style={{ backgroundColor: `${colors.adminAccent}05` }}>
                <div className="font-medium" style={{ color: colors.textPrimary }}>Growth Rate</div>
                <div style={{ color: colors.textSecondary }}>
                  {combinedMonthlyData.length > 1 ?
                    (((combinedMonthlyData[combinedMonthlyData.length - 1].profit - combinedMonthlyData[0].profit) /
                      Math.abs(combinedMonthlyData[0].profit || 1) * 100).toFixed(1)) + '% overall'
                    : '0% overall'
                  }
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  const renderView = () => {
    switch (activeView) {
      case 'overview':
        return renderOverview()
      case 'income':
        return renderIncomeAnalysis()
      case 'expenses':
        return renderExpenseAnalysis()
      case 'profitability':
        return renderProfitabilityAnalysis()
      case 'trends':
        return renderTrendsAnalysis()
      default:
        return renderOverview()
    }
  }

  return (
    <div className="space-y-6">
      {/* Date Range Selector */}
      <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
        <CalendarIcon size={20} style={{ color: colors.textSecondary }} />
        <div className="flex items-center gap-2">
          <input
            type="date"
            value={dateRange.startDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, startDate: e.target.value }))}
            className="px-3 py-1 border rounded"
            style={{ borderColor: colors.borderLight }}
          />
          <span style={{ color: colors.textSecondary }}>to</span>
          <input
            type="date"
            value={dateRange.endDate}
            onChange={(e) => setDateRange(prev => ({ ...prev, endDate: e.target.value }))}
            className="px-3 py-1 border rounded"
            style={{ borderColor: colors.borderLight }}
          />
        </div>
        <button
          onClick={() => setDateRange({ startDate: '', endDate: '' })}
          className="px-3 py-1 text-sm border rounded"
          style={{ borderColor: colors.borderLight, color: colors.textSecondary }}
        >
          Clear
        </button>
      </div>

      {/* Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-gray-100 rounded-lg">
        {navTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveView(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${activeView === tab.id ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
              }`}
            style={{
              color: activeView === tab.id ? colors.adminPrimary : colors.textSecondary
            }}
          >
            {tab.icon}
            <span className="hidden md:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {renderView()}
      </motion.div>
    </div>
  )
}