'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { toast } from 'react-hot-toast'
import { Event, Business } from "@/app/types/events"
import { BiMemoryCard } from 'react-icons/bi'
import { Trash } from 'lucide-react'

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

const categories = ['Technology', 'Art', 'Finance', 'Education', 'Health', 'Travel', 'Music']

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
    end: event?.end || slot?.end || new Date(new Date().getTime() + 60 * 60 * 1000),
    priority: event?.priority || 'Low',
    description: event?.description || '',
    businessId: event?.businessId || '',
    projectId: event?.projectId || '',
    tags: event?.tags || [],
  })
  const [selectedBusinessId, setSelectedBusinessId] = useState<string>(event?.businessId || '')

  useEffect(() => {
    console.log('EventModal: Updating formData', { event, slot })
    setFormData({
      id: event?.id,
      title: event?.title || '',
      start: event?.start || slot?.start || new Date(),
      end: event?.end || slot?.end || new Date(new Date().getTime() + 60 * 60 * 1000),
      priority: event?.priority || 'Low',
      description: event?.description || '',
      businessId: event?.businessId || '',
      projectId: event?.projectId || '',
      tags: event?.tags || [],
    })
    setSelectedBusinessId(event?.businessId || '')
  }, [event, slot])

  const today = new Date()
  const minDateTime = event?.id
    ? undefined
    : new Date(today.getFullYear(), today.getMonth(), today.getDate())
      .toISOString()
      .slice(0, 16)

  const handleTagToggle = (tag: string) => {
    setFormData((prev) => ({
      ...prev,
      tags: prev.tags.includes(tag)
        ? prev.tags.filter((t) => t !== tag)
        : [...prev.tags, tag],
    }))
  }

  const handleSave = () => {
    console.log('EventModal: Attempting to save', formData)
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
    if (!formData.id && startDate < todayDate) {
      toast.error('Não é possível agendar em datas passadas.')
      return
    }
    if (!formData.id && startDate.getTime() === todayDate.getTime() && formData.start < today) {
      toast.error('Eventos no dia atual devem começar no futuro.')
      return
    }
    console.log('EventModal: Saving event', formData)
    onSave(formData)
  }

  if (!isOpen) return null

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${theme === 'light' ? 'bg-gray-100/50' : 'bg-slate-800/50'
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
        className={`p-6 rounded-xl shadow-md w-full max-w-md ${theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
          }`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h2
          className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
        >
          {formData.id ? 'Edit event' : 'New event'}
        </h2>
        <div className="space-y-4">
          <input
            type="text"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="Event title"
            className={`w-full p-3 rounded-lg border ${theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <input
            type="datetime-local"
            value={formData.start.toISOString().slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, start: new Date(e.target.value) })}
            min={minDateTime}
            className={`w-full p-3 rounded-lg border ${theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <input
            type="datetime-local"
            value={formData.end.toISOString().slice(0, 16)}
            onChange={(e) => setFormData({ ...formData, end: new Date(e.target.value) })}
            min={minDateTime}
            className={`w-full p-3 rounded-lg border ${theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          />
          <select
            value={formData.priority}
            onChange={(e) =>
              setFormData({ ...formData, priority: e.target.value as 'Low' | 'Medium' | 'High' })
            }
            className={`w-full p-3 rounded-lg border ${theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <div className="space-y-2">
            <label className={`text-sm ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
              Categories:
            </label>
            <div className="flex flex-wrap gap-2">
              {categories.map((tag) => (
                <button
                  key={tag}
                  onClick={() => handleTagToggle(tag)}
                  className={`px-2 py-1 rounded-lg border-2 bg-transparent ${formData.tags.includes(tag)
                      ? 'border-fuchsia-600 text-gray-900'
                      : 'border-gray-200 dark:border-slate-600 text-gray-900 dark:text-gray-200'
                    }`}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>
          <textarea
            value={formData.description || ''}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Description"
            rows={4}
            className={`w-full p-3 rounded-lg border ${theme === 'light'
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
            className={`w-full p-3 rounded-lg border ${theme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
          >
            <option value="">Select business</option>
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
              className={`w-full p-3 rounded-lg border ${theme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="">Select project</option>
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
              className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center ${theme === 'light'
                  ? 'bg-fuchsia-700 hover:bg-fuchsia-800 text-white'
                  : 'bg-fuchsia-800 hover:bg-fuchsia-900 text-gray-100'
                }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
              disabled={!formData.title.trim()}
            >
              <BiMemoryCard size={17} />
              Save
            </motion.button>
            <motion.button
              onClick={() => {
                console.log('Clicked Cancel Event')
                onClose()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${theme === 'light'
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
                }`}
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              Cancelar
            </motion.button>
            {formData.id && onDelete && (
              <motion.button
                onClick={() => {
                  console.log('Clicked Delete Event, ID:', formData.id)
                  if (formData.id) {
                    onDelete(formData.id)
                  } else {
                    toast.error('Erro: ID do evento inválido.')
                  }
                }}
                className={`px-4 py-2 rounded-xl font-semibold transition-colors flex items-center ${theme === 'light'
                    ? 'bg-red-700 hover:bg-red-800 text-white'
                    : 'bg-red-700 hover:bg-red-800 text-gray-100'
                  }`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                <Trash size={17} />
                Delete
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}