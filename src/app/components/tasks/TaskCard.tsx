'use client'

import { GripVertical, MoreHorizontal, Plus, Trash2 } from 'lucide-react'
import { useState, useCallback, useRef, useMemo } from 'react'
import { DndContext, DragOverlay, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableTask from './SortableTask'
import { format, parseISO } from 'date-fns'

type Task = {
  id: number
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  createdDate: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  isCompleted: boolean
}

type Corner = {
  id: number
  title: string
  tasks: Task[]
}

interface TaskCardProps {
  corner: Corner
  onNewTaskClick: () => void
  onTaskToggle: (taskId: number, isCompleted: boolean) => void
  onTaskUpdate: (taskId: number, updates: Partial<Task>) => void
  onTaskReorder: (cornerId: number, sourceIndex: number, destinationIndex: number) => void
  onTaskDelete: (taskIds: number[]) => void;
  theme: 'light' | 'dark'
}

export default function TaskCard({
  corner,
  onNewTaskClick,
  onTaskToggle,
  onTaskUpdate,
  onTaskReorder,
  onTaskDelete,
  theme,
}: TaskCardProps) {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<keyof Task | null>(null)
  const [editValues, setEditValues] = useState<Partial<Task>>({})
  const editValuesRef = useRef<Partial<Task>>(editValues)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [selectedTasks, setSelectedTasks] = useState<number[]>([])
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const startEditing = useCallback((taskId: number, field: keyof Task, value: string) => {
    setEditingTaskId(taskId)
    setEditingField(field)
    setEditValues({ [field]: value })
    editValuesRef.current = { [field]: value }
  }, [])

  const handleEditChange = useCallback((field: keyof Task, value: string) => {
    setEditValues((prev) => {
      const newValues = { ...prev, [field]: value }
      editValuesRef.current = newValues
      console.log(`TaskCard: After change, editValues=${JSON.stringify(newValues)}`)
      return newValues
    })
  }, [])

  const submitEdit = useCallback((taskId: number, currentEditValues: Partial<Task>) => {
    const updates: Partial<Task> = {}
    if (currentEditValues.title && currentEditValues.title.trim()) {
      updates.title = currentEditValues.title.trim()
    }
    if (currentEditValues.status) {
      updates.status = currentEditValues.status as Task['status']
      updates.isCompleted = currentEditValues.status === 'Done'
    }
    if (currentEditValues.dueDate) {
      updates.dueDate = currentEditValues.dueDate
    }
    if (currentEditValues.priority) {
      updates.priority = currentEditValues.priority as Task['priority']
    }

    if (Object.keys(updates).length > 0) {
      onTaskUpdate(taskId, updates)
    }

    setEditingTaskId(null)
    setEditingField(null)
    setEditValues({})
    editValuesRef.current = {}
  }, [onTaskUpdate])

  const handleDragStart = useCallback((event: any) => {
    const task = corner.tasks.find((t) => t.id === event.active.id)
    setActiveTask(task || null)
  }, [corner.tasks])

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) {
      setActiveTask(null)
      return
    }

    const tasks = corner.tasks
    const sourceIndex = tasks.findIndex((task) => task.id === active.id)
    const destinationIndex = tasks.findIndex((task) => task.id === over.id)

    if (sourceIndex !== destinationIndex) {
      onTaskReorder(corner.id, sourceIndex, destinationIndex)
    }
    setActiveTask(null)
  }, [corner.tasks, onTaskReorder])

  //-------------------------
  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM, yyyy')
    } catch {
      return date
    }
  }

  const getStatusStyles = useMemo(
    () => (status: Task['status']) => {
      switch (status) {
        case 'To Do':
          return theme === 'light' ? 'bg-blue-100 text-blue-700' : 'bg-blue-900 text-blue-200'
        case 'In Progress':
          return theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-900 text-yellow-200'
        case 'Done':
          return theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-200'
        default:
          return ''
      }
    },
    [theme]
  )

  const getPriorityStyles = useMemo(
    () => (priority: Task['priority']) => {
      switch (priority) {
        case 'High':
          return theme === 'light' ? 'bg-red-100 text-red-700' : 'bg-red-900 text-red-200'
        case 'Medium':
          return theme === 'light' ? 'bg-yellow-100 text-yellow-700' : 'bg-yellow-900 text-yellow-200'
        case 'Low':
          return theme === 'light' ? 'bg-green-100 text-green-700' : 'bg-green-900 text-green-200'
        default:
          return ''
      }
    },
    [theme]
  )

  return (
    <div className={`w-full rounded-2xl shadow-md p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-700'} transition-colors duration-300`}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{corner.title}</h2>
        <div className='flex gap-2'>

          <button
            onClick={onNewTaskClick}
            className={`flex items-center gap-2 px-3 py-1 rounded-xl transition ${theme === 'light' ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-slate-600 text-gray-200 hover:bg-slate-500'}`}
            data-testid="new-task"
          >
            <Plus size={14} />
            New Task
          </button>
          <button
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className={`p-1 rounded-full ${theme === 'light' ? 'text-gray-600 hover:bg-gray-200' : 'text-gray-300 hover:bg-slate-500'} transition-all duration-150`}
          >
            <MoreHorizontal size={16} />
          </button>
          {/*Menu */}
          {isMenuOpen && (
            <div className={`absolute top-64 right-10 p-2 rounded-lg shadow-md ${theme === "light" ? "bg-white" : "bg-slate-700"} z-20`}>
              <button
                onClick={() => {
                  if (selectedTasks.length > 0) {
                    onTaskDelete(selectedTasks);
                    setSelectedTasks([]);
                    setIsMenuOpen(false);
                  }
                }}
                disabled={selectedTasks.length === 0}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-sm ${selectedTasks.length === 0
                  ? "text-gray-400 cursor-not-allowed"
                  : theme === "light"
                    ? "text-red-600 hover:bg-gray-100"
                    : "text-red-400 hover:bg-slate-600"
                  }`}
              >
                <Trash2 size={14} />
                Remove
              </button>
            </div>
          )}
        </div>
      </div>
      <DndContext collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <SortableContext items={corner.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="overflow-x-auto relative z-10">
            <div className="min-w-[1000px]">
              {corner.tasks.length === 0 ? (
                <div className={theme === 'light' ? 'text-gray-400' : 'text-gray-500'}>No tasks yet.</div>
              ) : (
                <div
                  className={`grid grid-cols-7 gap-2 text-sm font-semibold rounded-xl p-2 mb-2 ${theme === "light" ? "text-gray-600 bg-gray-50" : "text-gray-300 bg-slate-600"
                    }`}
                >
                  <div>Drag</div>
                  <div>Completed</div>
                  <div>Title</div>
                  <div>Status</div>
                  <div>Created</div>
                  <div>Due</div>
                  <div>Priority</div>
                </div>
              )}
              {corner.tasks.map((task, index) => (
                <div
                  key={task.id}
                  className="flex flex-col py-1 max-h-[60px]" // Removido overflow-hidden temporariamente
                >
                  <SortableTask
                    task={task}
                    index={index}
                    editingTaskId={editingTaskId}
                    editingField={editingField}
                    editValues={editValues}
                    startEditing={startEditing}
                    handleEditChange={handleEditChange}
                    submitEdit={(taskId: number) => submitEdit(taskId, editValuesRef.current)}
                    onTaskToggle={onTaskToggle}
                    isMenuOpen={isMenuOpen} // Passa se o menu está aberto
                    selectedTasks={selectedTasks} // Passa as tarefas selecionadas
                    onTaskSelect={(taskId: number) =>
                      setSelectedTasks((prev) =>
                        prev.includes(taskId)
                          ? prev.filter((id) => id !== taskId)
                          : [...prev, taskId]
                      )
                    }
                    theme={theme}
                  />
                </div>
              ))}
            </div>
          </div>
        </SortableContext>
        <DragOverlay>
          {activeTask ? (
            <div
              className={`grid grid-cols-7 gap-2 items-center rounded-xl p-2 text-sm ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-600'} opacity-80`}
            >
              <div className="cursor-grab">
                <GripVertical size={16} className={theme === 'light' ? 'text-gray-500' : 'text-gray-400'} />
              </div>
              <div>
                <input
                  type="checkbox"
                  checked={activeTask.isCompleted}
                  disabled
                  className={`h-4 w-4 rounded border-gray-300 ${theme === 'light' ? 'text-black' : 'text-gray-200'}`}
                />
              </div>
              <div>
                <span className="font-medium">{activeTask.title}</span>
              </div>
              <div>
                <span className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getStatusStyles(activeTask.status)}`}>
                  {activeTask.status}
                </span>
              </div>
              <div>{formatDate(activeTask.createdDate)}</div>
              <div>{formatDate(activeTask.dueDate)}</div>
              <div>
                <span className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getPriorityStyles(activeTask.priority)}`}>
                  {activeTask.priority}
                </span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    </div>
  )
}