'use client'

import { useState } from 'react'

type Task = {
  id: number
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  createdDate: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  isCompleted: boolean
}

interface NewTaskModalProps {
  isOpen: boolean
  onClose: () => void
  onCreate: (task: Task) => void
  theme: 'light' | 'dark'
}

export default function NewTaskModal({ isOpen, onClose, onCreate, theme }: NewTaskModalProps) {
  console.log(`NewTaskModal: Theme applied ${theme}`)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<Task['status']>('To Do')
  const [dueDate, setDueDate] = useState(new Date().toISOString().split('T')[0])
  const [priority, setPriority] = useState<Task['priority']>('Medium')

  const handleSubmit = () => {
    if (title.trim()) {
      console.log(`NewTaskModal: Creating task "${title}"`)
      onCreate({
        id: Date.now(),
        title: title.trim(),
        status,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate,
        priority,
        isCompleted: status === 'Done',
      })
      setTitle('')
      setStatus('To Do')
      setDueDate(new Date().toISOString().split('T')[0])
      setPriority('Medium')
      onClose()
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div
        className={`rounded-xl p-6 w-full max-w-md shadow-xl ${
          theme === 'light' ? 'bg-white text-black' : 'bg-slate-700 text-gray-200'
        } transition-colors duration-300`}
      >
        <h2 className="text-xl font-semibold mb-4">New Task</h2>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
              placeholder="Task title"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as Task['status'])}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            >
              <option value="To Do">To Do</option>
              <option value="In Progress">In Progress</option>
              <option value="Done">Done</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Due Date</label>
            <input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Priority</label>
            <select
              value={priority}
              onChange={(e) => setPriority(e.target.value as Task['priority'])}
              className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                theme === 'light' ? 'bg-white border-gray-300 text-black' : 'bg-slate-700 border-slate-500 text-gray-200'
              }`}
            >
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
            </select>
          </div>
        </div>
        <div className="flex justify-end gap-2 mt-6">
          <button
            onClick={onClose}
            className={`px-4 py-2 rounded-md transition ${
              theme === 'light' ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
            }`}
            data-testid="modal-cancel"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className={`px-4 py-2 rounded-md transition ${
              theme === 'light' ? 'bg-black text-white hover:bg-neutral-800' : 'bg-slate-900 text-gray-200 hover:bg-slate-700'
            }`}
            data-testid="modal-create"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  )
}