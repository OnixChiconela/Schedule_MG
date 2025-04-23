'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

export default function FeedbackPage() {
  const [feedback, setFeedback] = useState('')
  const [suggestionsFeedback, setSuggestionsFeedback] = useState('')
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const handleSubmit = () => {
    if (!feedback.trim()) {
      toast.error('Por favor, insira seu feedback.')
      return
    }
    console.log('FeedbackPage: Submitted', { feedback, suggestionsFeedback })
    toast.success('Obrigado pelo feedback!')
    setFeedback('')
    setSuggestionsFeedback('')
  }

  return (
    <div className="p-6 min-h-screen bg-gray-100 dark:bg-slate-900">
      <h2 className={`text-xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
        Enviar Feedback
      </h2>
      <div className="max-w-md mx-auto">
        <textarea
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Seu feedback sobre a plataforma..."
          rows={4}
          className={`w-full p-3 mb-4 rounded-lg border ${
            theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-800 text-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <textarea
          value={suggestionsFeedback}
          onChange={(e) => setSuggestionsFeedback(e.target.value)}
          placeholder="O que achou das sugestões de eventos/projetos?"
          rows={4}
          className={`w-full p-3 mb-4 rounded-lg border ${
            theme === 'light' ? 'border-gray-300 bg-white text-gray-900' : 'border-slate-600 bg-slate-800 text-gray-200'
          } focus:outline-none focus:ring-2 focus:ring-blue-500`}
        />
        <motion.button
          onClick={handleSubmit}
          className={`w-full py-3 rounded-lg font-semibold ${
            theme === 'light' ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-gray-100'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Enviar
        </motion.button>
      </div>
    </div>
  )
}