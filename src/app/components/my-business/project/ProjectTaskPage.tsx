'use client'

import { motion } from 'framer-motion'
import { Calendar, ArrowLeft } from 'lucide-react'

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

interface ProjectTasksPageProps {
  project: BusinessProject
  theme: string
  formatDate: (date: string) => string
  onLinkToCalendar: (task: BusinessTask, projectId: string) => void
  onBack: () => void
}

export default function ProjectTasksPage({
  project,
  theme,
  formatDate,
  onLinkToCalendar,
  onBack,
}: ProjectTasksPageProps) {
  const safeTheme = theme || 'light'

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
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
          Tasks for {project.name}
        </h3>
      </div>
      {project.description && (
        <p className={`text-sm ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
          {project.description}
        </p>
      )}
      <ul className="space-y-2">
        {project.tasks.map((task, taskIndex) => (
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
                <span className={`${safeTheme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
                  {task.title} - <a>{task.status}</a> (Due: {formatDate(task.dueDate)})
                </span>
                {task.description && (
                  <p className={`text-sm ${safeTheme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
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
      </ul>
    </div>
  )
}