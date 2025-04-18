'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../themeContext'
import SideNavbar from '../components/navbars/SideNavbar'
import Calendar from '../components/calendar/Calendar'
import EventModal from '../components/calendar/EventModal'
import Error3DAnimation from '../components/calendar/Error3DAnimation'

interface Event {
  id: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
}

export default function CalendarPage() {
  const { theme } = useTheme()
  const [events, setEvents] = useState<Event[]>([])
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedEvents = localStorage.getItem('calendarEvents')
      if (savedEvents) {
        const parsedEvents = JSON.parse(savedEvents).map((e: any) => ({
          ...e,
          id: Number(e.id),
          start: new Date(e.start),
          end: new Date(e.end),
        }))
        setEvents(parsedEvents)
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('calendarEvents', JSON.stringify(events))
    }
  }, [events])

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    if (start < new Date()) {
      console.log(`Calendar: Blocked past date ${start.toISOString()}`)
      setShowErrorAnimation(true)
      setTimeout(() => setShowErrorAnimation(false), 3000)
      return
    }
    setSelectedSlot({ start, end })
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleSelectEvent = (event: Event) => {
    setSelectedEvent(event)
    setSelectedSlot(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (eventData: Omit<Event, 'id'> & { id?: number }) => {
    if (eventData.id) {
      // Edit existing event
      setEvents(events.map((e) => (e.id === eventData.id ? { ...eventData, id: e.id } : e)))
      console.log(`CalendarPage: Updated event ID ${eventData.id}`)
    } else {
      // Create new event
      const newEvent = { ...eventData, id: Date.now() }
      setEvents([...events, newEvent])
      console.log(`CalendarPage: Created new event ID ${newEvent.id}`)
    }
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  const handleDeleteEvent = (id: number) => {
    setEvents(events.filter((e) => e.id !== id))
    console.log(`CalendarPage: Deleted event ID ${id}`)
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  return (
    <div className={`flex h-screen ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
      <SideNavbar theme={theme} toggleTheme={() => {}} />
      <div className="flex-1 p-6 ml-[260px]">
        <h1 className="text-2xl font-semibold mb-4">Calendar</h1>
        <Calendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          theme={theme}
        />
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setSelectedEvent(null)
            setSelectedSlot(null)
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          slot={selectedSlot}
          theme={theme}
        />
        <Error3DAnimation theme={theme} isVisible={showErrorAnimation} />
      </div>
    </div>
  )
}