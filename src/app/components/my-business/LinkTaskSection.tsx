'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import ProjectSelector from './BusinessProjectSelector'
import { useTheme } from '@/app/themeContext'

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

interface LinkTaskSectionProps {
  corners: Corner[]
  selectedProjectId: string | null
  onLinkTask: (cornerId: number, taskId: number) => void
  onCancel: () => void
}

export default function LinkTaskSection({
  corners,
  selectedProjectId,
  onLinkTask,
  onCancel,
}: LinkTaskSectionProps) {
  const {theme} = useTheme()

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
  }

  return (
    <motion.div
      className="space-y-4"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <h4
        className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
      >
        Select Task to Link
      </h4>
      <div>
        <label
          className={`block text-sm font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
        >
          Select Project
        </label>
        <ProjectSelector
          projects={[]}
          selectedProjectId={selectedProjectId}
          onSelect={(id) => id}
          theme={theme}
        />
        {!selectedProjectId && (
          <p
            className={`text-sm ${theme === 'light' ? 'text-red-600' : 'text-red-400'} mt-1`}
          >
            Please select a project
          </p>
        )}
      </div>
      {corners.length > 0 ? (
        corners.map((corner, index) => (
          <motion.div
            key={corner.id}
            className={`p-4 rounded-lg shadow-sm border ${theme === 'light' ? 'bg-gray-50 border-gray-200' : 'bg-slate-800 border-gray-700'}`}
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            transition={{ delay: index * 0.1 }}
          >
            <p
              className={`font-medium ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}
            >
              {corner.title}
            </p>
            <ul className="ml-2 mt-2 space-y-1">
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
                      onLinkTask(corner.id, task.id)
                    }}
                    className={`hover:underline cursor-pointer ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'}`}
                    disabled={!selectedProjectId}
                  >
                    {task.title} - <span className={`${theme === 'light' ? 'text-fuchsia-800' : 'text-fuchsia-300'}`}>{task.status}</span>
                  </button>
                </motion.li>
              ))}
            </ul>
          </motion.div>
        ))
      ) : (
        <p
          className={`${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}
        >
          No tasks available in Tasks.
        </p>
      )}
      <motion.button
        onClick={onCancel}
        className={`px-4 py-2 rounded-xl font-semibold transition-colors ${theme === 'light' ? 'bg-gray-200 hover:bg-gray-300 text-gray-900' : 'bg-slate-600 hover:bg-slate-500 text-gray-200'}`}
        variants={buttonVariants}
        whileHover="hover"
        whileTap="tap"
      >
        Cancel
      </motion.button>
    </motion.div>
  )
}