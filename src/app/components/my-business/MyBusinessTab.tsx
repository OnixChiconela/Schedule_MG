'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useTheme } from '@/app/themeContext'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { IOptions, RecursivePartial } from '@tsparticles/engine'
import { motion } from 'framer-motion'

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
  const [businesses, setBusinesses] = useState<Business[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('businesses')
      return saved
        ? JSON.parse(saved)
        : [
            {
              id: '1',
              name: 'Business A',
              description: 'A great business',
              projects: [
                {
                  id: 'p1',
                  name: 'Project X',
                  tasks: [
                    {
                      id: 't1',
                      title: 'Business Task 1',
                      status: 'To Do',
                      dueDate: '2025-04-18',
                      description: 'Initial task for Project X',
                    },
                  ],
                },
              ],
            },
          ]
    }
    return []
  })
  const [selectedBusiness, setSelectedBusiness] = useState<Business | null>(
    businesses[0] || null
  )
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(
    selectedBusiness
      ? { name: selectedBusiness.name, description: selectedBusiness.description }
      : { name: '', description: '' }
  )
  const [isLinkingTask, setIsLinkingTask] = useState(false)
  const [corners, setCorners] = useState<Corner[]>([])
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
      setInit(true)
    })
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('businesses', JSON.stringify(businesses))
      if (businesses.length > 0 && !selectedBusiness) {
        setSelectedBusiness(businesses[0])
        setFormData({ name: businesses[0].name, description: businesses[0].description })
      }
      const savedCorners = localStorage.getItem('corners')
      if (savedCorners) {
        setCorners(JSON.parse(savedCorners))
      }
    }
  }, [businesses, selectedBusiness])

  const handleSave = () => {
    setBusinesses(
      businesses.map((b) =>
        b.id === selectedBusiness?.id ? { ...b, ...formData } : b
      )
    )
    setSelectedBusiness({ ...selectedBusiness!, ...formData })
    setIsEditing(false)
    console.log('Business updated')
  }

  const handleAddBusiness = () => {
    const newBusiness: Business = {
      id: Date.now().toString(),
      name: 'New Business',
      description: '',
      projects: [],
    }
    setBusinesses([...businesses, newBusiness])
    setSelectedBusiness(newBusiness)
    setFormData({ name: newBusiness.name, description: newBusiness.description })
  }

  const handleAddProject = () => {
    if (!selectedBusiness) return
    const newProject: BusinessProject = {
      id: Date.now().toString(),
      name: 'New Project',
      tasks: [],
    }
    setBusinesses(
      businesses.map((b) =>
        b.id === selectedBusiness.id
          ? { ...b, projects: [...b.projects, newProject] }
          : b
      )
    )
  }

  const handleAddTask = (projectId: string) => {
    if (!selectedBusiness) return
    const newTask: BusinessTask = {
      id: Date.now().toString(),
      title: 'New Task',
      status: 'To Do',
      dueDate: new Date().toISOString().split('T')[0],
      description: '',
    }
    setBusinesses(
      businesses.map((b) =>
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
  }

  const handleLinkTask = (cornerId: number, taskId: number) => {
    if (!selectedBusiness) return
    const corner = corners.find((c) => c.id === cornerId)
    if (!corner) return
    const task = corner.tasks.find((t) => t.id === taskId)
    if (!task) return
    const newTask: BusinessTask = {
      id: `linked-${task.id}`,
      title: task.title,
      status: task.status,
      dueDate: task.dueDate,
      description: task.description || '',
    }
    setBusinesses(
      businesses.map((b) =>
        b.id === selectedBusiness.id
          ? {
              ...b,
              projects: b.projects.map((p, index) =>
                index === 0 ? { ...p, tasks: [...p.tasks, newTask] } : p
              ),
            }
          : b
      )
    )
    setIsLinkingTask(false)
  }

  const handleLinkToCalendar = (task: BusinessTask, projectId: string) => {
    if (!selectedBusiness) return
    if (typeof window !== 'undefined') {
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
      console.log(`MyBusinessTab: Linked task "${task.title}" to calendar as event ID ${newEvent.id} with business ID ${selectedBusiness.id} and project ID ${projectId}`)
    }
  }

  const particlesOptions: RecursivePartial<IOptions> = {
    particles: {
      number: {
        value: 6,
        density: {
          enable: true,
          height: 40
        },
      },
      color: {
        value: theme === 'light' ? '#000000' : '#ffffff',
      },
      shape: {
        type: 'square',
      },
      opacity: {
        value: 0.8,
      },
      size: {
        value: { min: 1, max: 3 },
      },
      move: {
        enable: true,
        speed: 0.8, // Aumentado de 0.5 para 0.8
        direction: 'none' as const,
        random: true,
        straight: false,
        outModes: {
          default: 'out',
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
  }

  return (
    <div
      className={`min-h-screen p-6 relative ${
        theme === 'light' ? 'bg-gray-100' : 'bg-slate-800'
      }`}
      style={{
        backdropFilter: 'blur(8px)', // Aumentado de 6px para 8px
        WebkitBackdropFilter: 'blur(8px)',
        backgroundColor: theme === 'light' ? 'rgba(243, 244, 246, 0.8)' : 'rgba(30, 41, 59, 0.8)',
      }}
    >
      {init && (
        <Particles
          id="tsparticles"
          options={particlesOptions}
          className="absolute inset-0 z-0"
        />
      )}
      <div className="relative z-10 max-w-7xl mx-auto">
        <motion.h1
          className={`text-4xl font-bold mb-6 ${
            theme === 'light' ? 'text-gray-900' : 'text-white'
          }`} // Aumentado de text-3xl para text-4xl
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          My Business
        </motion.h1>
        <div className="flex space-x-6">
          <motion.div
            className="w-1/4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.button
              onClick={handleAddBusiness}
              className={`w-full mb-4 px-4 py-2 rounded-xl font-semibold transition-colors ${
                theme === 'light'
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
              } shadow-md`}
              variants={buttonVariants}
              whileHover="hover"
            >
              Add Business
            </motion.button>
            <div
              className={`p-4 rounded-xl shadow-md border ${
                theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
              }`} // Adicionada borda
            >
              {businesses.map((business, index) => (
                <motion.div
                  key={business.id}
                  className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
                    selectedBusiness?.id === business.id
                      ? theme === 'light'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-600 text-white'
                      : theme === 'light'
                      ? 'bg-gray-100 text-gray-900'
                      : 'bg-slate-800 text-gray-200'
                  } hover:${
                    theme === 'light'
                      ? 'bg-gradient-to-r from-gray-200 to-gray-300'
                      : 'bg-gradient-to-r from-slate-600 to-slate-700'
                  }`} // Gradiente no hover
                  onClick={() => {
                    setSelectedBusiness(business)
                    setFormData({ name: business.name, description: business.description })
                    setIsEditing(false)
                  }}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: index * 0.1 }}
                >
                  {business.name}
                </motion.div>
              ))}
            </div>
          </motion.div>
          <motion.div
            className="w-3/4"
            variants={cardVariants}
            initial="hidden"
            animate="visible"
          >
            {selectedBusiness ? (
              <div
                className={`p-6 rounded-xl shadow-md border ${
                  theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-700 border-gray-700'
                }`} // Adicionada borda
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
                      className={`w-full p-3 rounded-lg border ${
                        theme === 'light'
                          ? 'border-gray-300 bg-white text-gray-900'
                          : 'border-slate-600 bg-slate-800 text-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Business Name"
                    />
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      className={`w-full p-3 rounded-lg border ${
                        theme === 'light'
                          ? 'border-gray-300 bg-white text-gray-900'
                          : 'border-slate-600 bg-slate-800 text-gray-200'
                      } focus:outline-none focus:ring-2 focus:ring-blue-500`}
                      placeholder="Description"
                      rows={4}
                    />
                    <div className="flex space-x-2">
                      <motion.button
                        onClick={handleSave}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          theme === 'light'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                      >
                        Save
                      </motion.button>
                      <motion.button
                        onClick={() => setIsEditing(false)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          theme === 'light'
                            ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                            : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                      >
                        Cancel
                      </motion.button>
                    </div>
                  </motion.div>
                ) : (
                  <div className="space-y-4">
                    <motion.h2
                      className={`text-2xl font-semibold ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
                      }`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      {selectedBusiness.name}
                    </motion.h2>
                    <motion.p
                      className={`${
                        theme === 'light' ? 'text-gray-700' : 'text-gray-300'
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
                        onClick={() => setIsEditing(true)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          theme === 'light'
                            ? 'bg-blue-500 hover:bg-blue-600 text-white'
                            : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                      >
                        Edit Business
                      </motion.button>
                      <motion.button
                        onClick={handleAddProject}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          theme === 'light'
                            ? 'bg-green-500 hover:bg-green-600 text-white'
                            : 'bg-green-600 hover:bg-green-700 text-gray-100'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                      >
                        Add Project
                      </motion.button>
                      <motion.button
                        onClick={() => setIsLinkingTask(true)}
                        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                          theme === 'light'
                            ? 'bg-yellow-500 hover:bg-yellow-600 text-white'
                            : 'bg-yellow-600 hover:bg-yellow-700 text-gray-100'
                        }`}
                        variants={buttonVariants}
                        whileHover="hover"
                      >
                        Link Task from Tasks
                      </motion.button>
                    </motion.div>
                    <motion.h3
                      className={`text-xl font-semibold mt-6 ${
                        theme === 'light' ? 'text-gray-900' : 'text-white'
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
                          className={`text-lg font-semibold ${
                            theme === 'light' ? 'text-gray-900' : 'text-white'
                          }`}
                        >
                          Select Task to Link
                        </h4>
                        {corners.length > 0 ? (
                          corners.map((corner, index) => (
                            <motion.div
                              key={corner.id}
                              className={`p-4 rounded-lg shadow-sm border ${
                                theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'
                              }`} // Adicionada borda
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.1 }}
                            >
                              <p
                                className={`font-medium ${
                                  theme === 'light' ? 'text-gray-900' : 'text-gray-200'
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
                                      onClick={() => handleLinkTask(corner.id, task.id)}
                                      className={`text-blue-400 hover:underline ${
                                        theme === 'light'
                                          ? 'hover:text-blue-500'
                                          : 'hover:text-blue-300'
                                      }`}
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
                            className={`${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
                            }`}
                          >
                            No tasks available in Tasks.
                          </p>
                        )}
                        <motion.button
                          onClick={() => setIsLinkingTask(false)}
                          className={`px-4 py-2 rounded-xl font-semibold transition-colors ${
                            theme === 'light'
                              ? 'bg-gray-200 hover:bg-gray-300 text-gray-900'
                              : 'bg-slate-600 hover:bg-slate-500 text-gray-200'
                          }`}
                          variants={buttonVariants}
                          whileHover="hover"
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
                              className={`p-4 rounded-lg shadow-sm border ${
                                theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'
                              }`} // Adicionada borda
                              variants={cardVariants}
                              initial="hidden"
                              animate="visible"
                              transition={{ delay: index * 0.1 }}
                            >
                              <div className="flex items-center justify-between">
                                <span
                                  className={`font-medium ${
                                    theme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                  }`}
                                >
                                  {project.name}
                                </span>
                                <motion.button
                                  onClick={() => handleAddTask(project.id)}
                                  className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                    theme === 'light'
                                      ? 'bg-blue-500 hover:bg-blue-600 text-white'
                                      : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
                                  }`}
                                  variants={buttonVariants}
                                  whileHover="hover"
                                >
                                  Add Task
                                </motion.button>
                              </div>
                              <ul className="ml-4 mt-2 space-y-2">
                                {project.tasks.map((task, taskIndex) => (
                                  <motion.li
                                    key={task.id}
                                    className={`p-2 rounded-md ${
                                      theme === 'light' ? 'bg-white' : 'bg-slate-900'
                                    }`}
                                    variants={cardVariants}
                                    initial="hidden"
                                    animate="visible"
                                    transition={{ delay: taskIndex * 0.05 }}
                                  >
                                    <div className="flex items-center justify-between">
                                      <div>
                                        <span
                                          className={`${
                                            theme === 'light' ? 'text-gray-900' : 'text-gray-200'
                                          }`}
                                        >
                                          {task.title} - {task.status} (Due: {task.dueDate})
                                        </span>
                                        {task.description && (
                                          <p
                                            className={`text-sm ${
                                              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
                                            }`}
                                          >
                                            {task.description}
                                          </p>
                                        )}
                                      </div>
                                      <motion.button
                                        onClick={() => handleLinkToCalendar(task, project.id)}
                                        className={`text-blue-400 hover:underline ${
                                          theme === 'light'
                                            ? 'hover:text-blue-500'
                                            : 'hover:text-blue-300'
                                        }`}
                                        variants={buttonVariants}
                                        whileHover="hover"
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
                            className={`${
                              theme === 'light' ? 'text-gray-700' : 'text-gray-300'
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
                className={`${
                  theme === 'light' ? 'text-gray-700' : 'text-gray-300'
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
    </div>
  )
}