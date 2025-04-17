'use client'

import { useState } from 'react'
import Calendar, { Event } from '../components/calendar/Calendar' 
import ThreeBackground from '../components/calendar/ThreeBackground' 
import { useTheme } from '../themeContext'

export default function CalendarPage() {
  const { theme } = useTheme()
  const [events, setEvents] = useState<Event[]>([])
  const [show3D, setShow3D] = useState(true)
  const [modalOpen, setModalOpen] = useState(false)

  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)

  console.log(`CalendarPage: Mounted with theme ${theme}, events length ${events.length}`)
  const handleEventClick = (event: Event) => {
    console.log(`CalendarPage: 3D event clicked ID ${event.id}`)
    setSelectedEvent(event)
    setModalOpen(true)
  }

  return (
    <div
      className={`min-h-screen relative ${
        theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'
      }`}
    >
      {show3D && (
        <ThreeBackground theme={theme} events={events} onEventClick={handleEventClick} />
      )}
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Calendar</h1>
          <button
            onClick={() => setShow3D(!show3D)}
            className={`px-4 py-2 rounded-xl ${
              theme === 'light' ? 'bg-gray-200' : 'bg-slate-600'
            }`}
          >
            {show3D ? 'Hide 3D' : 'Show 3D'}
          </button>
        </div>
        <Calendar
          events={events}
          setEvents={setEvents}
          theme={theme}
          selectedEvent={selectedEvent}
          modalOpen={modalOpen}
          setModalOpen={setModalOpen}
        />
      </div>
    </div>
  )
}