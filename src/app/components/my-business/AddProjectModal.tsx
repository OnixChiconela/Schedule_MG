'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'

interface AddProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (name: string, description: string) => void
  theme: 'light' | 'dark'
}

export default function AddProjectModal({
  isOpen,
  onClose,
  onSave,
  theme,
}: AddProjectModalProps) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  console.log('Rendering AddProjectModal, isOpen:', isOpen, 'theme:', theme)

  const handleSave = () => {
    if (!name.trim()) {
      console.warn('AddProjectModal: Name is empty')
      return
    }
    console.log('AddProjectModal: Saving project:', { name, description })
    onSave(name, description)
    setName('')
    setDescription('')
    onClose()
  }

  const safeTheme = theme || 'light'

  return (
    <motion.div
      className={`fixed inset-0 flex items-center justify-center z-50 ${safeTheme === 'light' ? 'bg-gray-100/50' : 'bg-slate-800/50'
        }`}
      initial={{ opacity: 0 }}
      animate={{ opacity: isOpen ? 1 : 0 }}
      transition={{ duration: 0.3 }}
      style={{ pointerEvents: isOpen ? 'auto' : 'none' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          console.log('Clicked outside AddProjectModal, closing')
          onClose()
        }
      }}
    >
      <motion.div
        className={`p-8 rounded-2xl shadow-xl max-w-lg w-full ${safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-slate-600'
          }`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: isOpen ? 1 : 0.8, opacity: isOpen ? 1 : 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <h3
          className={`text-lg font-semibold mb-4 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'
            }`}
        >
          Add New Project
        </h3>
        <div className="space-y-4">
          <div>
            <label
              className={`block text-sm font-medium ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                }`}
            >
              Project Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${safeTheme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
            } focus:outline-none focus:ring-2 focus:ring-neutral-700`}
              placeholder="Enter project name"
            />
            {!name.trim() && (
              <p
                className={`text-sm mt-1 ${safeTheme === 'light' ? 'text-red-600' : 'text-red-400'
                  }`}
              >
                Project name is required
              </p>
            )}
          </div>
          <div>
            <label
              className={`block text-sm font-medium ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                }`}
            >
              Description (Optional)
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className={`mt-1 p-2 w-full rounded-md border ${safeTheme === 'light'
                ? 'border-gray-300 bg-white text-gray-900'
                : 'border-slate-600 bg-slate-800 text-gray-200'
                } focus:outline-none focus:ring-2 focus:ring-neutral-700`}
              placeholder="Enter project description"
              rows={4}
            />
          </div>
          <div className="flex space-x-2 justify-end">
            <motion.button
              onClick={() => {
                console.log('Clicked Cancel (AddProjectModal)')
                onClose()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === 'light'
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Cancel
            </motion.button>
            <motion.button
              onClick={() => {
                console.log('Clicked Save (AddProjectModal)')
                handleSave()
              }}
              className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === 'light'
                ? 'bg-neutral-900 hover:bg-black text-white'
                : 'bg-neutral-900 hover:bg-black text-gray-100'
                }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              disabled={!name.trim()}
            >
              Save
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}