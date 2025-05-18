'use client'

import { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Calendar, ArrowLeft } from 'lucide-react'
import ProjectTasksPage from './ProjectTaskPage'

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

interface AllProjectsPageProps {
  projects: BusinessProject[]
  theme: string
  formatDate: (date: string) => string
  onAddTask: (projectId: string) => void
  onLinkToCalendar: (task: BusinessTask, projectId: string) => void
  onDeleteProject: (projectId: string) => void
  onBack: () => void
}

export default function AllProjectsPage({
  projects,
  theme,
  formatDate,
  onAddTask,
  onLinkToCalendar,
  onDeleteProject,
  onBack,
}: AllProjectsPageProps) {
  const [isProjectMenuOpen, setIsProjectMenuOpen] = useState<string | null>(null)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  const safeTheme = theme || 'light'

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsProjectMenuOpen(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  if (selectedProjectId) {
    const selectedProject = projects.find((project) => project.id === selectedProjectId)
    return (
      <ProjectTasksPage
        project={selectedProject!}
        theme={safeTheme}
        formatDate={formatDate}
        onLinkToCalendar={onLinkToCalendar}
        onBack={() => setSelectedProjectId(null)}
      />
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <motion.button
          onClick={onBack}
          className={`p-2 rounded-full ${safeTheme === 'light' ? 'bg-gray-200 hover:bg-gray-300' : 'bg-slate-600 hover:bg-slate-500'}`}
          variants={buttonVariants}
          whileHover="hover"
          whileTap="tap"
        >
          <ArrowLeft className={safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'} />
        </motion.button>
        <h3 className={`text-xl font-semibold ${safeTheme === 'light' ? 'text-gray-900' : 'text-white'}`}>
          All Projects
        </h3>
      </div>
      <ul className="space-y-4">
        {projects.map((project, index) => (
          <motion.li
            key={project.id}
            className={`p-4 rounded-lg shadow-sm border ${safeTheme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between relative">
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
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
                  className={`font-semibold ${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
                >
                  {project.name}
                </span>
              </div>
              <div className="relative">
                <motion.button
                  onClick={() => setIsProjectMenuOpen(project.id)}
                  className={`rounded-xl font-bold transition-colors bg-transparent border-2 px-1 justify-center ${safeTheme === 'light'
                    ? 'border-neutral-300 hover:border-neutral-400'
                    : 'border-slate-300 text-neutral-200 hover:border-slate-400'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  <MoreHorizontal />
                </motion.button>
                {isProjectMenuOpen === project.id && (
                  <motion.div
                    ref={menuRef}
                    className={`absolute right-0 px-3 w-40 mt-2 p-1 rounded-md border-2 shadow-lg 
                        ${safeTheme === 'light' ? 'bg-neutral-100 border-neutral-200' : 'bg-slate-800/90 border-slate-500'} ring-opacity-5`}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.button
                      onClick={() => {
                        onAddTask(project.id)
                        setIsProjectMenuOpen(null)
                      }}
                      className={`w-full flex text-left rounded-md px-4 py-2 text-base items-center gap-2 ${safeTheme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-600'}`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Add Task
                    </motion.button>
                    <motion.button
                      onClick={() => {
                        onDeleteProject(project.id)
                        setIsProjectMenuOpen(null)
                      }}
                      className={`w-full text-left px-4 py-2 text-sm ${safeTheme === 'light' ? 'text-red-600 hover:bg-gray-100' : 'text-red-400 hover:bg-slate-600'}`}
                      variants={buttonVariants}
                      whileHover="hover"
                      whileTap="tap"
                    >
                      Delete
                    </motion.button>
                  </motion.div>
                )}
              </div>
            </div>
            {project.description && (
              <p
                className={`text-sm mt-2 ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {project.description}
              </p>
            )}
            <ul className="ml-0 mt-2 space-y-2">
              {project.tasks.slice(0, 3).map((task, taskIndex) => (
                <motion.li
                  key={task.id}
                  className={`p-2 rounded-md border-1 ${safeTheme === 'light' ? 'bg-neutral-50 border-neutral-100' : 'bg-slate-800/50 border-slate-900'}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: taskIndex * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
                      >
                        {task.title} - <a>{task.status}</a> (Due: {formatDate(task.dueDate)})
                      </span>
                      {task.description && (
                        <p
                          className={`text-sm ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                    <div className="relative group">
                      <motion.button
                        onClick={() => onLinkToCalendar(task, project.id)}
                        className={`${safeTheme === 'light' ? 'text-fuchsia-800 hover:text-fuchsia-500' : 'text-fuchsia-300 hover:text-fuchsia-400'}`}
                        variants={buttonVariants}
                        whileHover="hover"
                        whileTap="tap"
                      >
                        <Calendar className="w-5 h-5" />
                      </motion.button>
                      <span
                        className={`absolute right-0 top-8 mt-2 w-max px-2 py-1 text-sm rounded-md shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 ${safeTheme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-600 text-gray-200'}`}
                      >
                        Add to Calendar
                      </span>
                    </div>
                  </div>
                </motion.li>
              ))}
              {project.tasks.length > 3 && (
                <motion.button
                  onClick={() => setSelectedProjectId(project.id)}
                  className={`mt-2 text-sm font-semibold ${safeTheme === 'light' ? 'text-gray-600 hover:text-gray-800' : 'text-gray-400 hover:text-gray-200'}`}
                  variants={buttonVariants}
                  whileHover="hover"
                  whileTap="tap"
                >
                  Show More ({project.tasks.length - 3} more)
                </motion.button>
              )}
            </ul>
          </motion.li>
        ))}
      </ul>
    </div>
  )
}