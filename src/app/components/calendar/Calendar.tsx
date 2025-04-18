'use client'

import { useState, useCallback, useEffect } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views } from 'react-big-calendar'
import moment from 'moment'
import EventModal from './EventModal'
import 'react-big-calendar/lib/css/react-big-calendar.css'

//  import './rbc-dark.css'

const localizer = momentLocalizer(moment)

export interface Event {
  id: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
}

interface CalendarProps {
  events: Event[]
  onSelectSlot: (slot: { start: Date; end: Date }) => void
  onSelectEvent: (event: Event) => void
  theme: 'light' | 'dark'
}

export default function Calendar({ events, onSelectSlot, onSelectEvent, theme }: CalendarProps) {
  return (
    <div className="h-[80vh]">
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        onSelectSlot={onSelectSlot}
        onSelectEvent={onSelectEvent}
        selectable
        className={theme === 'dark' ? 'rbc-dark' : ''}
      />
    </div>
  )
}