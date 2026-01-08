'use client'

import { useMemo, useEffect, useState } from 'react'
import { Car, Wrench, Users, Clock, Plus } from 'lucide-react'
import { Calendar } from '@/components/ui/calendar'
import { colors } from '@/lib/theme/colors'
import { fetchCalendarEvents, CalendarEvent, CalendarFilters } from '@/lib/api'

interface MonthViewProps {
  currentDate: Date
}

export default function MonthView({ currentDate }: MonthViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startDayOfWeek = firstDay.getDay()

    const days = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of month
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }

    return days
  }, [currentDate])

  // Load events for the current month
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
        const endDate = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

        const filters: CalendarFilters = {
          start_date: startDate.toISOString().split('T')[0],
          end_date: endDate.toISOString().split('T')[0]
        }

        const eventsData = await fetchCalendarEvents(filters)
        setEvents(eventsData)
      } catch (error) {
        console.error('Error loading month events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    loadEvents()
  }, [currentDate])

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const getEventIcon = (type: CalendarEvent['event_type']) => {
    switch (type) {
      case 'trip':
        return Car
      case 'maintenance':
        return Wrench
      case 'inspection':
        return Clock
      default:
        return Users
    }
  }

  const getEventColor = (type: CalendarEvent['event_type']) => {
    const colors_map = {
      trip: colors.adminPrimary,
      maintenance: colors.adminWarning,
      inspection: colors.adminAccent,
      available: colors.adminSuccess,
      other: colors.textSecondary,
    }
    return colors_map[type]
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  return (
    <div className="h-full overflow-auto">
      {/* Month Grid */}
      <div className="grid grid-cols-7 h-full">
        {/* Day Headers */}
        {weekDays.map((day, index) => (
          <div
            key={index}
            className="p-3 text-center font-semibold border-b border-r"
            style={{
              borderColor: colors.borderLight,
              color: colors.textSecondary,
              fontSize: '14px'
            }}
          >
            {day}
          </div>
        ))}

        {/* Calendar Days */}
        {monthDays.map((day, index) => {
          if (!day) {
            return (
              <div
                key={`empty-${index}`}
                className="min-h-[120px] p-2 border-b border-r bg-gray-50"
                style={{ borderColor: colors.borderLight }}
              />
            )
          }

          const dayEvents = getEventsForDay(day)
          const isCurrentDay = isToday(day)

          return (
            <div
              key={index}
              className={`min-h-[120px] p-2 border-b border-r hover:bg-gray-50 cursor-pointer transition-colors ${isCurrentDay ? 'bg-blue-50/50' : ''
                }`}
              style={{ borderColor: colors.borderLight }}
            >
              {/* Day Number */}
              <div className={`text-sm font-medium mb-1 ${isCurrentDay ? 'text-blue-600 font-bold' : ''
                }`} style={{ color: colors.textPrimary }}>
                {day.getDate()}
              </div>

              {/* Events for this day */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event, eventIndex) => {
                  const Icon = getEventIcon(event.event_type)
                  return (
                    <div
                      key={event.id}
                      className="flex items-center gap-1 text-xs p-1 rounded cursor-pointer hover:opacity-80 transition-opacity"
                      style={{ backgroundColor: getEventColor(event.event_type) + '20' }}
                    >
                      <Icon
                        size={10}
                        style={{ color: getEventColor(event.event_type) }}
                      />
                      <span
                        className="truncate flex-1"
                        style={{ color: getEventColor(event.event_type) }}
                      >
                        {event.title.length > 15
                          ? event.title.substring(0, 15) + '...'
                          : event.title}
                      </span>
                    </div>
                  )
                })}

                {/* Show "more" indicator if there are more than 3 events */}
                {dayEvents.length > 3 && (
                  <div
                    className="text-xs font-medium"
                    style={{ color: colors.textTertiary }}
                  >
                    +{dayEvents.length - 3} more
                  </div>
                )}

                {/* Add Event Button */}
                {dayEvents.length === 0 && (
                  <button
                    className="flex items-center gap-1 text-xs p-1 rounded border border-dashed hover:bg-gray-50 transition-colors w-full"
                    style={{
                      borderColor: colors.borderLight,
                      color: colors.textTertiary
                    }}
                    onClick={(e) => {
                      e.stopPropagation()
                      // TODO: Open add event modal
                      console.log('Add event for:', day.toDateString())
                    }}
                  >
                    <Plus size={10} />
                    Add Event
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Event Summary */}
      <div className="mt-6 p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
        <div className="text-sm font-semibold mb-3" style={{ color: colors.textPrimary }}>
          Monthly Summary
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.adminPrimary }}>
              {events.filter(e => e.event_type === 'trip').length}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Trips Scheduled
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.adminWarning }}>
              {events.filter(e => e.event_type === 'maintenance').length}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Maintenance
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.adminAccent }}>
              {events.filter(e => e.event_type === 'inspection').length}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Inspections
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold" style={{ color: colors.adminSuccess }}>
              {events.filter(e => e.status === 'completed').length}
            </div>
            <div className="text-xs" style={{ color: colors.textSecondary }}>
              Completed
            </div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
        <div className="text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
          Event Types
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <Car size={12} style={{ color: colors.adminPrimary }} />
            <span style={{ color: colors.textSecondary }}>Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <Wrench size={12} style={{ color: colors.adminWarning }} />
            <span style={{ color: colors.textSecondary }}>Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <Clock size={12} style={{ color: colors.adminAccent }} />
            <span style={{ color: colors.textSecondary }}>Inspection</span>
          </div>
          <div className="flex items-center gap-2">
            <Users size={12} style={{ color: colors.adminSuccess }} />
            <span style={{ color: colors.textSecondary }}>Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}