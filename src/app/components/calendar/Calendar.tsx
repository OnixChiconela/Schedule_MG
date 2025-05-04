'use client'

import { useState, useEffect, useCallback } from 'react'
import { Calendar as BigCalendar, momentLocalizer, Views, Navigate, Components } from 'react-big-calendar'
import moment from 'moment'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import '@/app/styles/rcb-dark.css'
import { Event } from '@/app/types/events'
import { add, sub } from 'date-fns'


const localizer = momentLocalizer(moment)
interface CalendarProps {
  events: Event[]
  onSelectSlot: (slot: { start: Date; end: Date }) => void
  onSelectEvent: (event: Event) => void
  theme: 'light' | 'dark'
}

const CustomToolbar = ({ label, onNavigate, onView, view, date }:
  {
    label: string,
    onNavigate: (date: Date, view: string, action: string) => void
    onView: ({ }) => void,
    view: string
    date: Date

  }
) => {
  const handleButtonClick = (action: 'TODAY' | 'NEXT' | 'PREV') => {
    let newDate = date
    switch (action) {
      case 'TODAY':
        newDate = new Date()
        break
      case 'NEXT':
        if (view === Views.MONTH) newDate = add(date, { months: 1 })
        if (view === Views.WEEK) newDate = add(date, { weeks: 1 })
        if (view === Views.DAY) newDate = add(date, { days: 1 })
        break
      case 'PREV':
        if (view === Views.MONTH) newDate = sub(date, { months: 1 })
        if (view === Views.WEEK) newDate = sub(date, { weeks: 1 })
        if (view === Views.DAY) newDate = sub(date, { days: 1 })
        break
    }
    onNavigate(newDate, view, action)
  }

  return (

    <div
      className="rbc-toolbar"
      style={{
        position: 'fixed',
        top: '120px',
        left: '0',
        right: '0',
        zIndex: 10,
        // backgroundColor: theme === 'dark' ? '#1a202c' : '#ffffff',
        padding: '8px 16px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
      }}
    >
      <span className="rbc-btn-group">
        <button type="button" onClick={() => handleButtonClick('TODAY')}>Today</button>
        <button type="button" onClick={() => handleButtonClick('PREV')}>Back</button>
        <button type="button" onClick={() => handleButtonClick('NEXT')}>Next</button>
      </span>

      <span className="rbc-toolbar-label">{label}</span>
      <span className="rbc-btn-group">
        <button
          type="button"
          onClick={() => onView(Views.MONTH)}
          className={view === Views.MONTH ? 'rbc-active' : ''}
        >
          Month
        </button>
        <button
          type="button"
          onClick={() => onView(Views.WEEK)}
          className={view === Views.WEEK ? 'rbc-active' : ''}
        >
          Week
        </button>
        <button
          type="button"
          onClick={() => onView(Views.DAY)}
          className={view === Views.DAY ? 'rbc-active' : ''}
        >
          Day
        </button>
        <button
          type="button"
          onClick={() => onView(Views.AGENDA)}
          className={view === Views.AGENDA ? 'rbc-active' : ''}
        >
          Agenda
        </button>
      </span>
    </div>
  )
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
    return <div>Loading calendar...</div>
  }

  return (
    <div className="h-[80vh] w-full pt-28">
      <style jsx global>{`
        .rbc-event.rbc-selected,
        .rbc-slot-selection {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.2)' : 'rgba(0, 0, 0, 0.1)'};
          transition: background-color 0.1s ease;
        }
        .rbc-event:hover,
        .rbc-day-slot .rbc-time-slot:hover {
          background-color: ${theme === 'dark' ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.05)'};
        }
        .rbc-month-view .rbc-row:first-child {
          min-width: 1200px; /* Sincroniza com .rbc-month-row */
        }
        .rbc-month-view .rbc-header {
          min-width: 120px; /* Mesma largura que .rbc-day-bg */
          padding: 4px;
          box-sizing: border-box;
        }
        .rbc-month-view .rbc-month-row {
          min-width: 1200px; /* Largura total mínima para 10 dias a 120px cada */
        }
        .rbc-month-view .rbc-day-bg {
          min-width: 120px; /* Largura fixa para cada dia no modo MONTH */
          padding: 4px; /* Padding interno para "folga" visual */
          box-sizing: border-box;
        }
        .rbc-time-view .rbc-time-header {
          min-width: 1500px; /* Sincroniza com .rbc-time-content */
        }
        .rbc-time-view .rbc-time-header-cell {
          min-width: 150px; /* Mesma largura que .rbc-day-slot */
          padding: 4px;
          box-sizing: border-box;
        }
        .rbc-time-view .rbc-time-content {
          min-width: 1500px; /* Largura total mínima para 10 slots a 150px cada */
        }
        .rbc-time-view .rbc-day-slot {
          min-width: 150px; /* Largura fixa para cada slot no modo WEEK/DAY */
          padding: 4px; /* Padding interno para "folga" visual */
          box-sizing: border-box;
        }
        .rbc-agenda-view .rbc-agenda-content {
          min-width: 1200px; /* Largura total mínima para consistência */
        }
        @media (max-width: 320px) {
          .rbc-month-view .rbc-header {
            min-width: 100px; /* Sincroniza com .rbc-day-bg */
          }
          .rbc-month-view .rbc-day-bg {
            min-width: 100px; /* Reduz ligeiramente em telas muito pequenas */
          }
          .rbc-time-view .rbc-time-header-cell {
            min-width: 120px; /* Sincroniza com .rbc-day-slot */
          }
          .rbc-time-view .rbc-day-slot {
            min-width: 120px; /* Reduz ligeiramente em telas muito pequenas */
          }
        }
      `}</style>
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
        step={30}
        timeslots={2}
        views={[Views.MONTH, Views.WEEK, Views.DAY, Views.AGENDA]}
        className={theme === 'dark' ? 'rbc-dark text-white' : ''}
        eventPropGetter={eventPropGetter}
        components={{
          toolbar: (toolbarProps: any) => (
            <CustomToolbar
              {...toolbarProps}
              view={view}
              date={date}
              onNavigate={handleNavigate}
            />
          ),
        }}
      />
    </div>
  )
}