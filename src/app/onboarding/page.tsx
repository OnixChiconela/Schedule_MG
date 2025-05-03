'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { toast } from 'react-hot-toast'
import { useTheme } from '../themeContext'
import { MoonStar, Sun } from 'lucide-react'

const categories = ['Technology', 'Art', 'Finance', 'Education', 'Health', 'Travel', 'Music']

export default function Onboarding() {
  const router = useRouter()
  const { theme, toggleTheme } = useTheme()

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
      toast.error('Select at least 3 interest.')
      return
    }
    const userPreferences = { userId: 'default-user', interests: selectedInterests }
    localStorage.setItem('userPreferences', JSON.stringify(userPreferences))
    console.log('Onboarding: Saved user preferences', userPreferences)
    toast.success('Bem-vindo! Vamos começar!')
    router.push('/calendar')
  }

  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  return (
    <div className={`min-h-screen flex items-center justify-center bg-gradient-to-br ${theme == "light" ? 'from-white via-neutral-200/60  to-purple-600/60' : 'from-slate-800 via-neutral-600  to-purple-600/90'}
    transition-colors duration-300`}>
      <div className='absolute bottom-8'>
        <motion.button
          onClick={toggleTheme}
          whileHover="hover"
          whileTap="tap"
          variants={buttonVariants}
          className={`px-3 py-2 rounded-lg ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-800 text-gray-200'}`}
        >
          {theme == "light" ?
            <Sun size={20} /> :
            <div>
              {/* {init && (
                <Particles
                  id="tsparticles"
                  options={particlesOptions}
                  className="absolute inset-0 z-0"
                />
              )} */}
              {/* <Particles 
                id='tsparticles'
              /> */}
              <MoonStar size={20} />
            </div>
          }
         
        </motion.button>
      </div>
      <motion.div
        className={`p-8 bg-white dark:bg-slate-800 rounded-xl shadow-lg shadow-neutral-600 max-w-2xl w-full`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1 className="text-2xl font-bold mb-4 text-gray-900 dark:text-gray-100">
          Personilize your experience.
        </h1>
        <p className="mb-6 text-gray-600 dark:text-gray-300">
          Select between 3 to 5 interest so we can give you personilized suggestions
        </p>
        <div className="gap-2 grid grid-cols-3 mb-6">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => handleInterestToggle(category)}
              className={`w-full p-4 rounded-lg text-left ${selectedInterests.includes(category)
                ? 'bg-fuchsia-800/60 text-white'
                : 'bg-gray-200 dark:bg-slate-600 text-gray-900 dark:text-gray-200'
                }`}
            >
              {category}
            </button>
          ))}
        </div>
        <motion.button
          onClick={handleStart}
          className="w-full py-3 bg-neutral-950 text-white rounded-lg font-semibold hover:bg-black"
          whileHover={{ scale: 1.01 }}
          whileTap={{ scale: 0.95 }}
        >
          Começar
        </motion.button>
      </motion.div>
    </div>
  )
}