'use client'

import { useMemo, useEffect, useState } from 'react'
import { Car, Wrench, Users, Clock } from 'lucide-react'
import { colors } from '@/lib/theme/colors'
import { fetchCalendarEvents, CalendarEvent, CalendarFilters } from '@/lib/api'

interface WeekViewProps {
  currentDate: Date
}

export default function WeekView({ currentDate }: WeekViewProps) {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)

  const weekDays = useMemo(() => {
    const days = []
    const startOfWeek = new Date(currentDate)
    startOfWeek.setDate(currentDate.getDate() - currentDate.getDay())

    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)
      days.push(day)
    }
    return days
  }, [currentDate])

  const timeSlots = useMemo(() => {
    const slots = []
    for (let hour = 6; hour <= 22; hour++) {
      slots.push(`${hour.toString().padStart(2, '0')}:00`)
    }
    return slots
  }, [])

  // Load events for the current week
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true)
        const startOfWeek = new Date(weekDays[0])
        const endOfWeek = new Date(weekDays[6])
        
        const filters: CalendarFilters = {
          start_date: startOfWeek.toISOString().split('T')[0],
          end_date: endOfWeek.toISOString().split('T')[0]
        }
        
        const eventsData = await fetchCalendarEvents(filters)
        setEvents(eventsData)
      } catch (error) {
        console.error('Error loading week events:', error)
        setEvents([])
      } finally {
        setLoading(false)
      }
    }

    if (weekDays.length > 0) {
      loadEvents()
    }
  }, [weekDays])

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

  const getEventColor = (type: CalendarEvent['event_type'], status?: CalendarEvent['status']) => {
    const baseColors = {
      trip: colors.adminPrimary,
      maintenance: colors.adminWarning,
      inspection: colors.adminAccent,
      available: colors.adminSuccess,
      other: colors.textSecondary,
    }

    const statusOpacity = status === 'completed' ? '40' : status === 'cancelled' ? '20' : ''
    return baseColors[type] + statusOpacity
  }

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventDate = new Date(event.start_date)
      return eventDate.toDateString() === date.toDateString()
    })
  }

  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
  }

  const getEventDuration = (startDate: string, endDate: string) => {
    const start = new Date(startDate)
    const end = new Date(endDate)
    const durationMs = end.getTime() - start.getTime()
    const durationHours = Math.ceil(durationMs / (1000 * 60 * 60))
    
    if (durationHours < 1) return '<1h'
    if (durationHours < 24) return `${durationHours}h`
    return `${Math.ceil(durationHours / 24)}d`
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return date.toDateString() === today.toDateString()
  }

  return (
    <div className="h-full overflow-auto">
      {/* Week Header */}
      <div className="grid grid-cols-8 border-b sticky top-0 bg-white z-10" style={{ borderColor: colors.borderLight }}>
        <div className="p-3 font-semibold text-sm" style={{ color: colors.textSecondary }}>
          Time
        </div>
        {weekDays.map((day, index) => (
          <div
            key={index}
            className={`p-3 text-center border-l ${
              isToday(day) ? 'bg-blue-50' : ''
            }`}
            style={{ borderColor: colors.borderLight }}
          >
            <div className="font-semibold text-sm" style={{ color: colors.textPrimary }}>
              {day.toLocaleDateString('en-US', { weekday: 'short' })}
            </div>
            <div className={`text-xs mt-1 ${
              isToday(day) ? 'text-blue-600 font-bold' : ''
            }`} style={{ color: colors.textSecondary }}>
              {day.getDate()}
            </div>
          </div>
        ))}
      </div>

      {/* Time Grid */}
      <div className="min-w-[800px]">
        {timeSlots.map((time, timeIndex) => (
          <div key={time} className="grid grid-cols-8 border-b" style={{ borderColor: colors.borderLight }}>
            {/* Time Label */}
            <div className="p-2 text-xs font-medium border-r" style={{ borderColor: colors.borderLight, color: colors.textTertiary }}>
              {time}
            </div>

            {/* Day Columns */}
            {weekDays.map((day, dayIndex) => {
              const events = getEventsForDay(day)
              const eventsAtThisTime = events.filter(event => {
                const eventStartTime = formatEventTime(event.start_date)
                return event.all_day || eventStartTime === time
              })

              return (
                <div
                  key={dayIndex}
                  className={`p-1 border-r min-h-[60px] ${
                    isToday(day) ? 'bg-blue-50/30' : ''
                  } hover:bg-gray-50 cursor-pointer transition-colors`}
                  style={{ borderColor: colors.borderLight }}
                >
                  {eventsAtThisTime.map((event, eventIndex) => {
                    const Icon = getEventIcon(event.event_type)
                    return (
                      <div
                        key={event.id}
                        className="text-xs p-1 mb-1 rounded border-l-2 truncate"
                        style={{
                          backgroundColor: getEventColor(event.event_type, event.status),
                          borderLeftColor: getEventColor(event.event_type, event.status)?.replace('40', '').replace('20', ''),
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <Icon size={12} className="text-white" />
                          <span className="text-white font-medium truncate">
                            {event.title}
                          </span>
                        </div>
                        {!event.all_day && (
                          <div className="text-white/80 text-xs mt-1">
                            {getEventDuration(event.start_date, event.end_date)}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 p-4 border rounded-lg" style={{ borderColor: colors.borderLight }}>
        <div className="text-sm font-semibold mb-2" style={{ color: colors.textPrimary }}>
          Event Types
        </div>
        <div className="flex flex-wrap gap-4 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.adminPrimary }} />
            <span style={{ color: colors.textSecondary }}>Trip</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.adminWarning }} />
            <span style={{ color: colors.textSecondary }}>Maintenance</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.adminAccent }} />
            <span style={{ color: colors.textSecondary }}>Inspection</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded" style={{ backgroundColor: colors.adminSuccess }} />
            <span style={{ color: colors.textSecondary }}>Available</span>
          </div>
        </div>
      </div>
    </div>
  )
}