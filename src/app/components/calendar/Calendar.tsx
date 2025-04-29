'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/app/styles/rcb-dark.css'
import { Event } from '@/app/types/events'

const localizer = momentLocalizer(moment)
interface CalendarProps {
  events: Event[]
  onSelectSlot: (slot: { start: Date; end: Date }) => void
  onSelectEvent: (event: Event) => void
  theme: 'light' | 'dark'
}

export default function Calendar({ events, onSelectSlot, onSelectEvent, theme }: CalendarProps) {
  const [isMounted, setIsMounted] = useState(false)
  const [view, setView] = useState<string>(Views.MONTH)
  const [date, setDate] = useState<Date>(new Date())

  useEffect(() => {
    setIsMounted(true)
    console.log('Calendar: Client-side mounted')
  }, [])

  const handleViewChange = useCallback((newView: string) => {
    console.log(`Calendar: Changing view to ${newView}`)
    setView(newView)
  }, [])

  const handleNavigate = useCallback((newDate: Date, view: string, action: string) => {
    console.log(`Calendar: Navigating to ${newDate}, view ${view}, action ${action}`)
    setDate(newDate)
  }, [])

  const eventPropGetter = useCallback(
    (event: Event) => {
      const style = {
        backgroundColor:
          event.priority === 'High'
            ? '#ef4444'
            : event.priority === 'Medium'
            ? '#f59e0b'
            : '#10b981',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
      }
      return { style }
    },
    []
  )

  if (!isMounted) {
    console.log('Calendar: Skipping render (not mounted)')
    return <div>Loading calendar...</div>
  }

  return (
    <div className="h-[80vh] w-full overflow-auto">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        onView={handleViewChange}
        onNavigate={handleNavigate}
        view={view}
        date={date}
        selectable
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        className={theme === 'dark' ? 'rbc-dark text-white' : ''}
        eventPropGetter={eventPropGetter}
        style={{ minHeight: '600px' }}
      />
      
    </div>
  )
}