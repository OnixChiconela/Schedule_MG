'use client'

import { useState, useEffect } from 'react'

interface Event {
  id: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
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

  useEffect(() => {
    if (event) {
      setTitle(event.title)
      setStart(event.start.toISOString().slice(0, 16))
      setEnd(event.end.toISOString().slice(0, 16))
      setPriority(event.priority)
      setDescription(event.description || '')
    } else if (slot) {
      setTitle('')
      setStart(slot.start.toISOString().slice(0, 16))
      setEnd(slot.end.toISOString().slice(0, 16))
      setPriority('Low')
      setDescription('')
    }
  }, [event, slot])

  const handleSubmit = () => {
    const eventData: Omit<Event, 'id'> & { id?: number } = {
      id: event?.id,
      title,
      start: new Date(start),
      end: new Date(end),
      priority,
      description: description || undefined,
    }
    onSave(eventData)
  }

  if (!isOpen) return null

  return (
    <div
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50`}
      data-testid="modal-create"
    >
      <div
        className={`p-6 rounded-xl shadow-lg max-w-md w-full ${
          theme === 'light' ? 'bg-white text-black' : 'bg-slate-700 text-gray-200'
        }`}
      >
        <h2 className="text-xl font-bold mb-4">{event ? 'Edit Event' : 'Create Event'}</h2>
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
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
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
            />
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-xl ${
              theme === 'light' ? 'bg-blue-500 text-white' : 'bg-blue-600 text-gray-200'
            }`}
          >
            Save
          </button>
          {event && (
            <button
              onClick={() => onDelete(event.id)}
              className={`px-4 py-2 rounded-xl ${
                theme === 'light' ? 'bg-red-500 text-white' : 'bg-red-600 text-gray-200'
              }`}
              data-testid="modal-delete"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-xl ${
              theme === 'light' ? 'bg-gray-200 text-black' : 'bg-slate-600 text-gray-200'
            }`}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  )
}