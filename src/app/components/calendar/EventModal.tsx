'use client'

import { useState } from "react"

interface Event {
  id?: number
  title: string
  start: Date
  end: Date
  priority: 'Low' | 'Medium' | 'High'
  description?: string
}

interface EventModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (event: Event) => void
  onDelete?: (id: number) => void
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
  console.log(`EventModal: Theme applied ${theme}`)
  const [title, setTitle] = useState(event?.title || '')
  const [start, setStart] = useState(
    event?.start || slot?.start || new Date()
  )
  const [end, setEnd] = useState(
    event?.end || slot?.end || new Date()
  )
  const [priority, setPriority] = useState<Event['priority']>(
    event?.priority || 'Medium'
  )
  const [description, setDescription] = useState(event?.description || '')

  const handleSubmit = () => {
    if (title.trim()) {
      onSave({
        id: event?.id,
        title: title.trim(),
        start,
        end,
        priority,
        description: description.trim() || undefined,
      })
      console.log(`EventModal: Saving event "${title}"`)
      resetForm()
    }
  }

  const handleDelete = () => {
    if (event?.id && onDelete) {
      onDelete(event.id)
      resetForm()
    }
  }

  const resetForm = () => {
    setTitle('')
    setStart(new Date())
    setEnd(new Date())
    setPriority('Medium')
    setDescription('')
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`rounded-xl p-6 w-full max-w-md shadow-xl ${
          theme === 'light' ? 'bg-white text-black' : 'bg-slate-700 text-gray-200'
        } transition-colors duration-300`}
      >
        <h2 className="text-xl font-semibold mb-4">
          {event ? 'Edit Event' : 'New Event'}
        </h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-white border-gray-300'
                  : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
              placeholder="Event title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Start Date</label>
            <input
              type="datetime-local"
              value={start.toISOString().slice(0, 16)}
              onChange={(e) => setStart(new Date(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-white border-gray-300'
                  : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">End Date</label>
            <input
              type="datetime-local"
              value={end.toISOString().slice(0, 16)}
              onChange={(e) => setEnd(new Date(e.target.value))}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-white border-gray-300'
                  : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Event['priority'])}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-white border-gray-300'
                  : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light'
                  ? 'bg-white border-gray-300'
                  : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
              placeholder="Optional details"
              rows={4}
            />
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          {event && onDelete && (
            <button
              onClick={handleDelete}
              className={`px-4 py-2 rounded-md transition ${
                theme === 'light'
                  ? 'bg-red-500 text-white hover:bg-red-600'
                  : 'bg-red-600 text-gray-200 hover:bg-red-700'
              }`}
              data-testid="modal-delete"
            >
              Delete
            </button>
          )}
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition ${
              theme === 'light'
                ? 'bg-gray-200 text-black hover:bg-gray-300'
                : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
            }`}
            data-testid="modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md transition ${
              theme === 'light'
                ? 'bg-black text-white hover:bg-neutral-800'
                : 'bg-slate-900 text-gray-200 hover:bg-slate-700'
            }`}
            data-testid="modal-create"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  )
}