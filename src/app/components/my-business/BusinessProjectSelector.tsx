'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface Project {
  id: string
  name: string
}

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: string | null
  onSelect: (projectId: string | null) => void
  theme: 'light' | 'dark'
}

export default function ProjectSelector({
  projects,
  selectedProjectId,
  onSelect,
  theme,
}: ProjectSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const selectedProject = projects.find((p) => p.id === selectedProjectId)

  return (
    <div className="relative" ref={ref}>
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-md border flex items-center justify-between ${
          theme === 'light'
            ? 'bg-white border-gray-300 text-gray-900'
            : 'bg-slate-800 border-slate-600 text-gray-200'
        } shadow-sm hover:${
          theme === 'light' ? 'bg-gray-50' : 'bg-slate-700'
        } transition-colors`}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <div className="flex items-center">
          <svg
            className={`w-5 h-5 mr-2 ${
              theme === 'light' ? 'text-gray-600' : 'text-gray-400'
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
          <span>{selectedProject ? selectedProject.name : 'Select a project'}</span>
        </div>
        <svg
          className={`w-4 h-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </motion.button>
      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute z-10 mt-1 w-full rounded-md shadow-lg border ${
              theme === 'light' ? 'bg-white border-gray-200' : 'bg-slate-800 border-slate-600'
            } max-h-60 overflow-auto`}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {projects.length > 0 ? (
              projects.map((project) => (
                <motion.div
                  key={project.id}
                  className={`p-3 flex items-center cursor-pointer transition-colors ${
                    selectedProjectId === project.id
                      ? theme === 'light'
                        ? 'bg-blue-100 text-blue-900'
                        : 'bg-slate-600 text-white'
                      : theme === 'light'
                      ? 'text-gray-900 hover:bg-gray-100'
                      : 'text-gray-200 hover:bg-slate-700'
                  }`}
                  onClick={() => {
                    onSelect(project.id)
                    setIsOpen(false)
                  }}
                  whileHover={{ backgroundColor: theme === 'light' ? '#f3f4f6' : '#4b5563' }}
                >
                  <svg
                    className={`w-4 h-4 mr-2 ${
                      theme === 'light' ? 'text-gray-600' : 'text-gray-400'
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
                  <span>{project.name}</span>
                </motion.div>
              ))
            ) : (
              <div className={`p-3 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                No projects available
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}