'use client'

import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
import { useState, useEffect } from 'react'

interface NewProjectModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (title: string, tasks: string[]) => void
  theme: 'light' | 'dark'
}

const NewProjectModal: React.FC<NewProjectModalProps> = ({ isOpen, onClose, onCreate, theme }) => {
  console.log(`NewProjectModal: Theme applied ${theme}`)
  const [title, setTitle] = useState('')
  const [tasksText, setTasksText] = useState('')
  const [isPristine, setIsPristine] = useState(true)

  useEffect(() => {
    if (isOpen) {
      setTitle('')
      setTasksText('')
      setIsPristine(true)
    }
  }, [isOpen])

  const handleSubmit = () => {
    const tasks = tasksText
      .split('\n')
      .map((task) => task.replace(/^•\s*/, '').trim())
      .filter((task) => task.length > 0)

    if (title.trim()) {
      console.log(`NewProjectModal: Creating corner "${title}" with tasks`, tasks)
      onCreate(title.trim(), tasks)
      setTitle('')
      setTasksText('')
      setIsPristine(true)
      onClose()
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const cursorPosition = e.currentTarget.selectionStart
      const textBeforeCursor = tasksText.slice(0, cursorPosition)
      const textAfterCursor = tasksText.slice(cursorPosition)
      const newText = `${textBeforeCursor}\n• ${textAfterCursor}`
      setTasksText(newText)
      setIsPristine(false)

      setTimeout(() => {
        const textarea = e.currentTarget
        textarea.selectionStart = textarea.selectionEnd = cursorPosition + 3
      }, 0)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setTasksText(e.target.value)
    setIsPristine(false)
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div
        className={`rounded-2xl p-6 w-full max-w-md z-50 relative shadow-xl ${
          theme === 'light' ? 'bg-white text-black' : 'bg-slate-700 text-gray-200'
        } transition-colors duration-300`}
      >
        <button
          className={`absolute top-3 right-3 ${
            theme === 'light' ? 'text-gray-500 hover:text-black' : 'text-gray-400 hover:text-gray-200'
          } transition-colors`}
          onClick={onClose}
          data-testid="modal-close"
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-4">Create New Corner</Dialog.Title>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Corner Title</label>
          <input
            className={`w-full border rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
            }`}
            placeholder="e.g. Cozy Morning"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Tasks (one per line)</label>
          <textarea
            className={`w-full border rounded-xl px-3 py-2 h-24 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
            }`}
            placeholder="• Task 1\n• Task 2"
            value={isPristine && tasksText === '' ? '' : tasksText}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onFocus={() => {
              if (isPristine && tasksText === '') {
                setTasksText('• ')
              }
            }}
          />
        </div>

        <button
          className={`w-full px-4 py-2 rounded-xl transition ${
            theme === 'light' ? 'bg-black text-white hover:bg-neutral-800' : 'bg-slate-900 text-gray-200 hover:bg-slate-700'
          }`}
          onClick={handleSubmit}
          data-testid="modal-create"
        >
          Create
        </button>
      </div>
    </Dialog>
  )
}

export default NewProjectModal