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
      setEvents: React.Dispatch<React.SetStateAction<Event[]>>
      theme: 'light' | 'dark'
      selectedEvent: Event | null
      modalOpen: boolean
      setModalOpen: React.Dispatch<React.SetStateAction<boolean>>
    }
    
    export default function Calendar({
      events,
      setEvents,
      theme,
      selectedEvent,
      modalOpen,
      setModalOpen,
    }: CalendarProps) {
      const [isMounted, setIsMounted] = useState(false)
      const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null)
      const [view, setView] = useState<string>(Views.MONTH)
      const [date, setDate] = useState<Date>(new Date())
    
      useEffect(() => {
        setIsMounted(true)
        console.log('Calendar: Client-side mounted')
      }, [])
    
      useEffect(() => {
        console.log(`Calendar: Initializing view=${view}, date=${date}`)
        setView(Views.MONTH)
        setDate(new Date())
      }, [])
    
      console.log(`Calendar: Rendering with theme ${theme}, events length ${events.length}, view ${view}`)
    
      const handleSelectSlot = useCallback(({ start, end }: { start: Date; end: Date }) => {
        console.log(`Calendar: Selected slot ${start} to ${end}`)
        setSelectedSlot({ start, end })
        setModalOpen(true)
      }, [setModalOpen])
    
      const handleSelectEvent = useCallback(
        (event: Event) => {
          console.log(`Calendar: Selected event ID ${event.id}`)
          setSelectedSlot(null)
          setModalOpen(true)
        },
        [setModalOpen]
      )
    
      const handleViewChange = useCallback((newView: string) => {
        console.log(`Calendar: Changing view to ${newView}`)
        setView(newView)
      }, [])
    
      const handleNavigate = useCallback((newDate: Date, view: string, action: string) => {
        console.log(`Calendar: Navigating to ${newDate}, view ${view}, action ${action}`)
        setDate(newDate)
      }, [])
    
      const handleCreateOrUpdate = useCallback(
        (eventData: Omit<Event, 'id'> & { id?: number }) => {
          if (!eventData.start || !eventData.end || isNaN(eventData.start.getTime())) {
            console.error(`Calendar: Invalid event dates for "${eventData.title}"`)
            return
          }
          if (eventData.id) {
            setEvents(events.map((e) => (e.id === eventData.id ? { ...eventData, id: e.id } : e)))
            console.log(`Calendar: Updated event "${eventData.title}"`)
          } else {
            const newEvent = { ...eventData, id: Date.now() }
            setEvents([...events, newEvent])
            console.log(`Calendar: Created event "${eventData.title}"`)
          }
          setModalOpen(false)
        },
        [events, setEvents, setModalOpen]
      )
    
      const handleDelete = useCallback(
        (id: number) => {
          setEvents(events.filter((e) => e.id !== id))
          console.log(`Calendar: Deleted event ID ${id}`)
          setModalOpen(false)
        },
        [events, setEvents, setModalOpen]
      )
    
      const eventStyleGetter = useCallback(
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
        return null
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
            events={events.filter(
              (e) => e.start && e.end && !isNaN(e.start.getTime()) && !isNaN(e.end.getTime())
            )}
            startAccessor="start"
            endAccessor="end"
            style={{ height: 600 }}
            onSelectSlot={handleSelectSlot}
            onSelectEvent={handleSelectEvent}
            onView={handleViewChange}
            onNavigate={handleNavigate}
            view={view}
            date={date}
            selectable
            eventPropGetter={eventStyleGetter}
            className={theme === 'dark' ? 'rbc-dark' : ''}
            views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
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