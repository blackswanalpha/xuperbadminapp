'use client'

import { useState, useMemo } from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { motion } from 'framer-motion'
import { colors } from '@/lib/theme/colors'
import { BarChart3, PieChart as PieIcon } from 'lucide-react'

interface RevenueExpenseChartProps {
  incomeData: {
    total_income: number;
    total_deposits: number;
    total_payments: number;
  };
  expenseData: {
    total_expenses: number;
    expense_breakdown: Array<{
      category: string;
      amount: number;
      count: number;
    }>;
  };
}

export default function RevenueExpenseChart({ incomeData, expenseData }: RevenueExpenseChartProps) {
  const [chartType, setChartType] = useState<'comparison' | 'breakdown'>('comparison')

  // Prepare data for comparison chart
  const comparisonData = useMemo(() => [
    {
      name: 'Deposits',
      amount: incomeData.total_deposits,
      type: 'income'
    },
    {
      name: 'Payments',
      amount: incomeData.total_payments,
      type: 'income'
    },
    {
      name: 'Total Expenses',
      amount: expenseData.total_expenses,
      type: 'expense'
    }
  ], [incomeData, expenseData])

  // Prepare data for expense breakdown pie chart
  const expenseBreakdownData = useMemo(() => {
    const sortedExpenses = [...expenseData.expense_breakdown].sort((a, b) => b.amount - a.amount)
    const colors = [
      '#EF4444', '#F97316', '#F59E0B', '#EAB308', '#84CC16',
      '#22C55E', '#10B981', '#14B8A6', '#06B6D4', '#0EA5E9'
    ]
    
    return sortedExpenses.map((expense, index) => ({
      ...expense,
      color: colors[index % colors.length]
    }))
  }, [expenseData.expense_breakdown])

  // Calculate totals and metrics
  const totalRevenue = incomeData.total_income
  const totalExpenses = expenseData.total_expenses
  const netProfit = totalRevenue - totalExpenses
  const profitMargin = totalRevenue > 0 ? ((netProfit / totalRevenue) * 100) : 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'white', 
            borderColor: colors.borderLight 
          }}
        >
          <p className="font-semibold" style={{ color: colors.textPrimary }}>
            {data.name}
          </p>
          <p style={{ color: data.type === 'income' ? colors.adminSuccess : colors.adminError }}>
            KSh {data.amount.toLocaleString()}
          </p>
        </div>
      )
    }
    return null
  }

  const PieTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.amount / totalExpenses) * 100).toFixed(1)
      return (
        <div 
          className="p-3 rounded-lg shadow-lg border"
          style={{ 
            backgroundColor: 'white', 
            borderColor: colors.borderLight 
          }}
        >
          <p className="font-semibold" style={{ color: colors.textPrimary }}>
            {data.category}
          </p>
          <p style={{ color: colors.adminError }}>
            KSh {data.amount.toLocaleString()} ({percentage}%)
          </p>
          <p className="text-sm" style={{ color: colors.textSecondary }}>
            {data.count} transactions
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* Metrics Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${colors.adminSuccess}10` }}
        >
          <div className="text-sm" style={{ color: colors.textSecondary }}>Total Revenue</div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            KSh {totalRevenue.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${colors.adminError}10` }}
        >
          <div className="text-sm" style={{ color: colors.textSecondary }}>Total Expenses</div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            KSh {totalExpenses.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: netProfit >= 0 ? `${colors.adminSuccess}10` : `${colors.adminError}10` }}
        >
          <div className="text-sm" style={{ color: colors.textSecondary }}>Net Profit/Loss</div>
          <div 
            className="text-2xl font-bold" 
            style={{ color: netProfit >= 0 ? colors.adminSuccess : colors.adminError }}
          >
            KSh {netProfit.toLocaleString()}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4 rounded-lg"
          style={{ backgroundColor: `${colors.adminPrimary}10` }}
        >
          <div className="text-sm" style={{ color: colors.textSecondary }}>Profit Margin</div>
          <div 
            className="text-2xl font-bold"
            style={{ color: profitMargin >= 0 ? colors.adminSuccess : colors.adminError }}
          >
            {profitMargin.toFixed(1)}%
          </div>
        </motion.div>
      </div>

      {/* Chart Type Toggle */}
      <div className="flex gap-2 p-1 bg-gray-100 rounded-lg w-fit">
        <button
          onClick={() => setChartType('comparison')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            chartType === 'comparison' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
          }`}
          style={{ color: chartType === 'comparison' ? colors.adminPrimary : colors.textSecondary }}
        >
          <BarChart3 size={18} />
          Revenue vs Expenses
        </button>
        <button
          onClick={() => setChartType('breakdown')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
            chartType === 'breakdown' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'
          }`}
          style={{ color: chartType === 'breakdown' ? colors.adminPrimary : colors.textSecondary }}
        >
          <PieIcon size={18} />
          Expense Breakdown
        </button>
      </div>

      {/* Charts */}
      <motion.div
        key={chartType}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="bg-white rounded-lg p-6 border"
        style={{ borderColor: colors.borderLight }}
      >
        {chartType === 'comparison' ? (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Revenue vs Expenses Comparison
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={comparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={colors.borderLight} />
                <XAxis 
                  dataKey="name" 
                  axisLine={{ stroke: colors.borderLight }}
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                />
                <YAxis 
                  axisLine={{ stroke: colors.borderLight }}
                  tick={{ fill: colors.textSecondary, fontSize: 12 }}
                  tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}K`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="amount" 
                  name="Amount"
                  fill={colors.adminPrimary}
                >
                  {comparisonData.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={entry.type === 'income' ? colors.adminSuccess : colors.adminError} 
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
              Expense Breakdown by Category
            </h3>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={expenseBreakdownData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ percent, ...props }: any) => 
                      percent > 5 ? `${(props as any).category} (${(percent * 100).toFixed(0)}%)` : ''
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {expenseBreakdownData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieTooltip />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Legend */}
              <div className="space-y-2">
                <h4 className="font-medium" style={{ color: colors.textPrimary }}>Categories</h4>
                <div className="space-y-2 max-h-[260px] overflow-y-auto">
                  {expenseBreakdownData.map((category, index) => (
                    <div key={index} className="flex items-center justify-between p-2 rounded-lg" style={{ backgroundColor: `${category.color}10` }}>
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        />
                        <span className="text-sm font-medium" style={{ color: colors.textPrimary }}>
                          {category.category}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-sm font-semibold" style={{ color: colors.textPrimary }}>
                          KSh {category.amount.toLocaleString()}
                        </div>
                        <div className="text-xs" style={{ color: colors.textSecondary }}>
                          {category.count} items
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}