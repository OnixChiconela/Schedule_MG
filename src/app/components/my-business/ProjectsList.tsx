'use client'

import { useTheme } from '@/app/themeContext'
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
  description?: string
  tasks: BusinessTask[]
}

interface ProjectsListProps {
  projects: BusinessProject[]
  formatDate: (date: string) => string
  onAddTask: (projectId: string) => void
  onLinkToCalendar: (task: BusinessTask, projectId: string) => void
}

export default function ProjectsList({
  projects,
  formatDate,
  onAddTask,
  onLinkToCalendar,
}: ProjectsListProps) {
  const {theme} = useTheme()

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  return (
    <ul className="space-y-4">
      {projects.length > 0 ? (
        projects.map((project, index) => (
          <motion.li
            key={project.id}
            className={`p-4 rounded-lg shadow-sm border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <svg
                  className={`w-5 h-5 mr-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
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
                  className={`font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
                >
                  {project.name}
                </span>
              </div>
              <motion.button
                onClick={() => onAddTask(project.id)}
                className={`px-3 py-1 rounded-lg font-semibold transition-colors border-2 ${theme === 'light' ? 'bg-gray-200 text-black hover:bg-gray-300' : 'bg-slate-600 text-gray-200 hover:bg-slate-500'}`}
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Add Task
              </motion.button>
            </div>
            {project.description && (
              <p
                className={`text-sm mt-2 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
              >
                {project.description}
              </p>
            )}
            <ul className="ml-0 mt-2 space-y-2">
              {project.tasks.map((task, taskIndex) => (
                <motion.li
                  key={task.id}
                  className={`p-2 rounded-md border-1 ${theme === 'light' ? 'bg-neutral-50 border-neutral-100' : 'bg-slate-800/50 border-slate-900'}`}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ delay: taskIndex * 0.05 }}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span
                        className={`${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
                      >
                        {task.title} - <a>{task.status}</a> (Due: {formatDate(task.dueDate)})
                      </span>
                      {task.description && (
                        <p
                          className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
                        >
                          {task.description}
                        </p>
                      )}
                    </div>
                    <motion.button
                      onClick={() => onLinkToCalendar(task, project.id)}
                      className={`hover:underline ${theme === 'light' ? 'text-fuchsia-800 hover:text-fuchsia-500' : 'text-fuchsia-300 hover:text-fuchsia-400'}`}
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
          className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
        >
          No projects assigned.
        </motion.p>
      )}
    </ul>
  )
}