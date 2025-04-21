'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '../themeContext'
import SideNavbar from '../components/navbars/SideNavbar'
import Calendar from '../components/calendar/Calendar'
import EventModal from '../components/calendar/EventModal'
import Error3DAnimation from '../components/calendar/Error3DAnimation'
import toast from 'react-hot-toast'

interface Event {
  id: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
  businessId?: string
  projectId?: string
}

interface Business {
  id: string
  name: string
  description: string
  projects: { id: string; name: string; tasks: any[] }[]
}

export default function CalendarPage() {
  const { theme } = useTheme()
  const safeTheme = theme || 'light'
  const [events, setEvents] = useState<Event[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [showErrorAnimation, setShowErrorAnimation] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)

  // Carregar eventos e negócios do localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const savedEvents = localStorage.getItem('calendarEvents')
        if (savedEvents) {
          console.log('Loading calendar events from localStorage:', savedEvents)
          const parsedEvents = JSON.parse(savedEvents).map((e: any) => ({
            ...e,
            id: Number(e.id),
            start: new Date(e.start),
            end: new Date(e.end),
          }))
          setEvents(parsedEvents)
        }
        const savedBusinesses = localStorage.getItem('businesses')
        if (savedBusinesses) {
          console.log('Loading businesses from localStorage:', savedBusinesses)
          setBusinesses(JSON.parse(savedBusinesses))
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        localStorage.removeItem('calendarEvents')
        localStorage.removeItem('businesses')
        toast.error('Dados corrompidos. Reiniciando armazenamento.')
      }
    }
  }, [])

  // Salvar eventos no localStorage
  useEffect(() => {
    if (typeof window !== 'undefined' && events.length > 0) {
      try {
        console.log('Saving calendar events to localStorage:', events)
        localStorage.setItem('calendarEvents', JSON.stringify(events))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [events])

  // Atualizar negócios no localStorage
  const updateBusinessesInStorage = (updatedBusinesses: Business[]) => {
    try {
      console.log('Saving updated businesses to localStorage:', updatedBusinesses)
      localStorage.setItem('businesses', JSON.stringify(updatedBusinesses))
      setBusinesses(updatedBusinesses)
    } catch (error) {
      console.error('Error saving businesses to localStorage:', error)
    }
  }

  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    const today = new Date()
    const startDate = new Date(start.getFullYear(), start.getMonth(), start.getDate())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (startDate < todayDate) {
      console.log(`Calendar: Blocked past date ${start.toISOString()}`)
      toast.error('Não é possível agendar em datas passadas.')
      setShowErrorAnimation(true)
      setTimeout(() => setShowErrorAnimation(false), 3000)
      return
    }
    console.log('Slot selected:', { start, end })
    setSelectedSlot({ start, end })
    setSelectedEvent(null)
    setIsModalOpen(true)
  }

  const handleSelectEvent = (event: Event) => {
    console.log('Event selected:', event)
    setSelectedEvent(event)
    setSelectedSlot(null)
    setIsModalOpen(true)
  }

  const handleSaveEvent = (eventData: Omit<Event, 'id'> & { id?: number }) => {
    const event: Event = {
      id: eventData.id || Date.now(),
      title: eventData.title,
      start: eventData.start,
      end: eventData.end,
      priority: eventData.priority,
      description: eventData.description,
      businessId: eventData.businessId,
      projectId: eventData.projectId,
    }
    console.log(`CalendarPage: ${eventData.id ? 'Updated' : 'Created'} event ID ${event.id}`)
    setEvents((prev) => (eventData.id ? prev.map((e) => (e.id === event.id ? event : e)) : [...prev, event]))
    toast.success(eventData.id ? 'Evento atualizado!' : 'Evento criado!')

    // Sincronizar com businesses se vinculado a um projeto
    if (eventData.businessId && eventData.projectId) {
      console.log('Before update:', JSON.stringify(businesses))
      const updatedBusinesses = businesses.map((b) =>
        b.id === eventData.businessId
          ? {
              ...b,
              projects: b.projects.map((p) =>
                p.id === eventData.projectId
                  ? {
                      ...p,
                      tasks: eventData.id
                        ? p.tasks.map((t) =>
                            t.id === `task-${event.id}`
                              ? {
                                  id: t.id,
                                  title: event.title,
                                  status: event.priority === 'Low' ? 'To Do' : event.priority === 'Medium' ? 'In Progress' : 'Done',
                                  dueDate: event.start.toISOString().split('T')[0],
                                  description: event.description,
                                }
                              : t
                          )
                        : [
                            ...p.tasks,
                            {
                              id: `task-${event.id}`,
                              title: event.title,
                              status: event.priority === 'Low' ? 'To Do' : event.priority === 'Medium' ? 'In Progress' : 'Done',
                              dueDate: event.start.toISOString().split('T')[0],
                              description: event.description,
                            },
                          ],
                    }
                  : p
              ),
            }
          : b
      )
      console.log('After update:', JSON.stringify(updatedBusinesses))
      updateBusinessesInStorage(updatedBusinesses)
    }

    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  const handleDeleteEvent = (id: number) => {
    console.log(`CalendarPage: Deleted event ID ${id}`)
    setEvents(events.filter((e) => e.id !== id))
    toast.success('Evento removido!')
    // Remover tarefa correspondente do negócio
    const updatedBusinesses = businesses.map((b) => ({
      ...b,
      projects: b.projects.map((p) => ({
        ...p,
        tasks: p.tasks.filter((t) => t.id !== `task-${id}`),
      })),
    }))
    updateBusinessesInStorage(updatedBusinesses)
    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  return (
    <div className={`flex min-h-screen ${safeTheme === 'light' ? 'bg-gray-100' : 'bg-slate-800'}`}>
      <SideNavbar theme={safeTheme} toggleTheme={() => {}} />
      <div className="flex-1 p-6 ml-[260px]">
        <h1 className={`text-2xl font-semibold mb-4 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          Calendar
        </h1>
        <Calendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          theme={safeTheme}
        />
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            console.log('Closing EventModal')
            setIsModalOpen(false)
            setSelectedEvent(null)
            setSelectedSlot(null)
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          slot={selectedSlot}
          theme={safeTheme}
          businesses={businesses}
        />
        <Error3DAnimation theme={safeTheme} isVisible={showErrorAnimation} />
      </div>
    </div>
  )
}