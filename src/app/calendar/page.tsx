'use client'

import { useState } from 'react'
import Calendar, { Event } from '../components/calendar/Calendar' 
import ThreeBackground from '../components/calendar/ThreeBackground' 
import { useTheme } from '../themeContext'

export default function CalendarPage() {
  const { theme } = useTheme()
  const [events, setEvents] = useState<Event[]>([])
  return (
    <main>
        
    <div
      className={`min-h-screen relative ${
        theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'
      }`}
    >
      <ThreeBackground theme={theme} />
      <div className="relative z-10 max-w-7xl mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Calendar</h1>
        <Calendar events={events} setEvents={setEvents} theme={theme} />
      </div>
    </div>
    </main>
  )
}