'use client'

import { useState, useEffect } from 'react'
import { useTheme } from '@/app/themeContext'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { IOptions, RecursivePartial } from '@tsparticles/engine'
import { motion } from 'framer-motion'
import ProjectSelector from './BusinessProjectSelector'
import AddProjectModal from './AddProjectModal'
import AddTaskModal from './AddTaskModal'
import AddBusinessModal from './AddBusinessModal'

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
  const [businesses, setBusinesses] = useState<Business[]>([
    // {
    //   id: '1',
    //   name: 'Business A',
    //   description: 'A great business',
    //   projects: [
    //     {
    //       id: 'p1',
    //       name: 'Project business A',
    //       description: 'Initial project for Business A',
    //       tasks: [
    //         {
    //           id: 't1',
    //           title: 'Business Task 1',
    //           status: 'To Do',
    //           dueDate: '2025-04-18',
    //           description: 'Initial task for Project X',
    //         },
    //       ],
    //     },
    //   ],
    // },
  ])
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(businesses[0] || null)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({ name: businesses[0]?.name || '', description: businesses[0]?.description || '' })
  const [isLinkingTask, setIsLinkingTask] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(businesses[0]?.projects[0]?.id || null)
  const [isAddBusinessModalOpen, setIsAddBusinessModalOpen] = useState(false)
  const [isAddProjectModalOpen, setIsAddProjectModalOpen] = useState(false)
  const [isAddTaskModalOpen, setIsAddTaskModalOpen] = useState<{ open: boolean; projectId: string | null }>({ open: false, projectId: null })
  const [toastMessage, setToastMessage] = useState<string | null>(null)
  const [corners, setCorners] = useState<Corner[]>([])
  const [init, setInit] = useState(false)

  // Carregar localStorage no cliente
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

  // Salvar businesses no localStorage
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

  // Inicializar Particles
  useEffect(() => {
    console.log('Initializing particles engine')
    initParticlesEngine(async (engine) => {
      try {
        await loadSlim(engine)
        setInit(true)
        console.log('Particles engine initialized')
      } catch (error) {
        console.error('Error initializing particles:', error)
        setInit(false)
        setToastMessage('Failed to load particles, continuing without them')
      }
    })
  }, [])

  // Gerenciar toast
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
    // Sincronizar selectedBusiness para refletir o novo projeto
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
    // Sincronizar selectedBusiness para refletir a nova tarefa
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
    // Sincronizar selectedBusiness para refletir a tarefa vinculada
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
  console.log('Rendering MyBusinessTab with theme:', safeTheme)

  return (
    <>
      <div
        className={`min-h-screen p-6 relative ${safeTheme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
        style={{
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          backgroundColor: safeTheme === 'light' ? 'bg-white' : 'rgba(30, 41, 59, 0.8)',
        }}
      >

        <div className="relative z-10 max-w-full mx-auto">
          <motion.h1
            className={`text-4xl font-bold mb-6 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'
              }`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            My Business
          </motion.h1>
          {toastMessage && (
            <motion.div
              className={`fixed bottom-4 right-4 p-4 rounded-md shadow-md ${toastMessage.includes('Error') ?
                  (safeTheme === 'light' ? 'bg-red-500 text-white' : 'bg-red-600 text-gray-100') :
                  (safeTheme === 'light' ? 'bg-green-500 text-white' : 'bg-green-600 text-gray-100')
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

          <div className="flex flex-col lg:flex-row lg:space-x-6 w-full">
            <motion.div
              className="lg:w-64 mb-8 lg:mb-0"
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
                className={`p-4 rounded-xl shadow-md border ${safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
                  }`}
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
              className="flex-1"
              variants={cardVariants}
              initial="hidden"
              animate="visible"
            >
              {selectedBusiness ? (
                <div
                  className={`p-6 rounded-xl shadow-md border ${safeTheme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
                    }`}
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
                      <div className="flex space-x-2">
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
                      </div>
                    </motion.div>
                  ) : (
                    <div className="space-y-4">
                      <motion.h2
                        className={`text-2xl font-semibold ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3 }}
                      >
                        {selectedBusiness.name}
                      </motion.h2>
                      <motion.p
                        className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                          }`}
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
                            console.log('Clicked Edit Business')
                            setIsEditing(true)
                          }}
                          className={`px-4 py-1 rounded-xl font-semibold transition-colors bg-transparent border-2 ${safeTheme === 'light'
                              ? 'border-fuchsia-200 hover:border-fuchsia-500 text-gray-900'
                              : 'border-fuchsia-800 hover:border-fuchsia-700 text-gray-100'
                            }`}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Edit Business
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            console.log('Clicked Add Project')
                            setIsAddProjectModalOpen(true)
                          }}
                          className={`px-4 py-1 rounded-xl font-semibold transition-colors bg-transparent border-2 ${safeTheme === 'light'
                              ? 'border-green-200 hover:border-green-600 text-gray-900'
                              : 'border-green-800 hover:border-green-700 text-gray-100'
                            }`}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Add Project
                        </motion.button>
                        <motion.button
                          onClick={() => {
                            console.log('Clicked Link Task from Tasks')
                            setIsLinkingTask(true)
                          }}
                          className={`px-4 py-1 rounded-xl font-semibold transition-colors bg-transparent border-2 ${safeTheme === 'light'
                              ? 'border-yellow-200 hover:border-yellow-600 text-gray-900'
                              : 'border-yellow-800 hover:border-yellow-700 text-gray-100'
                            }`}
                          variants={buttonVariants}
                          whileHover="hover"
                          whileTap="tap"
                        >
                          Link Task from Tasks
                        </motion.button>
                      </motion.div>
                      <motion.h3
                        className={`text-xl font-semibold mt-6 ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ duration: 0.3, delay: 0.3 }}
                      >
                        Projects
                      </motion.h3>
                      {isLinkingTask ? (
                        <motion.div
                          className="space-y-4"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ duration: 0.3 }}
                        >
                          <h4
                            className={`text-lg font-semibold ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'
                              }`}
                          >
                            Select Task to Link
                          </h4>
                          <div>
                            <label
                              className={`block text-sm font-medium ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                }`}
                            >
                              Select Project
                            </label>
                            <ProjectSelector
                              projects={selectedBusiness.projects}
                              selectedProjectId={selectedProjectId}
                              onSelect={(id) => {
                                console.log('Selected project ID:', id)
                                setSelectedProjectId(id)
                              }}
                              theme={safeTheme}
                            />
                            {!selectedProjectId && (
                              <p
                                className={`text-sm ${safeTheme === 'light' ? 'text-red-600' : 'text-red-400'
                                  } mt-1`}
                              >
                                Please select a project
                              </p>
                            )}
                          </div>
                          {corners.length > 0 ? (
                            corners.map((corner, index) => (
                              <motion.div
                                key={corner.id}
                                className={`p-4 rounded-lg shadow-sm border ${safeTheme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'
                                  }`}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                              >
                                <p
                                  className={`font-medium ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                    }`}
                                >
                                  {corner.title}
                                </p>
                                <ul className="ml-4 mt-2 space-y-1">
                                  {corner.tasks.map((task) => (
                                    <motion.li
                                      key={task.id}
                                      variants={cardVariants}
                                      initial="hidden"
                                      animate="visible"
                                      transition={{ delay: 0.2 }}
                                    >
                                      <button
                                        onClick={() => {
                                          console.log('Clicked Link Task:', task.title)
                                          handleLinkTask(corner.id, task.id)
                                        }}
                                        className={`text-blue-400 hover:underline ${safeTheme === 'light'
                                            ? 'hover:text-blue-500'
                                            : 'hover:text-blue-300'
                                          }`}
                                        disabled={!selectedProjectId}
                                      >
                                        {task.title} - {task.status}
                                      </button>
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.div>
                            ))
                          ) : (
                            <p
                              className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}
                            >
                              No tasks available in Tasks.
                            </p>
                          )}
                          <motion.button
                            onClick={() => {
                              console.log('Clicked Cancel (Link Task)')
                              setIsLinkingTask(false)
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
                        </motion.div>
                      ) : (
                        <ul className="space-y-4">
                          {selectedBusiness.projects.length > 0 ? (
                            selectedBusiness.projects.map((project, index) => (
                              <motion.li
                                key={project.id}
                                className={`p-4 rounded-lg shadow-sm border ${safeTheme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'
                                  }`}
                                variants={cardVariants}
                                initial="hidden"
                                animate="visible"
                                transition={{ delay: index * 0.1 }}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center">
                                    <svg
                                      className={`w-5 h-5 mr-2 ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                        }`}
                                      fill="none"
                                      stroke="currentColor"
                                      viewBox="0 0 24 24"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth="2"
                                        d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                                      />
                                    </svg>
                                    <span
                                      className={`font-medium ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                        }`}
                                    >
                                      {project.name}
                                    </span>
                                  </div>
                                  <motion.button
                                    onClick={() => {
                                      console.log('Clicked Add Task for project:', project.id)
                                      setIsAddTaskModalOpen({ open: true, projectId: project.id })
                                    }}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-colors border-2 ${safeTheme === 'light'
                                        ? 'bg-gray-200 text-black hover:bg-gray-300'
                                        : 'bg-slate-600 text-gray-200 hover:bg-slate-500'
                                      }`}
                                    variants={buttonVariants}
                                    whileHover="hover"
                                    whileTap="tap"
                                  >
                                    Add Task
                                  </motion.button>
                                </div>
                                {project.description && (
                                  <p
                                    className={`text-sm mt-2 ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'

                                      }`}
                                  >
                                    {project.description}
                                  </p>
                                )}
                                <ul className="ml-4 mt-2 space-y-2">
                                  {project.tasks.map((task, taskIndex) => (
                                    <motion.li
                                      key={task.id}
                                      className={`p-2 rounded-md ${safeTheme === 'light' ? 'bg-white' : 'bg-slate-900'
                                        }`}
                                      variants={cardVariants}
                                      initial="hidden"
                                      animate="visible"
                                      transition={{ delay: taskIndex * 0.05 }}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div>
                                          <span
                                            className={`${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                              }`}
                                          >
                                            {task.title} - {task.status} (Due: {task.dueDate})
                                          </span>
                                          {task.description && (
                                            <p
                                              className={`text-sm ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                                }`}
                                            >
                                              {task.description}
                                            </p>
                                          )}
                                        </div>
                                        <motion.button
                                          onClick={() => {
                                            console.log('Clicked Add to Calendar:', task.title)
                                            handleLinkToCalendar(task, project.id)
                                          }}
                                          className={`text-blue-400 hover:underline ${safeTheme === 'light'
                                              ? 'hover:text-blue-500'
                                              : 'hover:text-blue-300'
                                            }`}
                                          variants={buttonVariants}
                                          whileHover="hover"
                                          whileTap="tap"
                                        >
                                          Add to Calendar
                                        </motion.button>
                                      </div>
                                    </motion.li>
                                  ))}
                                </ul>
                              </motion.li>
                            ))
                          ) : (
                            <motion.p
                              className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                                }`}
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                            >
                              No projects assigned.
                            </motion.p>
                          )}
                        </ul>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <motion.p
                  className={`${safeTheme === 'light' ? 'text-gray-700' : 'text-gray-300'
                    }`}
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
      </div>
    </>
  )
}