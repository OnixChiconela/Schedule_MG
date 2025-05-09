"use client"

import { createPortal } from 'react-dom';

import { format, parseISO } from 'date-fns'
import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { Menu, MenuButton, MenuItem, MenuItems, Transition } from '@headlessui/react'
import { Fragment, useCallback, useMemo, useState, useEffect, useRef } from 'react'

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
  isMenuOpen: boolean
  selectedTasks: number[]
  onTaskSelect: (taskId: number) => void
  theme: 'light' | 'dark'
}

export default function SortableTask({
  task,
  editingTaskId,
  editingField,
  editValues,
  startEditing,
  handleEditChange,
  submitEdit,
  onTaskToggle,
  isMenuOpen,
  selectedTasks,
  onTaskSelect,
  theme,
}: SortableTaskProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
  } = useSortable({ id: task.id })
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false);
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false);
  const [isSelecting, setIsSelecting] = useState(false);
  const statusButtonRef = useRef<HTMLButtonElement>(null);
  const priorityButtonRef = useRef<HTMLButtonElement>(null);

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

  const handleOptionSelect = useCallback(
    (field: keyof Task, value: string) => {
      console.log(`SortableTask: Selecting ${field}: ${value}, task ID: ${task.id}`)
      setIsSelecting(true)
      handleEditChange(field, value)
      submitEdit(task.id)
      setIsSelecting(false)
    },
    [handleEditChange, submitEdit, task.id]
  )

  const PortalMenuItems = ({ children, anchorRef, ...props }: { children: React.ReactNode; anchorRef: React.RefObject<HTMLButtonElement | null>; } & React.HTMLProps<HTMLDivElement>) => {
    const [position, setPosition] = useState({ top: 0, left: 0 });

    useEffect(() => {
      if (anchorRef.current) {
        const rect = anchorRef.current.getBoundingClientRect();
        setPosition({
          top: rect.bottom + window.scrollY,
          left: rect.left + window.scrollX,
        });
      }
    }, [anchorRef]);

    return createPortal(
      <div
        {...props}
        style={{
          position: 'absolute',
          top: `${position.top}px`,
          left: `${position.left}px`,
          zIndex: 9999,
        }}
      >
        {children}
      </div>,
      document.body
    );
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`grid grid-cols-7 gap-2 items-center rounded-xl p-2 text-sm ${theme === "light" ? "bg-gray-100" : "bg-slate-600"
        } transition-colors duration-300`}
    >
      <div className='transition-discrete'>
        {isMenuOpen ? (
          <div className="flex items-center transition-normal duration-200">
            <input
              type="checkbox"
              checked={selectedTasks.includes(task.id)}
              onChange={() => onTaskSelect(task.id)}
              className="h-4 w-4"
            />
          </div>
        ) : (
          <div {...attributes} {...listeners} className="cursor-grab transition-normal duration-200">
            <GripVertical size={16} className={theme === "light" ? "text-gray-500" : "text-gray-400"} />
          </div>
        )}
      </div>
      <div>
        <input
          type="checkbox"
          checked={task.isCompleted}
          onChange={(e) => onTaskToggle(task.id, e.target.checked)}
          className={`h-4 w-4 rounded border-gray-300 focus:ring-blue-500 ${theme === "light" ? "text-black" : "text-gray-200"
            }`}
        />
      </div>
      <div
        onClick={() => {
          console.log("SortableTask: Starting edit: title");
          startEditing(task.id, "title", task.title);
        }}
        className="cursor-text"
      >
        {editingTaskId === task.id && editingField === "title" ? (
          <input
            type="text"
            value={editValues.title ?? task.title}
            onChange={(e) => {
              console.log(`SortableTask: Changing title to: ${e.target.value}`);
              handleEditChange("title", e.target.value);
            }}
            onBlur={() => {
              console.log("SortableTask: Submitting title edit");
              submitEdit(task.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("SortableTask: Submitting title edit via Enter");
                submitEdit(task.id);
              }
            }}
            className={`w-full px-2 py-1 border rounded animate-pulse ${theme === "light" ? "border-gray-300 bg-white" : "border-slate-500 bg-slate-700 text-gray-200"
              }`}
            autoFocus
          />
        ) : (
          <span className="font-medium">{task.title}</span>
        )}
      </div>
      <div className="relative">
        {editingTaskId === task.id && editingField === "status" ? (
          <>
            <Menu as="div" className="relative inline-block text-left w-full">
              <MenuButton
                ref={statusButtonRef}
                onClick={() => setIsStatusMenuOpen(true)}
                disabled={isSelecting}
                className={`w-full max-w-[280px] px-4 py-2 border rounded-md text-sm animate-pulse ${isSelecting ? "opacity-50 cursor-not-allowed" : ""
                  } ${theme === "light" ? "bg-white border-gray-300" : "bg-slate-700 border-slate-500 text-gray-200"
                  } ${getStatusStyles((editValues.status ?? task.status) as Task["status"])}`}
                data-testid="status-menu-button"
              >
                {editValues.status ?? task.status}
              </MenuButton>
              {isStatusMenuOpen && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems
                    as={PortalMenuItems}
                    anchorRef={statusButtonRef}
                    className={`w-full max-w-[280px] rounded-md shadow-lg border focus:outline-none ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-slate-500"
                      }`}
                  >
                    <div className="p-2 space-y-2">
                      {["To Do", "In Progress", "Done"].map((option) => (
                        <MenuItem key={option} disabled={isSelecting}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                handleOptionSelect("status", option);
                                setIsStatusMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-1.5 rounded-md text-sm mx-2 ${getStatusStyles(
                                option as Task["status"]
                              )} ${active && !isSelecting ? (theme === "light" ? "bg-gray-100" : "bg-slate-600") : ""}`}
                              data-testid={`status-option-${option}`}
                            >
                              {option}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Transition>
              )}
            </Menu>
          </>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              console.log("SortableTask: Starting edit: status");
              console.log(`SortableTask: Opened status dropdown for task ID: ${task.id}`);
              startEditing(task.id, "status", task.status);
            }}
            className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getStatusStyles(task.status)}`}
          >
            {task.status}
          </span>
        )}
      </div>
      <div>{formatDate(task.createdDate)}</div>
      <div
        onClick={() => {
          console.log("SortableTask: Starting edit: dueDate");
          startEditing(task.id, "dueDate", task.dueDate);
        }}
        className="cursor-pointer"
      >
        {editingTaskId === task.id && editingField === "dueDate" ? (
          <input
            type="date"
            value={editValues.dueDate ?? task.dueDate}
            onChange={(e) => {
              console.log(`SortableTask: Changing dueDate to: ${e.target.value}`);
              handleEditChange("dueDate", e.target.value);
            }}
            onBlur={() => {
              console.log("SortableTask: Submitting dueDate edit");
              submitEdit(task.id);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                console.log("SortableTask: Submitting dueDate edit via Enter");
                submitEdit(task.id);
              }
            }}
            className={`w-full px-2 py-1 border rounded animate-pulse ${theme === "light" ? "border-gray-300 bg-white" : "border-slate-500 bg-slate-700 text-gray-200"
              }`}
            autoFocus
          />
        ) : (
          formatDate(task.dueDate)
        )}
      </div>
      <div className="relative">
        {editingTaskId === task.id && editingField === "priority" ? (
          <>
            <Menu as="div" className="relative inline-block text-left w-full">
              <MenuButton
                ref={priorityButtonRef}
                onClick={() => setIsPriorityMenuOpen(true)}
                disabled={isSelecting}
                className={`w-full max-w-[280px] px-4 py-2 border rounded-md text-sm animate-pulse ${isSelecting ? "opacity-50 cursor-not-allowed" : ""
                  } ${theme === "light" ? "bg-white border-gray-300" : "bg-slate-700 border-slate-500 text-gray-200"
                  } ${getPriorityStyles((editValues.priority ?? task.priority) as Task["priority"])}`}
                data-testid="priority-menu-button"
              >
                {editValues.priority ?? task.priority}
              </MenuButton>
              {isPriorityMenuOpen && (
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-100"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <MenuItems
                    as={PortalMenuItems}
                    anchorRef={priorityButtonRef}
                    className={`w-full max-w-[280px] rounded-md shadow-lg border focus:outline-none ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-slate-500"
                      }`}
                  >
                    <div className="p-2 space-y-2">
                      {["Low", "Medium", "High"].map((option) => (
                        <MenuItem key={option} disabled={isSelecting}>
                          {({ active }) => (
                            <button
                              type="button"
                              onClick={() => {
                                handleOptionSelect("priority", option);
                                setIsPriorityMenuOpen(false);
                              }}
                              className={`w-full text-left px-4 py-1.5 rounded-md text-sm mx-2 ${getPriorityStyles(
                                option as Task["priority"]
                              )} ${active && !isSelecting ? (theme === "light" ? "bg-gray-100" : "bg-slate-600") : ""}`}
                              data-testid={`priority-option-${option}`}
                            >
                              {option}
                            </button>
                          )}
                        </MenuItem>
                      ))}
                    </div>
                  </MenuItems>
                </Transition>
              )}
            </Menu>
          </>
        ) : (
          <span
            onClick={(e) => {
              e.stopPropagation();
              console.log("SortableTask: Starting edit: priority");
              console.log(`SortableTask: Opened priority dropdown for task ID: ${task.id}`);
              startEditing(task.id, "priority", task.priority);
            }}
            className={`inline-block px-3 py-1.5 rounded-md text-sm mx-2 ${getPriorityStyles(task.priority)}`}
          >
            {task.priority}
          </span>
        )}
      </div>
    </div>
  );
}