'use client'

import { useState } from 'react'
import { Calendar as BigCalendar, momentLocalizer } from 'react-big-calendar'
import moment from 'moment'
import EventModal from './EventModal'
import 'react-big-calendar/lib/css/react-big-calendar.css'

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
  setEvents: React.Dispatch<React.SetStateAction<Event[]>>
  theme: 'light' | 'dark'
}

export default function Calendar({ events, setEvents, theme }: CalendarProps) {
  console.log(`Calendar: Theme applied ${theme}`)
  const [modalOpen, setModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setSelectedSlot({ start, end })
    setSelectedEvent(null)
    setModalOpen(true)
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedSlot(null)
    setModalOpen(true)
  }

  const handleCreateOrUpdate = (eventData: Omit<Event, 'id'> & { id?: number }) => {
    if (eventData.id) {
      setEvents(events.map((e) => (e.id === eventData.id ? { ...eventData, id: e.id } : e)))
      console.log(`Calendar: Updated event "${eventData.title}"`)
    } else {
      const newEvent = { ...eventData, id: Date.now() }
      setEvents([...events, newEvent])
      console.log(`Calendar: Created event "${eventData.title}"`)
    }
    setModalOpen(false)
  }

  const handleDelete = (id: number) => {
    setEvents(events.filter((e) => e.id !== id))
    console.log(`Calendar: Deleted event ID ${id}`)
    setModalOpen(false)
  }

  const eventStyleGetter = (event: Event) => {
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
  }

  return (
    <div
      className={`p-4 rounded-xl shadow-lg ${
        theme === 'light' ? 'bg-white' : 'bg-slate-700'
      }`}
      data-testid="calendar"
    >
      <BigCalendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: 600 }}
        onSelectSlot={handleSelectSlot}
        onSelectEvent={handleSelectEvent}
        selectable
        eventPropGetter={eventStyleGetter}
        className={theme === 'dark' ? 'rbc-dark' : ''}
      />
      <EventModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleCreateOrUpdate}
        onDelete={handleDelete}
        event={selectedEvent}
        slot={selectedSlot}
        theme={theme}
      />
    </div>
  )
}