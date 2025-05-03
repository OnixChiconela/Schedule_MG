'use client'

import { useState, useEffect } from 'react'
import { toast } from 'react-hot-toast'
import Calendar from '../components/calendar/Calendar'
import EventModal from '../components/calendar/EventModal'
import { useTheme } from '../themeContext'
import { Event, Business, UserPreferences } from "@/app/types/events"
import { Project } from '../types/events'
import SuggestedEvents from '../components/SuggestedEvents'
import SideNavbar from '../components/navbars/SideNavbar'
import Navbar from '../components/navbars/Navbar'

export default function CalendarPage() {
  // const { theme } = useTheme()
  const { theme, toggleTheme } = useTheme();

  const [safeTheme, setSafeTheme] = useState(theme);
  const [events, setEvents] = useState<Event[]>([])
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const [userPreferences, setUserPreferences] = useState<UserPreferences>({
    userId: 'default-user',
    interests: [],
  })

  useEffect(() => {
    setSafeTheme(theme);
  }, [theme, isSidebarOpen]);

  useEffect(() => {
    try {
      const storedEvents = localStorage.getItem('calendarEvents')
      const storedBusinesses = localStorage.getItem('businesses')
      const storedPreferences = localStorage.getItem('userPreferences')
      if (storedEvents) {
        const parsedEvents = JSON.parse(storedEvents).map((e: any) => ({
          ...e,
          id: Number(e.id),
          start: new Date(e.start),
          end: new Date(e.end),
          tags: Array.isArray(e.tags) ? e.tags : [],
        }))
        setEvents(parsedEvents)
      }
      if (storedBusinesses) {
        const parsedBusinesses = JSON.parse(storedBusinesses)
        setBusinesses(parsedBusinesses)
      }
      if (storedPreferences) {
        const parsedPreferences = JSON.parse(storedPreferences)
        setUserPreferences(parsedPreferences)
      }
    } catch (error) {
      localStorage.removeItem('calendarEvents')
      console.log(error)
      localStorage.removeItem('businesses')
      toast.error('Corrupted data. Resetting storage.')
    }
  }, [])

  useEffect(() => {
    if (events.length > 0) {
      try {
        localStorage.setItem('calendarEvents', JSON.stringify(events))
      } catch (error) {
        console.log(error)
        toast.error('Error saving events.')
      }
    }
  }, [events])

  useEffect(() => {
    if (businesses.length > 0) {
      try {
        console.log('Saving businesses to localStorage:', businesses)
        localStorage.setItem('businesses', JSON.stringify(businesses))
      } catch (error) {
        console.log(error)
        toast.error('Error saving businesses.')
      }
    }
  }, [businesses])

  const handleSelectSlot = (slot: { start: Date; end: Date }) => {
    const today = new Date()
    const slotDate = new Date(slot.start.getFullYear(), slot.start.getMonth(), slot.start.getDate())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (slotDate < todayDate) {
      toast.error('Cannot schedule on past dates.')
      return
    }
    setSelectedSlot(slot)
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
      tags: Array.isArray(eventData.tags) ? eventData.tags : [],
    }
    console.log(`CalendarPage: ${eventData.id ? 'Updated' : 'Created'} event ID ${event.id}`)
    const updatedEvents = eventData.id
      ? events.map((e) => (e.id === event.id ? event : e))
      : [...events, event]
    setEvents(updatedEvents)
    toast.success(eventData.id ? 'Event updated!' : 'Event created!')

    if (event.businessId && event.projectId) {
      const updatedBusinesses = businesses.map((business) =>
        business.id === event.businessId
          ? {
            ...business,
            projects: business.projects.map((project: Project) =>
              project.id === event.projectId
                ? {
                  ...project,
                  tasks: [
                    ...project.tasks,
                    {
                      id: event.id.toString(),
                      title: event.title,
                      priority: event.priority,
                      dueDate: event.end.toISOString(),
                    },
                  ],
                }
                : project
            ),
          }
          : business
      )
      setBusinesses(updatedBusinesses)
    }

    if (
      Array.isArray(event.tags) &&
      Array.isArray(userPreferences.interests) &&
      event.tags.some((tag) => userPreferences.interests.includes(tag))
    ) {
      toast.success('New suggested event for you!')
    }

    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  const handleDeleteEvent = (id: number) => {
    console.log(`CalendarPage: Deleted event ID ${id}`)
    const updatedEvents = events.filter((e) => e.id !== id)
    setEvents(updatedEvents)
    toast.success('Event removed!')

    const updatedBusinesses = businesses.map((business) => ({
      ...business,
      projects: business.projects.map((project: Project) => ({
        ...project,
        tasks: project.tasks.filter((task) => task.id !== id.toString()),
      })),
    }))
    setBusinesses(updatedBusinesses)

    setIsModalOpen(false)
    setSelectedEvent(null)
    setSelectedSlot(null)
  }

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div
      className={`min-h-screen ${
        safeTheme === 'light' ? 'bg-white' : 'bg-slate-900'
      } transition-colors duration-300`}
    >
      <Navbar
        themeButton={true}
        showToggleSidebarButton={true}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <SideNavbar
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isVisible={isSidebarOpen}
      />
      <main className="flex-1 p-6 pt-20 lg:ml-[260px]">
        <h1
          className={`text-2xl font-semibold mb-4 ${
            safeTheme === 'light' ? 'text-gray-900' : 'text-white'
          }`}
        >
          Calendar
        </h1>
        <Calendar
          events={events}
          onSelectSlot={handleSelectSlot}
          onSelectEvent={handleSelectEvent}
          theme={safeTheme}
        />
        <SuggestedEvents userPreferences={userPreferences} />
        <EventModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedEvent(null);
            setSelectedSlot(null);
          }}
          onSave={handleSaveEvent}
          onDelete={handleDeleteEvent}
          event={selectedEvent}
          slot={selectedSlot}
          theme={safeTheme}
          businesses={businesses}
        />
      </main>
    </div>
  )
}