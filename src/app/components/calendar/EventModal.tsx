'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

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

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (eventData: Omit<Event, 'id'> & { id?: number }) => void
  onDelete: (id: number) => void
  event: Event | null
  slot: { start: Date; end: Date } | null
  theme: 'light' | 'dark'
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  slot,
  theme,
}: EventModalProps) {
  const [title, setTitle] = useState('')
  const [start, setStart] = useState('')
  const [end, setEnd] = useState('')
  const [priority, setPriority] = useState<'Low' | 'Medium' | 'High'>('Low')
  const [description, setDescription] = useState('')
  const [projectId, setProjectId] = useState<string | null>(null)
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [error, setError] = useState<string>('')
  const [success, setSuccess] = useState<string>('')

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedBusinesses = localStorage.getItem('businesses')
      if (savedBusinesses) {
        setBusinesses(JSON.parse(savedBusinesses))
      }
    }
  }, [])

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStart(event.start.toISOString().slice(0, 16))
      setEnd(event.end.toISOString().slice(0, 16))
      setPriority(event.priority)
      setDescription(event.description || '')
      setProjectId(event.projectId || null)
      setError('')
      setSuccess('')
    } else if (slot) {
      setTitle('')
      setStart(slot.start.toISOString().slice(0, 16))
      setEnd(slot.end.toISOString().slice(0, 16))
      setPriority('Low')
      setDescription('')
      setProjectId(null)
      setError('')
      setSuccess('')
    }
  }, [event, slot])

  const handleSubmit = () => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const now = new Date()

    if (startDate < now) {
      setError('Cannot create events in the past')
      console.log(`EventModal: Error - Start date ${startDate} is in the past`)
      return
    }

    if (endDate <= startDate) {
      setError('End date must be after start date')
      console.log(`EventModal: Error - End date ${endDate} is before start date ${startDate}`)
      return
    }

    if (!title.trim()) {
      setError('Title is required')
      console.log('EventModal: Error - Title is empty')
      return
    }

    const eventData: Omit<Event, 'id'> & { id?: number } = {
      id: event?.id,
      title,
      start: startDate,
      end: endDate,
      priority,
      description: description || undefined,
      projectId: projectId || undefined,
    }

    console.log(`EventModal: Saving event "${title}" with ID ${eventData.id || 'new'} ${projectId ? `linked to project ID ${projectId}` : ''}`)
    onSave(eventData)
    setError('')
    setSuccess('Event saved!')
    setTimeout(() => setSuccess(''), 2000)
  }

  const handleDelete = () => {
    if (event) {
      console.log(`EventModal: Deleting event ID ${event.id}`)
      onDelete(event.id)
      setSuccess('Event deleted!')
      setTimeout(() => setSuccess(''), 2000)
    }
  }

  if (!isOpen) return null

  return (
    <motion.div
      className="fixed inset-0 modal-backdrop flex items-center justify-center z-50"
      style={{
        backdropFilter: 'blur(8px)', // Alinhado com MyBusinessTab
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: 'rgba(0, 0, 0, 0.3)',
      }}
      data-testid="modal-create"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className={`p-6 rounded-xl shadow-lg max-w-md w-full ${
          theme === 'light' ? 'bg-white text-black' : 'bg-slate-700 text-gray-200'
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2 className="text-xl font-bold mb-4">{event ? 'Edit Event' : 'Create Event'}</h2>
        {error && (
          <div
            className={`mb-4 p-2 rounded-md ${
              theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-900 text-red-200'
            }`}
            data-testid="modal-error"
          >
            {error}
          </div>
        )}
        {success && (
          <div
            className={`mb-4 p-2 rounded-md ${
              theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-200'
            }`}
            data-testid="modal-success"
          >
            {success}
          </div>
        )}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Start</label>
            <input
              type="datetime-local"
              value={start}
              onChange={(e) => setStart(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-start"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">End</label>
            <input
              type="datetime-local"
              value={end}
              onChange={(e) => setEnd(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-end"
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as 'Low' | 'Medium' | 'High')}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-priority"
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Project</label>
            <select
              value={projectId || ''}
              onChange={(e) => setProjectId(e.target.value || null)}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-project"
            >
              <option value="">None</option>
              {businesses.flatMap((b) =>
                b.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {`${b.name} - ${p.name}`}
                  </option>
                ))
              )}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                theme === 'light' ? 'border-gray-300 bg-white' : 'border-slate-500 bg-slate-600'
              }`}
              data-testid="modal-description"
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <motion.button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-xl font-bold ${
              theme === 'light' ? 'bg-blue-600 hover:bg-blue-700 text-white' : 'bg-blue-700 hover:bg-blue-800 text-gray-100'
            } transition-colors`}
            data-testid="modal-save"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Save
          </motion.button>
          {event && (
            <motion.button
              onClick={handleDelete}
              className={`px-4 py-2 rounded-xl font-bold ${
                theme === 'light' ? 'bg-red-600 hover:bg-red-700 text-white' : 'bg-red-700 hover:bg-red-800 text-gray-100'
              } transition-colors`}
              data-testid="modal-delete"
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              Delete
            </motion.button>
          )}
          <motion.button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl ${
              theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-black' : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
            } transition-colors`}
            data-testid="modal-cancel"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Cancel
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  )
}