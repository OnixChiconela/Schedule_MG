'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'
import toast from 'react-hot-toast'

interface Event {
  id?: number
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
  onDelete?: (id: number) => void
  event: Event | null
  slot: { start: Date; end: Date } | null
  theme: 'light' | 'dark'
  businesses: Business[]
}

const buttonVariants = {
  hover: { scale: 1.05, transition: { duration: 0.2 } },
  tap: { scale: 0.95 },
}

export default function EventModal({
  isOpen,
  onClose,
  onSave,
  onDelete,
  event,
  slot,
  theme,
  businesses,
}: EventModalProps) {
  const [formData, setFormData] = useState<Omit<Event, 'id'> & { id?: number }>({
    id: event?.id,
    title: event?.title || '',
    start: event?.start || slot?.start || new Date(),
    end: event?.end || slot?.end || new Date(),
    priority: event?.priority || 'Low',
    description: event?.description || '',
    businessId: event?.businessId || '',
    projectId: event?.projectId || '',
  })
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(event?.businessId || '')

  if (!isOpen) return null

  const handleSave = () => {
    if (!formData.title.trim()) {
      toast.error('O título é obrigatório.')
      return
    }
    if (formData.start >= formData.end) {
      toast.error('A data de início deve ser anterior à data de término.')
      return
    }
    const today = new Date()
    const startDate = new Date(formData.start.getFullYear(), formData.start.getMonth(), formData.start.getDate())
    const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    if (startDate.getTime() === todayDate.getTime() && formData.start < today) {
      toast.error('Eventos no dia atual devem começar no futuro.')
      return
    }
    console.log('EventModal: Saving event', formData)
    onSave(formData)
  }

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        theme === 'light' ? 'bg-gray-100/50' : 'bg-slate-800/50'
      }`}
      style={{
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className={`p-6 rounded-xl shadow-md w-full max-w-md ${
          theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
        }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`}
        >
          {formData.id ? 'Edit Event' : 'New Event'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Event Title"
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <input
            type="datetime-local"
            value={formData.start.toISOString().slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <input
            type="datetime-local"
            value={formData.end.toISOString().slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })
            }
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={4}
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <select
            value={selectedBusinessId}
            onChange={(e) => {
              setSelectedBusinessId(e.target.value)
              setFormData({ ...formData, businessId: e.target.value, projectId: '' })
            }}
            className={`w-full p-3 rounded-lg border ${
              theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select Business</option>
            {businesses.map((b) => (
              <option key={b.id} value={b.id}>
                {b.name}
              </option>
            ))}
          </select>
          {selectedBusinessId && (
            <select
              value={formData.projectId || ''}
              onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
              className={`w-full p-3 rounded-lg border ${
                theme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select Project</option>
              {businesses
                .find((b) => b.id === selectedBusinessId)
                ?.projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
            </select>
          )}
          <div className="flex space-x-2">
            <motion.button
              onClick={handleSave}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                theme === 'light'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={!formData.title.trim()}
            >
              Save
            </motion.button>
            <motion.button
              onClick={() => {
                console.log('Clicked Cancel Event')
                onClose()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                theme === 'light'
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
              }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cancel
            </motion.button>
            {formData.id && onDelete && (
              <motion.button
                onClick={() => {
                  console.log('Clicked Delete Event')
                  onDelete(formData.id!)
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                  theme === 'light'
                    ? 'bg-red-500 hover:bg-red-600 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-gray-100'
                }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Delete
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}