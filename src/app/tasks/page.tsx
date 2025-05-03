'use client'

import { useState, useEffect } from 'react'
import { Plus } from 'lucide-react'
import { useTheme } from '../themeContext'
import SideNavbar from '../components/navbars/SideNavbar'
import ProjectSelector from '../components/tasks/ProjectSelector'
import TaskCard from '../components/tasks/TaskCard'
import NewProjectModal from '../components/tasks/NewProjectModal'
import NewTaskModal from '../components/tasks/NewTaskModal'
import Navbar from '../components/navbars/Navbar'

export type Task = {
  id: number
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  createdDate: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  isCompleted: boolean
  position?: { x: number; y: number };
  category?: "Work" | "Personal" | "Study" | "Other"
}

export type Corner = {
  id: number
  title: string
  tasks: Task[]
}

const TasksPage = () => {
  const { theme, toggleTheme } = useTheme()

  const [corners, setCorners] = useState<Corner[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('corners')
      return saved
        ? JSON.parse(saved)
        : []
    }
    return []
  })
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false)
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false)
  const [selectedCornerId, setSelectedCornerId] = useState<number | null>(corners[0]?.id || null)
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('corners', JSON.stringify(corners))
      if (corners.length > 0 && !selectedCornerId) {
        setSelectedCornerId(corners[0].id)
      }
    }
  }, [corners, selectedCornerId])

  const handleCreateCorner = (title: string, tasks: string[]) => {
    const newId = corners.length + 1
    const newCorner = {
      id: newId,
      title,
      tasks: tasks.map((title, index) => ({
        id: Date.now() + index,
        title,
        status: 'To Do' as const,
        createdDate: new Date().toISOString().split('T')[0],
        dueDate: new Date().toISOString().split('T')[0],
        priority: 'Medium' as const,
        isCompleted: false,
      })),
    }
    setCorners([...corners, newCorner])
    setSelectedCornerId(newId)
  }

  const handleCreateTask = (task: Task) => {
    if (!selectedCornerId) return
    setCorners((prev) =>
      prev.map((corner) =>
        corner.id === selectedCornerId
          ? { ...corner, tasks: [...corner.tasks, task] }
          : corner
      )
    )
  }

  const handleTaskToggle = (taskId: number, isCompleted: boolean) => {
    if (!selectedCornerId) return
    setCorners((prev) =>
      prev.map((corner) =>
        corner.id === selectedCornerId
          ? {
            ...corner,
            tasks: corner.tasks.map((task) =>
              task.id === taskId
                ? { ...task, isCompleted, status: isCompleted ? 'Done' : 'To Do' }
                : task
            ),
          }
          : corner
      )
    )
  }

  const handleTaskUpdate = (taskId: number, updates: Partial<Task>) => {
    if (!selectedCornerId) return
    setCorners((prev) =>
      prev.map((corner) =>
        corner.id === selectedCornerId
          ? {
            ...corner,
            tasks: corner.tasks.map((task) =>
              task.id === taskId ? { ...task, ...updates } : task
            ),
          }
          : corner
      )
    )
  }

  const handleTaskReorder = (cornerId: number, sourceIndex: number, destinationIndex: number) => {
    setCorners((prev) =>
      prev.map((corner) =>
        corner.id === cornerId
          ? {
            ...corner,
            tasks: reorderTasks(corner.tasks, sourceIndex, destinationIndex),
          }
          : corner
      )
    )
  }

  const reorderTasks = (tasks: Task[], sourceIndex: number, destinationIndex: number) => {
    const result = Array.from(tasks)
    const [removed] = result.splice(sourceIndex, 1)
    result.splice(destinationIndex, 0, removed)
    return result
  }

  const selectedCorner = corners.find((corner) => corner.id === selectedCornerId)
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <main
      className={`flex h-screen w-full ${theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'
        } transition-colors duration-300 relative`}
    >
      <Navbar
        themeButton={true}
        showToggleSidebarButton={true}
        isSidebarOpen={isSidebarOpen}
        toggleSidebar={toggleSidebar}
      />
      <SideNavbar
        theme={theme}
        toggleTheme={toggleTheme}
        isOpen={isSidebarOpen}
        setIsOpen={setIsSidebarOpen}
        isVisible={isSidebarOpen}
      />
      <div className="flex-1 overflow-y-auto p-6 pt-20 lg:ml-[260px]">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-semibold">My Tasks</h1>
          <button
            onClick={() => setIsProjectModalOpen(true)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl transition ${theme === 'light'
              ? 'bg-black text-white hover:bg-neutral-800'
              : 'bg-slate-900 text-gray-200 hover:bg-slate-700'
              }`}
          >
            <Plus size={16} />
            New Corner
          </button>
        </div>

        <div className="mb-6">
          <ProjectSelector
            corners={corners}
            selectedCornerId={selectedCornerId}
            onSelect={setSelectedCornerId}
            theme={theme}
          />
        </div>

        <div className="grid gap-4">
          {selectedCorner ? (
            <TaskCard
              corner={selectedCorner}
              onNewTaskClick={() => setIsTaskModalOpen(true)}
              onTaskToggle={handleTaskToggle}
              onTaskUpdate={handleTaskUpdate}
              onTaskReorder={handleTaskReorder}
              theme={theme}
            />
          ) : (
            <div className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'}>
              Select a Corner to view its tasks.
            </div>
          )}
        </div>
      </div>

      <NewProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
        onCreate={handleCreateCorner}
        theme={theme}
      />
      <NewTaskModal
        isOpen={isTaskModalOpen}
        onClose={() => setIsTaskModalOpen(false)}
        onCreate={handleCreateTask}
        theme={theme}
      />
    </main>
  );
}

export default TasksPage