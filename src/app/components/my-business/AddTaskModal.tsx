'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (taskData: {
    title: string
    description?: string
    status: 'To Do' | 'In Progress' | 'Done'
    dueDate: string
  }) => void
  theme: 'light' | 'dark'
}

export default function AddTaskModal({
  isOpen,
  onClose,
  onSave,
  theme,
}: AddTaskModalProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [status, setStatus] = useState<'To Do' | 'In Progress' | 'Done'>('To Do')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  console.log('Rendering AddTaskModal, isOpen:', isOpen, 'theme:', theme)

  const handleSave = () => {
    if (!title.trim()) {
      console.warn('AddTaskModal: Title is empty')
      return
    }
    const taskData = { title, description, status, dueDate }
    console.log('AddTaskModal: Saving task:', taskData)
    onSave(taskData)
    setTitle('')
    setDescription('')
    setStatus('To Do')
    setDueDate(new Date().toISOString().split('T')[0])
    onClose()
  }

  const safeTheme = theme || 'light'

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${
        safeTheme === 'light' ? 'bg-gray-100/50' : 'bg-slate-800/50'
      }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Clicked outside AddTaskModal, closing')
          onClose()
        }
      }}
    >
      <motion.div
        className={`p-8 rounded-2xl shadow-xl max-w-lg w-full ${
          safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-slate-600'
        }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.8, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${
            safeTheme === 'light' ? 'text-gray-900' : 'text-white'
          }`}
        >
          Add New Task
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium ${
                safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
              }`}
            >
              Task Title
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                safeTheme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter task title"
            />
            {!title.trim() && (
              <p
                className={`text-sm mt-1 ${
                  safeTheme === 'light' ? 'text-red-600' : 'text-red-400'
                }`}
              >
                Task title is required
              </p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
              }`}
            >
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                safeTheme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Enter task description"
              rows={4}
            />
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
              }`}
            >
              Status
            </label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as 'To Do' | 'In Progress' | 'Done')}
              className={`mt-1 p-2 w-full rounded-md border ${
                safeTheme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${
                safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
              }`}
            >
              Due Date
            </label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${
                safeTheme === 'light'
                  ? 'border-gray-300 bg-white text-gray-900'
                  : 'border-slate-600 bg-slate-800 text-gray-200'
              } focus:outline-none focus:ring-2 focus:ring-blue-500`}
            />
          </div>
          <div className="flex space-x-2">
            <motion.button
              onClick={() => {
                console.log('Clicked Save (AddTaskModal)')
                handleSave()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                safeTheme === 'light'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!title.trim()}
            >
              Save
            </motion.button>
            <motion.button
              onClick={() => {
                console.log('Clicked Cancel (AddTaskModal)')
                onClose()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                safeTheme === 'light'
                  ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                  : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}