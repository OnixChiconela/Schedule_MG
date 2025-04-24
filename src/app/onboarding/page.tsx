'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'

const categories = ['Technology', 'Art', 'Finance', 'Education', 'Health', 'Travel', 'Music']

export default function Onboarding() {
  const router = useRouter()
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])

  const handleInterestToggle = (category: string) => {
    setSelectedInterests((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : prev.length < 5
        ? [...prev, category]
        : prev
    )
  }

  const handleStart = () => {
    if (selectedInterests.length < 3) {
      toast.error('Selecione pelo menos 3 interesses.')
      return
    }
    const userPreferences = { userId: 'default-user', interests: selectedInterests }
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences))
    console.log('Onboarding: Saved user preferences', userPreferences)
    toast.success('Bem-vindo! Vamos começar!')
    router.push('/calendar')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
      <motion.div
        className="p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg max-w-md w-full"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Personalize Sua Experiência
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Selecione 3 a 5 interesses para receber sugestões personalizadas:
        </p>
        <div className="space-y-2 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleInterestToggle(category)}
              className={`w-full p-2 rounded-lg text-left ${
                selectedInterests.includes(category)
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
        <motion.button
          onClick={handleStart}
          className="w-full py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Começar
        </motion.button>
      </motion.div>
    </div>
  )
}