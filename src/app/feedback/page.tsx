'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useTheme } from '../themeContext'

export default function FeedbackPage() {
  const {theme} = useTheme()
  const [feedback, setFeedback] = useState('')
  const [suggestionsFeedback, setSuggestionsFeedback] = useState('')

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast.error(`Can't send know.`)
      return
    }
    toast.success('!')
    setFeedback('')
    setSuggestionsFeedback('')
  }

  return (
    <div className={`p-6 min-h-screen ${theme == "light" ? "bg-gray-100": "bg-slate-900"}`}>
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
        Feedback
      </h2>
      <div className="max-w-md mx-auto">
        {/* <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Give your feedback..."
          rows={4}
          className={`w-full p-3 mb-4 rounded-lg border ${
            theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-800 text-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        /> */}
        {/* <textarea
          value={suggestionsFeedback}
          onChange={(e) => setSuggestionsFeedback(e.target.value)}
          placeholder="O que achou das sugestões de eventos/projetos?"
          rows={4}
          className={`w-full p-3 mb-4 rounded-lg border ${
            theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-800 text-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        /> */}
        <motion.a
          href="mailto:josechiconela@icloud.com"
          className={`w-full items-center justify-center flex py-3 cursor-pointer
            rounded-lg font-semibold ${theme === 'light' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
            }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {/* <a
            href="mailto:josechiconela@icloud.com"
            className={`${theme === 'light'
              ? 'text-gray-200 hover:text-fuchsia-600'
              : 'text-neutral-200 hover:text-fuchsia-400'
              } transition`}
          >
            Contact Us
          </a> */}
          Contact
        </motion.a>
      </div>
    </div>
  )
}