'use client'

import { Dialog } from '@headlessui/react'
import { X } from 'lucide-react'
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
}

const NewTaskModal: React.FC<NewTaskModalProps> = ({ isOpen, onClose, onCreate }) => {
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState<Task['status']>('To Do')
  const [dueDate, setDueDate] = useState('')
  const [priority, setPriority] = useState<Task['priority']>('Medium')

  const handleSubmit = () => {
    if (title.trim()) {
      onCreate({
        id: Date.now(),
        title: title.trim(),
        status,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: dueDate || new Date().toISOString().split('T')[0],
        priority,
        isCompleted: status === 'Done',
      })
      setTitle('')
      setStatus('To Do')
      setDueDate('')
      setPriority('Medium')
      onClose()
    }
  }

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
      <div className="bg-white rounded-2xl p-6 w-full max-w-md z-50 relative shadow-xl">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-black"
          onClick={onClose}
        >
          <X size={20} />
        </button>

        <Dialog.Title className="text-xl font-bold mb-4">New Task</Dialog.Title>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Task Title</label>
          <input
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            placeholder="e.g. Buy coffee"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Status</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            value={status}
            onChange={(e) => setStatus(e.target.value as Task['status'])}
          >
            <option value="To Do">To Do</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Due Date</label>
          <input
            type="date"
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select
            className="w-full border border-gray-300 rounded-xl px-3 py-2"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Task['priority'])}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </div>

        <button
          className="bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition w-full"
          onClick={handleSubmit}
        >
          Create Task
        </button>
      </div>
    </Dialog>
  )
}

export default NewTaskModal