'use client'

import { useMemo } from 'react'
import { Car, Wrench, Clock, TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { colors } from '@/lib/theme/colors'

interface YearViewProps {
  currentDate: Date
}

interface MonthData {
  month: number
  year: number
  events: {
    trips: number
    maintenance: number
    inspections: number
    completed: number
  }
  utilization: number
  expenses: number
  revenue: number
}

export default function YearView({ currentDate }: YearViewProps) {
  const year = currentDate.getFullYear()

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  // Mock yearly data for each month
  const yearData: MonthData[] = useMemo(() => {
    return monthNames.map((month, index) => ({
      month: index,
      year,
      events: {
        trips: Math.floor(Math.random() * 50) + 20,
        maintenance: Math.floor(Math.random() * 15) + 5,
        inspections: Math.floor(Math.random() * 10) + 2,
        completed: Math.floor(Math.random() * 40) + 15,
      },
      utilization: Math.floor(Math.random() * 30) + 60, // 60-90%
      expenses: Math.floor(Math.random() * 50000) + 10000, // 10K-60K
      revenue: Math.floor(Math.random() * 80000) + 40000, // 40K-120K
    }))
  }, [year])

  const yearlyTotals = useMemo(() => {
    return yearData.reduce((acc, month) => ({
      trips: acc.trips + month.events.trips,
      maintenance: acc.maintenance + month.events.maintenance,
      inspections: acc.inspections + month.events.inspections,
      completed: acc.completed + month.events.completed,
      totalExpenses: acc.totalExpenses + month.expenses,
      totalRevenue: acc.totalRevenue + month.revenue,
      avgUtilization: acc.avgUtilization + month.utilization,
    }), {
      trips: 0,
      maintenance: 0,
      inspections: 0,
      completed: 0,
      totalExpenses: 0,
      totalRevenue: 0,
      avgUtilization: 0,
    })
  }, [yearData])

  const getTrendIcon = (current: number, previous: number) => {
    if (current > previous) return TrendingUp
    if (current < previous) return TrendingDown
    return Minus
  }

  const getTrendColor = (current: number, previous: number) => {
    if (current > previous) return colors.adminSuccess
    if (current < previous) return colors.adminError
    return colors.textTertiary
  }

  const formatCurrency = (value: number) => {
    if (value >= 1000000) {
      return `KSh ${(value / 1000000).toFixed(1)}M`
    } else if (value >= 1000) {
      return `KSh ${(value / 1000).toFixed(0)}K`
    }
    return `KSh ${value.toFixed(0)}`
  }

  return (
    <div className="h-full overflow-auto">
      {/* Year Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Total Trips
            </span>
            <Car size={16} style={{ color: colors.adminPrimary }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {yearlyTotals.trips}
          </div>
          <div className="text-xs mt-1" style={{ color: colors.adminSuccess }}>
            +12% from last year
          </div>
        </div>

        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Maintenance
            </span>
            <Wrench size={16} style={{ color: colors.adminWarning }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {yearlyTotals.maintenance}
          </div>
          <div className="text-xs mt-1" style={{ color: colors.adminError }}>
            +5% from last year
          </div>
        </div>

        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Total Revenue
            </span>
            <TrendingUp size={16} style={{ color: colors.adminSuccess }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {formatCurrency(yearlyTotals.totalRevenue)}
          </div>
          <div className="text-xs mt-1" style={{ color: colors.adminSuccess }}>
            +18% from last year
          </div>
        </div>

        <div className="p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium" style={{ color: colors.textSecondary }}>
              Avg Utilization
            </span>
            <Clock size={16} style={{ color: colors.adminAccent }} />
          </div>
          <div className="text-2xl font-bold" style={{ color: colors.textPrimary }}>
            {Math.round(yearlyTotals.avgUtilization / 12)}%
          </div>
          <div className="text-xs mt-1" style={{ color: colors.adminSuccess }}>
            +3% from last year
          </div>
        </div>
      </div>

      {/* Monthly Breakdown Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {yearData.map((monthData) => {
          const prevMonthData = monthData.month > 0 ? yearData[monthData.month - 1] : null

          return (
            <div
              key={monthData.month}
              className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer"
              style={{ borderColor: colors.borderLight }}
              onClick={() => {
                // Navigate to month view
                console.log(`Navigate to ${monthNames[monthData.month]} ${year}`)
              }}
            >
              {/* Month Header */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold" style={{ color: colors.textPrimary }}>
                  {monthNames[monthData.month].substring(0, 3)}
                </h3>
                <span className="text-xs" style={{ color: colors.textTertiary }}>
                  {year}
                </span>
              </div>

              {/* Events Summary */}
              <div className="space-y-2 mb-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Car size={12} style={{ color: colors.adminPrimary }} />
                    <span style={{ color: colors.textSecondary }}>Trips</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {monthData.events.trips}
                    </span>
                    {prevMonthData && (() => {
                      const Icon = getTrendIcon(monthData.events.trips, prevMonthData.events.trips)
                      return <Icon size={14} style={{ color: getTrendColor(monthData.events.trips, prevMonthData.events.trips) }} />
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Wrench size={12} style={{ color: colors.adminWarning }} />
                    <span style={{ color: colors.textSecondary }}>Maintenance</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {monthData.events.maintenance}
                    </span>
                    {prevMonthData && (() => {
                      const Icon = getTrendIcon(monthData.events.maintenance, prevMonthData.events.maintenance)
                      return <Icon size={14} style={{ color: getTrendColor(monthData.events.maintenance, prevMonthData.events.maintenance) }} />
                    })()}
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1">
                    <Clock size={12} style={{ color: colors.adminAccent }} />
                    <span style={{ color: colors.textSecondary }}>Inspections</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium" style={{ color: colors.textPrimary }}>
                      {monthData.events.inspections}
                    </span>
                    {prevMonthData && (() => {
                      const Icon = getTrendIcon(monthData.events.inspections, prevMonthData.events.inspections)
                      return <Icon size={14} style={{ color: getTrendColor(monthData.events.inspections, prevMonthData.events.inspections) }} />
                    })()}
                  </div>
                </div>
              </div>

              {/* Utilization Bar */}
              <div className="mb-3">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span style={{ color: colors.textSecondary }}>Utilization</span>
                  <span className="font-medium" style={{ color: colors.textPrimary }}>
                    {monthData.utilization}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="h-2 rounded-full transition-all duration-300"
                    style={{
                      width: `${monthData.utilization}%`,
                      backgroundColor: monthData.utilization > 80 ? colors.adminSuccess :
                        monthData.utilization > 60 ? colors.adminAccent :
                          colors.adminWarning,
                    }}
                  />
                </div>
              </div>

              {/* Financial Summary */}
              <div className="border-t pt-2" style={{ borderColor: colors.borderLight }}>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: colors.textSecondary }}>Revenue</span>
                  <span className="font-medium" style={{ color: colors.adminSuccess }}>
                    {formatCurrency(monthData.revenue)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span style={{ color: colors.textSecondary }}>Expenses</span>
                  <span className="font-medium" style={{ color: colors.adminError }}>
                    {formatCurrency(monthData.expenses)}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Annual Summary */}
      <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
        <h3 className="text-lg font-semibold mb-4" style={{ color: colors.textPrimary }}>
          Annual Performance Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.textSecondary }}>
              Fleet Operations
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Total Trips</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {yearlyTotals.trips}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Maintenance Sessions</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {yearlyTotals.maintenance}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Inspections</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {yearlyTotals.inspections}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Completion Rate</span>
                <span className="font-medium" style={{ color: colors.adminSuccess }}>
                  {Math.round((yearlyTotals.completed / yearlyTotals.trips) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.textSecondary }}>
              Financial Performance
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Total Revenue</span>
                <span className="font-medium" style={{ color: colors.adminSuccess }}>
                  {formatCurrency(yearlyTotals.totalRevenue)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Total Expenses</span>
                <span className="font-medium" style={{ color: colors.adminError }}>
                  {formatCurrency(yearlyTotals.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Net Profit</span>
                <span className="font-medium" style={{ color: colors.adminSuccess }}>
                  {formatCurrency(yearlyTotals.totalRevenue - yearlyTotals.totalExpenses)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Profit Margin</span>
                <span className="font-medium" style={{ color: colors.adminSuccess }}>
                  {Math.round(((yearlyTotals.totalRevenue - yearlyTotals.totalExpenses) / yearlyTotals.totalRevenue) * 100)}%
                </span>
              </div>
            </div>
          </div>

          <div>
            <h4 className="text-sm font-medium mb-3" style={{ color: colors.textSecondary }}>
              Fleet Efficiency
            </h4>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Avg Utilization</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {Math.round(yearlyTotals.avgUtilization / 12)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Trips/Month</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {Math.round(yearlyTotals.trips / 12)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Maintenance/Month</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {Math.round(yearlyTotals.maintenance / 12)}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span style={{ color: colors.textSecondary }}>Revenue/Trip</span>
                <span className="font-medium" style={{ color: colors.textPrimary }}>
                  {formatCurrency(Math.round(yearlyTotals.totalRevenue / yearlyTotals.trips))}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}