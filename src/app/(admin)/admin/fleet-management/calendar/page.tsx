'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Calendar, ChevronLeft, ChevronRight, CalendarDays, CalendarRange } from 'lucide-react'
import DashboardCard from '@/components/shared/dashboard-card'
import StatCard from '@/components/shared/stat-card'
import { colors } from '@/lib/theme/colors'
import { fetchCalendarStats, CalendarStats } from '@/lib/api'
import WeekView from './components/week-view'
import MonthView from './components/month-view'
import YearView from './components/year-view'

type ViewType = 'week' | 'month' | 'year'

export default function CalendarManagementPage() {
  const [currentView, setCurrentView] = useState<ViewType>('month')
  const [currentDate, setCurrentDate] = useState(new Date())
  const [calendarData, setCalendarData] = useState<CalendarStats | null>(null)
  const [loading, setLoading] = useState(true)

  // Load calendar data from API
  useEffect(() => {
    const loadCalendarData = async () => {
      try {
        setLoading(true)
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)
        
        const stats = await fetchCalendarStats({
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        })
        
        setCalendarData(stats)
      } catch (error) {
        console.error('Error loading calendar data:', error)
        // Set default values if API fails
        setCalendarData({
          total_events: 0,
          events_this_week: 0,
          maintenance_scheduled: 0,
          trips_scheduled: 0,
          upcoming_maintenance: 0,
          overdue_events: 0,
        })
      } finally {
        setLoading(false)
      }
    }
    loadCalendarData()
  }, [currentDate, currentView])

  const stats = [
    {
      title: 'Total Events',
      value: calendarData?.total_events.toString() || '0',
      icon: Calendar,
      trend: { value: '+5', isPositive: true },
      color: colors.adminPrimary,
    },
    {
      title: 'This Week',
      value: calendarData?.events_this_week.toString() || '0',
      icon: CalendarDays,
      trend: { value: '+2', isPositive: true },
      color: colors.adminSuccess,
    },
    {
      title: 'Maintenance',
      value: calendarData?.maintenance_scheduled.toString() || '0',
      icon: Calendar,
      trend: { value: '+1', isPositive: false },
      color: colors.adminWarning,
    },
    {
      title: 'Trips',
      value: calendarData?.trips_scheduled.toString() || '0',
      icon: CalendarRange,
      trend: { value: '+8', isPositive: true },
      color: colors.adminAccent,
    },
  ]

  const navigateDate = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    switch (currentView) {
      case 'week':
        newDate.setDate(newDate.getDate() + (direction === 'next' ? 7 : -7))
        break
      case 'month':
        newDate.setMonth(newDate.getMonth() + (direction === 'next' ? 1 : -1))
        break
      case 'year':
        newDate.setFullYear(newDate.getFullYear() + (direction === 'next' ? 1 : -1))
        break
    }
    setCurrentDate(newDate)
  }

  const getViewTitle = () => {
    const options: Intl.DateTimeFormatOptions = {}
    switch (currentView) {
      case 'week':
        const weekStart = new Date(currentDate)
        weekStart.setDate(currentDate.getDate() - currentDate.getDay())
        const weekEnd = new Date(weekStart)
        weekEnd.setDate(weekStart.getDate() + 6)
        return `${weekStart.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - ${weekEnd.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`
      case 'month':
        return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
      case 'year':
        return currentDate.getFullYear().toString()
      default:
        return ''
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: colors.textPrimary }}>
              Calendar Management
            </h1>
            <p style={{ color: colors.textSecondary }}>
              Schedule vehicle maintenance, track trips, and manage fleet availability
            </p>
          </div>
        </div>

        {/* View Navigation */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Date Navigation */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigateDate('prev')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.textSecondary }}
            >
              <ChevronLeft size={20} />
            </button>
            <h2 className="text-xl font-semibold" style={{ color: colors.textPrimary }}>
              {getViewTitle()}
            </h2>
            <button
              onClick={() => navigateDate('next')}
              className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
              style={{ color: colors.textSecondary }}
            >
              <ChevronRight size={20} />
            </button>
            <button
              onClick={() => setCurrentDate(new Date())}
              className="px-3 py-1 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 transition-colors"
              style={{ color: colors.textSecondary }}
            >
              Today
            </button>
          </div>

          {/* View Switcher */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentView('week')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'week'
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: currentView === 'week' ? colors.adminPrimary : 'transparent',
                color: currentView === 'week' ? 'white' : colors.textSecondary,
              }}
            >
              Week
            </button>
            <button
              onClick={() => setCurrentView('month')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'month'
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: currentView === 'month' ? colors.adminPrimary : 'transparent',
                color: currentView === 'month' ? 'white' : colors.textSecondary,
              }}
            >
              Month
            </button>
            <button
              onClick={() => setCurrentView('year')}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                currentView === 'year'
                  ? 'text-white'
                  : 'hover:bg-gray-100'
              }`}
              style={{
                backgroundColor: currentView === 'year' ? colors.adminPrimary : 'transparent',
                color: currentView === 'year' ? 'white' : colors.textSecondary,
              }}
            >
              Year
            </button>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1, duration: 0.5 }}
          >
            <StatCard {...stat} />
          </motion.div>
        ))}
      </div>

      {/* Calendar View */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.6 }}
      >
        <DashboardCard>
          {loading ? (
            <div className="p-8 text-center text-gray-500">
              Loading calendar data...
            </div>
          ) : (
            <div className="min-h-[600px]">
              {currentView === 'week' && <WeekView currentDate={currentDate} />}
              {currentView === 'month' && <MonthView currentDate={currentDate} />}
              {currentView === 'year' && <YearView currentDate={currentDate} />}
            </div>
          )}
        </DashboardCard>
      </motion.div>
    </motion.div>
  )
}