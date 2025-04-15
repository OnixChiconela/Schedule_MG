import { format, parseISO } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'

type Task = {
  id: number
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  createdDate: string
  dueDate: string
  priority: 'Low' | 'Medium' | 'High'
  isCompleted: boolean
}

interface SortableTaskProps {
  task: Task
  index: number
  editingTaskId: number | null
  editingField: keyof Task | null
  editValues: Partial<Task>
  startEditing: (taskId: number, field: keyof Task, value: string) => void
  handleEditChange: (field: keyof Task, value: string) => void
  submitEdit: (taskId: number) => void
  onTaskToggle: (taskId: number, isCompleted: boolean) => void
}

const SortableTask: React.FC<SortableTaskProps> = ({
  task,
  index,
  editingTaskId,
  editingField,
  editValues,
  startEditing,
  handleEditChange,
  submitEdit,
  onTaskToggle,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM, yyyy')
    } catch {
      return date
    }
  }

  const getStatusStyles = (status: Task['status']) => {
    switch (status) {
      case 'To Do':
        return 'bg-blue-100 text-blue-700'
      case 'In Progress':
        return 'bg-yellow-100 text-yellow-700'
      case 'Done':
        return 'bg-green-100 text-green-700'
      default:
        return ''
    }
  }

  const getPriorityStyles = (priority: Task['priority']) => {
    switch (priority) {
      case 'High':
        return 'bg-red-100 text-red-700'
      case 'Medium':
        return 'bg-yellow-100 text-yellow-700'
      case 'Low':
        return 'bg-green-100 text-green-700'
      default:
        return ''
    }
  }

  const handleEditClick = (e: React.MouseEvent, field: keyof Task, value: string) => {
    startEditing(task.id, field, value)
  }

  const handleOptionSelect = (field: keyof Task, value: string) => {
    console.log(`Selecting ${field}: ${value}`) // Debug
    handleEditChange(field, value)
    submitEdit(task.id)
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="grid grid-cols-7 gap-2 items-center bg-gray-100 rounded-xl p-2 text-sm"
    >
      <div {...attributes} {...listeners} className="cursor-grab">
        <GripVertical size={16} className="text-gray-500" />
      </div>
      <div>
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={(e) => onTaskToggle(task.id, e.target.checked)}
          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
        />
      </div>
      <div
        onClick={(e) => handleEditClick(e, 'title', task.title)}
        className="cursor-text"
      >
        {editingTaskId === task.id && editingField === 'title' ? (
          <input
            type="text"
            value={editValues.title ?? task.title}
            onChange={(e) => handleEditChange('title', e.target.value)}
            onBlur={() => submitEdit(task.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitEdit(task.id)
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded animate-pulse"
            autoFocus
          />
        ) : (
          <span className="font-medium">{task.title}</span>
        )}
      </div>
      <div className="cursor-pointer">
        {editingTaskId === task.id && editingField === 'status' ? (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button
              onClick={(e) => handleEditClick(e, 'status', task.status)}
              className={`w-fit max-w-[280px] px-4 py-2 border border-gray-300 rounded-md text-sm bg-white animate-pulse ${getStatusStyles(
                (editValues.status ?? task.status) as Task['status']
              )}`}
              data-testid="status-menu-button"
            >
              {editValues.status ?? task.status}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-1 w-full max-w-[280px] rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none z-20">
                <div className="p-2 space-y-2">
                  {['To Do', 'In Progress', 'Done'].map((option) => (
                    <Menu.Item key={option}>
                      {({ active }) => (
                        <button
                          type="button"
                          onMouseDown={() => handleOptionSelect('status', option)}
                          onClick={() => handleOptionSelect('status', option)}
                          className={`w-full text-left px-4 py-1.5 rounded-md text-sm mx-2 ${
                            getStatusStyles(option as Task['status'])
                          } ${active ? 'bg-gray-100' : ''}`}
                          data-testid={`status-option-${option}`}
                        >
                          {option}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : (
          <span
            onClick={(e) => handleEditClick(e, 'status', task.status)}
            className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getStatusStyles(
              task.status
            )}`}
          >
            {task.status}
          </span>
        )}
      </div>
      <div>{formatDate(task.createdDate)}</div>
      <div
        onClick={(e) => handleEditClick(e, 'dueDate', task.dueDate)}
        className="cursor-pointer"
      >
        {editingTaskId === task.id && editingField === 'dueDate' ? (
          <input
            type="date"
            value={editValues.dueDate ?? task.dueDate}
            onChange={(e) => handleEditChange('dueDate', e.target.value)}
            onBlur={() => submitEdit(task.id)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') submitEdit(task.id)
            }}
            className="w-full px-2 py-1 border border-gray-300 rounded animate-pulse"
            autoFocus
          />
        ) : (
          formatDate(task.dueDate)
        )}
      </div>
      <div className="cursor-pointer">
        {editingTaskId === task.id && editingField === 'priority' ? (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button
              onClick={(e) => handleEditClick(e, 'priority', task.priority)}
              className={`w-fit max-w-[280px] px-4 py-2 border border-gray-300 rounded-md text-sm bg-white animate-pulse ${getPriorityStyles(
                (editValues.priority ?? task.priority) as Task['priority']
              )}`}
              data-testid="priority-menu-button"
            >
              {editValues.priority ?? task.priority}
            </Menu.Button>
            <Transition
              as={Fragment}
              enter="transition ease-out duration-100"
              enterFrom="transform opacity-0 scale-95"
              enterTo="transform opacity-100 scale-100"
              leave="transition ease-in duration-100"
              leaveFrom="transform opacity-100 scale-100"
              leaveTo="transform opacity-0 scale-95"
            >
              <Menu.Items className="absolute left-0 mt-1 w-full max-w-[280px] rounded-md bg-white shadow-lg border border-gray-200 focus:outline-none z-20">
                <div className="p-2 space-y-2">
                  {['Low', 'Medium', 'High'].map((option) => (
                    <Menu.Item key={option}>
                      {({ active }) => (
                        <button
                          type="button"
                          onMouseDown={() => handleOptionSelect('priority', option)}
                          onClick={() => handleOptionSelect('priority', option)}
                          className={`w-full text-left px-4 py-1.5 rounded-md text-sm mx-2 ${
                            getPriorityStyles(option as Task['priority'])
                          } ${active ? 'bg-gray-100' : ''}`}
                          data-testid={`priority-option-${option}`}
                        >
                          {option}
                        </button>
                      )}
                    </Menu.Item>
                  ))}
                </div>
              </Menu.Items>
            </Transition>
          </Menu>
        ) : (
          <span
            onClick={(e) => handleEditClick(e, 'priority', task.priority)}
            className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getPriorityStyles(
              task.priority
            )}`}
          >
            {task.priority}
          </span>
        )}
      </div>
    </div>
  )
}

export default SortableTask