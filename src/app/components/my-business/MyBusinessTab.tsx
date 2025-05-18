'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/app/themeContext'

import { motion } from 'framer-motion'
import ProjectSelector from './BusinessProjectSelector'
import AddProjectModal from './AddProjectModal'
import AddTaskModal from './AddTaskModal'
import AddBusinessModal from './AddBusinessModal'
import Container from '../Container'
import { format, parseISO } from 'date-fns'
import { Link, MoreHorizontal, Pen, Plus } from 'lucide-react'
import LinkTaskSection from './LinkTaskSection'
import ProjectsList from './ProjectsList'
import BusinessHeader from './BusinessHeader'

interface BusinessTask {
  id: string
  title: string
  status: 'To Do' | 'In Progress' | 'Done'
  dueDate: string
  description?: string
}

interface BusinessProject {
  id: string
  name: string
  description?: string
  tasks: BusinessTask[]
}

interface Business {
  id: string
  name: string
  description: string
  projects: BusinessProject[]
}

interface Corner {
  id: number
  title: string
  tasks: {
    id: number
    title: string
    status: 'To Do' | 'In Progress' | 'Done'
    dueDate: string
    description?: string
  }[]
}

export default function MyBusinessTab() {
  const { theme } = useTheme()
  const [businesses, setBusinesses] = useState<Business[]>([])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: '', description: '' })
  const [isLinkingTask, setIsLinkingTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [openMenuId, setOpenMenuId] = useState<number | null>(null)
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false)

  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false)
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<{ open: boolean; projectId: string | null }>({ open: false, projectId: null })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [corners, setCorners] = useState<Corner[]>([])

  useEffect(() => {
    console.log('Running client-side useEffect for localStorage')
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('businesses')
        console.log('Loading businesses from localStorage:', saved)
        if (saved) {
          const parsedBusinesses = JSON.parse(saved)
          setBusinesses(parsedBusinesses)
          if (parsedBusinesses.length > 0) {
            setSelectedBusiness(parsedBusinesses[0])
            setFormData({ name: parsedBusinesses[0].name, description: parsedBusinesses[0].description })
            setSelectedProjectId(parsedBusinesses[0].projects[0]?.id || null)
          }
        }
        const savedCorners = localStorage.getItem('corners')
        if (savedCorners) {
          console.log('Loading corners from localStorage:', savedCorners)
          setCorners(JSON.parse(savedCorners))
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error)
        setToastMessage('Error loading saved data')
      }
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        console.log('Saving businesses to localStorage:', businesses)
        localStorage.setItem('businesses', JSON.stringify(businesses))
      } catch (error) {
        console.error('Error saving to localStorage:', error)
      }
    }
  }, [businesses])

  useEffect(() => {
    if (toastMessage) {
      console.log('Showing toast:', toastMessage)
      const timer = setTimeout(() => {
        setToastMessage(null)
        console.log('Hiding toast')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [toastMessage])

  const handleSave = () => {
    if (!selectedBusiness) {
      console.warn('handleSave: No selected business')
      return
    }
    console.log('Saving business:', formData)
    setBusinesses(
      businesses.map((b) =>
        b.id === selectedBusiness.id ? { ...b, ...formData } : b
      )
    )
    setSelectedBusiness({ ...selectedBusiness, ...formData })
    setIsEditing(false)
    setToastMessage('Business updated successfully')
  }

  const handleAddBusiness = (name: string, description: string) => {
    console.log('Adding new business:', { name, description })
    const newBusiness: Business = {
      id: Date.now().toString(),
      name,
      description,
      projects: [],
    }
    console.log('New business created:', newBusiness)
    setBusinesses((prev) => {
      const updated = [...prev, newBusiness]
      console.log('Updated businesses:', updated)
      return updated
    })
    setSelectedBusiness(newBusiness)
    setFormData({ name, description })
    setSelectedProjectId(null)
    setIsAddBusinessModalOpen(false)
    setToastMessage(`Business "${name}" added successfully`)
  }

  const handleAddProject = (name: string, description: string) => {
    if (!selectedBusiness) {
      console.warn('handleAddProject: No selected business')
      return
    }
    console.log('Adding project:', { name, description })
    const newProject: BusinessProject = {
      id: Date.now().toString(),
      name,
      description,
      tasks: [],
    }
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === selectedBusiness.id
          ? { ...b, projects: [...b.projects, newProject] }
          : b
      )
    )
    setSelectedBusiness((prev) =>
      prev && prev.id === selectedBusiness.id
        ? { ...prev, projects: [...prev.projects, newProject] }
        : prev
    )
    setSelectedProjectId(newProject.id)
    setIsAddProjectModalOpen(false)
    setToastMessage(`Project "${name}" added successfully`)
  }

  const handleAddTask = (projectId: string, taskData: Omit<BusinessTask, 'id'>) => {
    if (!selectedBusiness) {
      console.warn('handleAddTask: No selected business')
      return
    }
    if (!projectId) {
      console.warn('handleAddTask: No projectId')
      return
    }
    const newTask: BusinessTask = {
      id: Date.now().toString(),
      ...taskData,
    }
    console.log('Adding task:', newTask)
    setBusinesses((prev) =>
      prev.map((b) =>
        b.id === selectedBusiness.id
          ? {
            ...b,
            projects: b.projects.map((p) =>
              p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
            ),
          }
          : b
      )
    )
    setSelectedBusiness((prev) =>
      prev && prev.id === selectedBusiness.id
        ? {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === projectId ? { ...p, tasks: [...p.tasks, newTask] } : p
          ),
        }
        : prev
    )
    setIsAddTaskModalOpen({ open: false, projectId: null })
    setToastMessage(`Task "${newTask.title}" added successfully`)
  }

  const handleLinkTask = (cornerId: number, taskId: number) => {
    if (!selectedBusiness || !selectedProjectId) {
      console.warn('handleLinkTask: No selected business or project')
      return
    }
    const corner = corners.find((c) => c.id === cornerId)
    if (!corner) {
      console.warn('handleLinkTask: Corner not found')
      return
    }
    const task = corner.tasks.find((t) => t.id === taskId)
    if (!task) {
      console.warn('handleLinkTask: Task not found')
      return
    }
    const newTask: BusinessTask = {
      id: `linked-${task.id}`,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      description: task.description || '',
    }
    console.log('Linking task:', newTask)
    setBusinesses(
      businesses.map((b) =>
        b.id === selectedBusiness.id
          ? {
            ...b,
            projects: b.projects.map((p) =>
              p.id === selectedProjectId
                ? { ...p, tasks: [...p.tasks, newTask] }
                : p
            ),
          }
          : b
      )
    )
    setSelectedBusiness((prev) =>
      prev && prev.id === selectedBusiness.id
        ? {
          ...prev,
          projects: prev.projects.map((p) =>
            p.id === selectedProjectId
              ? { ...p, tasks: [...p.tasks, newTask] }
              : p
          ),
        }
        : prev
    )
    setIsLinkingTask(false)
    setToastMessage(`Task "${task.title}" linked successfully`)
  }

  const handleLinkToCalendar = (task: BusinessTask, projectId: string) => {
    if (!selectedBusiness) {
      console.warn('handleLinkToCalendar: No selected business')
      return
    }
    console.log('Linking task to calendar:', task.title)
    if (typeof window !== 'undefined') {
      try {
        const savedEvents = localStorage.getItem('calendarEvents')
        const events = savedEvents ? JSON.parse(savedEvents) : []
        const newEvent = {
          id: Date.now(),
          title: task.title,
          start: new Date(task.dueDate).toISOString(),
          end: new Date(task.dueDate).toISOString(),
          priority: task.status === 'To Do' ? 'Low' : task.status === 'In Progress' ? 'Medium' : 'High',
          description: task.description || undefined,
          businessId: selectedBusiness.id,
          projectId,
        }
        localStorage.setItem('calendarEvents', JSON.stringify([...events, newEvent]))
        setToastMessage(`Task "${task.title}" added to Calendar`)
        console.log(`Linked task "${task.title}" to calendar as event ID ${newEvent.id}`)
      } catch (error) {
        console.error('Error linking task to calendar:', error)
        setToastMessage('Error adding task to Calendar')
      }
    }
  }

  const handleDeleteBusiness = () => {
    if (!selectedBusiness) return
    console.log('Deleting business:', selectedBusiness.name)
    setBusinesses(businesses.filter(b => b.id !== selectedBusiness.id))
    setSelectedBusiness(businesses.length > 1 ? businesses.find(b => b.id !== selectedBusiness.id) || null : null)
    setIsDeleteConfirmOpen(false)
    setToastMessage(`Business "${selectedBusiness.name}" deleted successfully`)
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  const toastVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  }

  const safeTheme = theme || 'light'

  const formatDate = (date: string) => {
    try {
      return format(parseISO(date), 'dd MMM, yyyy')
    } catch {
      return date
    }
  }

  return (
    <>
      <div
        className={`min-h-screen p-0 relative overflow-x-hidden ${safeTheme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
        }}
      >
        <Container>
          <div className="relative z-10 w-full mx-auto">
            <motion.h1
              className={`text-4xl pt-8 font-bold mb-6 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              My Business
            </motion.h1>
            <AddBusinessModal
              isOpen={isAddBusinessModalOpen}
              onClose={() => {
                console.log('Closing AddBusinessModal')
                setIsAddBusinessModalOpen(false)
              }}
              onSave={handleAddBusiness}
              theme={safeTheme}
            />
            <AddProjectModal
              isOpen={isAddProjectModalOpen}
              onClose={() => {
                console.log('Closing AddProjectModal')
                setIsAddProjectModalOpen(false)
              }}
              onSave={handleAddProject}
              theme={safeTheme}
            />
            <AddTaskModal
              isOpen={isAddTaskModalOpen.open}
              onClose={() => {
                console.log('Closing AddTaskModal')
                setIsAddTaskModalOpen({ open: false, projectId: null })
              }}
              onSave={(taskData) => {
                console.log('Saving task from AddTaskModal:', taskData)
                handleAddTask(isAddTaskModalOpen.projectId!, taskData)
              }}
              theme={safeTheme}
            />
            {isDeleteConfirmOpen && (
              <div className={`fixed inset-0 ${safeTheme === 'light' ? 'bg-gray-100/50' : 'bg-slate-800/70'} bg-opacity-80 flex items-center justify-center z-50`}>
                <div className={`p-4 rounded-lg ${safeTheme === 'light' ? 'bg-white' : 'bg-slate-700'}`}>
                  <p className={safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'}>Are you sure you want to delete this business?</p>
                  <div className="flex justify-end space-x-2 mt-4">
                    <motion.button
                      onClick={() => setIsDeleteConfirmOpen(false)}
                      className={`px-4 py-2 rounded-xl ${safeTheme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-slate-600 hover:bg-slate-500 text-gray-200'}`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Cancel
                    </motion.button>
                    <motion.button
                      onClick={handleDeleteBusiness}
                      className={`px-4 py-2 rounded-xl ${safeTheme === 'light' ? 'bg-red-700/70 hover:bg-red-600/70 text-white' : 'bg-red-600/60 hover:bg-red-500/60 text-gray-100'}`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Delete
                    </motion.button>
                  </div>
                </div>
              </div>
            )}
            {toastMessage && (
              <motion.div
                className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md z-50 ${toastMessage.includes('Error')
                  ? (safeTheme === 'light' ? 'bg-red-500 text-white' : 'bg-red-600 text-gray-100')
                  : (safeTheme === 'light' ? 'bg-green-500 text-white' : 'bg-green-600 text-gray-100')
                  }`}
                variants={toastVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
              >
                <div className="flex items-center">
                  <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                  {toastMessage}
                </div>
              </motion.div>
            )}

            <div className="flex flex-col lg:flex-row lg:gap-6 w-full">
              <motion.div
                className="w-full max-w-full lg:max-w-64 mb-8 lg:mb-0 mx-auto"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                <motion.button
                  onClick={() => {
                    console.log('Clicked Add Business')
                    setIsAddBusinessModalOpen(true)
                  }}
                  className={`w-full mb-4 px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === 'light'
                    ? 'bg-gray-950 hover:bg-black text-white'
                    : 'bg-gray-950 hover:bg-black text-gray-100'
                    } shadow-md`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Add Business
                </motion.button>
                <div
                  className={`p-4 rounded-xl shadow-md border ${safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'}`}
                >
                  {businesses.length > 0 ? (
                    businesses.map((business, index) => (
                      <motion.div
                        key={business.id}
                        className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${selectedBusiness?.id === business.id
                          ? safeTheme === 'light'
                            ? 'bg-fuchsia-100 text-fuchsia-900'
                            : 'bg-slate-600 text-white'
                          : safeTheme === 'light'
                            ? 'bg-gray-100 text-gray-900'
                            : 'bg-slate-800 text-gray-200'
                          } hover:${safeTheme === 'light'
                            ? 'bg-gradient-to-r from-gray-200 to-gray-300'
                            : 'bg-gradient-to-r from-slate-600 to-slate-700'
                          }`}
                        onClick={() => {
                          console.log('Selecting business:', business.name)
                          setSelectedBusiness(business)
                          setFormData({ name: business.name, description: business.description })
                          setSelectedProjectId(business.projects[0]?.id || null)
                          setIsEditing(false)
                        }}
                        variants={cardVariants}
                        initial="hidden"
                        animate="visible"
                        transition={{ delay: index * 0.1 }}
                      >
                        {business.name}
                      </motion.div>
                    ))
                  ) : (
                    <p className={`text-sm ${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                      No businesses available.
                    </p>
                  )}
                </div>
              </motion.div>

              <motion.div
                className="flex-1 w-full max-w-full mx-auto"
                variants={cardVariants}
                initial="hidden"
                animate="visible"
              >
                {selectedBusiness ? (
                  <div
                    className={`p-6 rounded-xl shadow-md border ${safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'}`}
                  >
                    {isEditing ? (
                      <motion.div
                        className="space-y-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        <input
                          type="text"
                          value={formData.name}
                          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                          className={`w-full p-3 rounded-lg border ${safeTheme === 'light'
                            ? 'border-gray-300 bg-white text-gray-900'
                            : 'border-slate-600 bg-slate-800 text-gray-200'
                            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
                          placeholder="Business Name"
                        />
                        <textarea
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          className={`w-full p-3 rounded-lg border ${safeTheme === 'light'
                            ? 'border-gray-300 bg-white text-gray-900'
                            : 'border-slate-600 bg-slate-800 text-gray-200'
                            } focus:outline-none focus:ring-2 focus:ring-gray-500`}
                          placeholder="Description"
                          rows={4}
                        />
                        <div className="flex justify-end space-x-2">
                          <motion.button
                            onClick={() => {
                              console.log('Clicked Cancel (Edit Business)')
                              setIsEditing(false)
                            }}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === 'light'
                              ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                              : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
                              }`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Cancel
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              console.log('Clicked Save (Edit Business)')
                              handleSave()
                            }}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === 'light'
                              ? 'bg-gray-950 hover:bg-black text-white'
                              : 'bg-gray-950 hover:bg-black text-gray-100'
                              }`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            Save
                          </motion.button>
                        </div>
                      </motion.div>
                    ) : (
                      <div className="space-y-4">
                        <BusinessHeader
                          name={selectedBusiness.name}
                          onEdit={() => setIsEditing(true)}
                          onDelete={() => setIsDeleteConfirmOpen(true)}
                        />
                        <motion.p
                          className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.1 }}
                        >
                          {selectedBusiness.description || 'No description'}
                        </motion.p>
                        <motion.div
                          className="flex space-x-2"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.2 }}
                        >
              
                          <motion.button
                            onClick={() => {
                              console.log('Clicked Add Project')
                              setIsAddProjectModalOpen(true)
                            }}
                            className={`px-4 py-1 rounded-xl font-semibold transition-colors bg-transparent border-2 ${safeTheme === 'light'
                              ? 'border-neutral-200 hover:border-green-200 text-gray-900'
                              : 'border-neutral-800 hover:border-green-950 text-gray-100'
                              } flex gap-2 items-center`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Plus />
                            Add Project
                          </motion.button>
                          <motion.button
                            onClick={() => {
                              console.log('Clicked Link Task from Tasks')
                              setIsLinkingTask(true)
                            }}
                            className={`px-4 py-1 rounded-xl font-semibold transition-colors bg-transparent border-2 ${safeTheme === 'light'
                              ? 'border-neutral-200 hover:border-yellow-100 text-gray-900'
                              : 'border-neutral-800 hover:border-yellow-950 text-gray-100'
                              } flex gap-2 items-center`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                          >
                            <Link />
                            Link from Tasks
                          </motion.button>
                        </motion.div>

                        <motion.h3
                          className={`text-xl font-semibold mt-6 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3, delay: 0.3 }}
                        >
                          Projects
                        </motion.h3>
                        {isLinkingTask ? (
                          <LinkTaskSection
                            corners={corners}
                            selectedProjectId={selectedProjectId}
                            onLinkTask={handleLinkTask}
                            onCancel={() => {
                              console.log('Clicked Cancel (Link Task)')
                              setIsLinkingTask(false)
                            }}
                            // theme={safeTheme}
                          />
                        ) : (
                          <ProjectsList
                            projects={selectedBusiness.projects}
                            // theme={safeTheme}
                            formatDate={formatDate}
                            onAddTask={(projectId) => {
                              console.log('Clicked Add Task for project:', projectId)
                              setIsAddTaskModalOpen({ open: true, projectId })
                            }}
                            onLinkToCalendar={handleLinkToCalendar}
                          />
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <motion.p
                    className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                  >
                    Select a business to view details.
                  </motion.p>
                )}
              </motion.div>
            </div>
          </div>
        </Container>
      </div>
    </>
  )
}