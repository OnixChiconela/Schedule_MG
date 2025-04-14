"use client"

import { useState } from 'react'
import { Plus } from 'lucide-react'
import SideNavbar from '../components/navbars/SideNavbar'
import NewProjectModal from '../components/tasks/NewProjectModal'

type Corner = {
  id: number
  title: string
  tasks: string[]
}

const TasksPage = () => {
  const [corners, setCorners] = useState<Corner[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleCreateCorner = (title: string, tasks: string[]) => {
    const newId = corners.length + 1
    setCorners([...corners, { id: newId, title, tasks }])
  }

  return (
    <main className="flex h-screen w-full">
      <SideNavbar />
      <div className="flex-1 overflow-y-auto p-6 ml-[260px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition"
          >
            <Plus size={16} />
            New Corner
          </button>
        </div>

        <div className="grid gap-4">
          {corners.map((corner) => (
            <div
              key={corner.id}
              className="bg-white rounded-2xl shadow-md p-4"
            >
              <h2 className="text-lg font-bold mb-2">{corner.title}</h2>
              <ul className="space-y-2">
                {corner.tasks.length === 0 ? (
                  <li className="text-sm text-gray-400">No tasks yet.</li>
                ) : (
                  corner.tasks.map((task, i) => (
                    <li key={i} className="bg-gray-100 rounded-xl p-3">{task}</li>
                  ))
                )}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <NewProjectModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onCreate={handleCreateCorner}
      />
    </main>
  )
}
export default TasksPage