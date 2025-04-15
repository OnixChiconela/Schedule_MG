'use client'

import { useState } from 'react'

type Corner = {
  id: number
  title: string
  tasks: {
    id: number
    title: string
    status: 'To Do' | 'In Progress' | 'Done'
    createdDate: string
    dueDate: string
    priority: 'Low' | 'Medium' | 'High'
    isCompleted: boolean
  }[]
}

interface ProjectSelectorProps {
  corners: Corner[]
  selectedCornerId: number | null
  onSelect: (id: number | null) => void
}

const ProjectSelector: React.FC<ProjectSelectorProps> = ({
  corners,
  selectedCornerId,
  onSelect,
}) => {
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')

  const filteredCorners = corners.filter((corner) =>
    corner.title.toLowerCase().includes(search.toLowerCase())
  )

  const handleSelect = (id: number) => {
    onSelect(id)
    setIsOpen(false)
    setSearch('')
  }

  return (
    <div className="relative w-full max-w-md">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full bg-white border border-gray-300 rounded-xl px-4 py-2 text-left flex items-center justify-between"
      >
        <span>
          {selectedCornerId
            ? corners.find((c) => c.id === selectedCornerId)?.title || 'Select a Corner'
            : 'Select a Corner'}
        </span>
        <svg
          className={`w-5 h-5 transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute z-10 w-full mt-1 bg-white border border-gray-300 rounded-xl shadow-lg max-h-64 overflow-y-auto">
          <div className="p-2">
            <input
              type="text"
              placeholder="Search Corners..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-xl"
              autoFocus
            />
          </div>
          {filteredCorners.length === 0 ? (
            <div className="px-4 py-2 text-gray-500">No Corners found.</div>
          ) : (
            filteredCorners.map((corner) => (
              <button
                key={corner.id}
                onClick={() => handleSelect(corner.id)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 transition"
              >
                {corner.title}
              </button>
            ))
          )}
          {filteredCorners.length > 0 && <hr className="my-2 border-gray-200" />}
          <div className="px-4 py-2 text-gray-400">
            <button
              onClick={() => setIsOpen(false)}
              className="w-full text-left hover:bg-gray-100 transition"
              disabled
            >
              New View (Coming Soon)
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default ProjectSelector