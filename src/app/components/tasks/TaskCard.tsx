'use client'

import { Plus } from 'lucide-react'
import { useState, useCallback, useRef } from 'react'
import { DndContext, closestCenter } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import SortableTask from './SortableTask'

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
}

const TaskCard: React.FC<TaskCardProps> = ({
  corner,
  onNewTaskClick,
  onTaskToggle,
  onTaskUpdate,
  onTaskReorder,
}) => {
  const [editingTaskId, setEditingTaskId] = useState<number | null>(null)
  const [editingField, setEditingField] = useState<keyof Task | null>(null)
  const [editValues, setEditValues] = useState<Partial<Task>>({})
  const editValuesRef = useRef<Partial<Task>>(editValues)

  const startEditing = useCallback((taskId: number, field: keyof Task, value: string) => {
    console.log(`TaskCard: Starting edit for task ${taskId}, field ${field}`)
    setEditingTaskId(taskId)
    setEditingField(field)
    setEditValues({ [field]: value })
    editValuesRef.current = { [field]: value }
  }, [])

  const handleEditChange = useCallback((field: keyof Task, value: string) => {
    console.log(`TaskCard: Before change, editValues=${JSON.stringify(editValuesRef.current)}`)
    setEditValues((prev) => {
      const newValues = { ...prev, [field]: value }
      editValuesRef.current = newValues
      console.log(`TaskCard: After change, editValues=${JSON.stringify(newValues)}`)
      return newValues
    })
  }, [])

  const submitEdit = useCallback((taskId: number, currentEditValues: Partial<Task>) => {
    console.log(`TaskCard: Submitting edit for task ${taskId}, editValues=${JSON.stringify(currentEditValues)}`)
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
      console.log(`TaskCard: Updating task ${taskId} with ${JSON.stringify(updates)}`)
      onTaskUpdate(taskId, updates)
    }

    setEditingTaskId(null)
    setEditingField(null)
    setEditValues({})
    editValuesRef.current = {}
  }, [onTaskUpdate])

  const handleDragEnd = useCallback((event: any) => {
    const { active, over } = event
    if (!over || active.id === over.id) return

    const tasks = corner.tasks
    const sourceIndex = tasks.findIndex((task) => task.id === active.id)
    const destinationIndex = tasks.findIndex((task) => task.id === over.id)

    if (sourceIndex !== destinationIndex) {
      onTaskReorder(corner.id, sourceIndex, destinationIndex)
    }
  }, [corner.tasks, onTaskReorder])

  return (
    <div className="bg-white rounded-2xl shadow-md p-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold">{corner.title}</h2>
        <button
          onClick={onNewTaskClick}
          className="flex items-center gap-2 bg-gray-200 text-black px-3 py-1 rounded-xl hover:bg-gray-300 transition"
        >
          <Plus size={14} />
          New Task
        </button>
      </div>
      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={corner.tasks.map((task) => task.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-2">
            {corner.tasks.length === 0 ? (
              <div className="text-sm text-gray-400">No tasks yet.</div>
            ) : (
              <div className="grid grid-cols-7 gap-2 text-sm font-semibold text-gray-600 bg-gray-50 rounded-xl p-2">
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
              <SortableTask
                key={task.id}
                task={task}
                index={index}
                editingTaskId={editingTaskId}
                editingField={editingField}
                editValues={editValues}
                startEditing={startEditing}
                handleEditChange={handleEditChange}
                submitEdit={(taskId: number) => submitEdit(taskId, editValuesRef.current)}
                onTaskToggle={onTaskToggle}
              />
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  )
}

export default TaskCard