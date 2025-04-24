'use client'

import Link from 'next/link'
import { useState } from 'react'
import { motion } from 'framer-motion'

interface SideNavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function SideNavbar({ theme, toggleTheme }: SideNavbarProps) {
  // const [theme, setTheme] = useState<'light' | 'dark'>('light')

  // const toggleTheme = () => {
  //   setTheme(theme === 'light' ? 'dark' : 'light')
  // }

  return (
    <motion.nav
    className={`p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-900'} text-white fixed w-[260px] h-screen`}
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <h2 className={`text-2xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
        Scheuor
      </h2>
      <ul className="space-y-4">
        <li>
          <Link href="/calendar">
            <span className={`block p-2 rounded-lg hover:bg-blue-500 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Calendar
            </span>
          </Link>
        </li>
        <li>
          <Link href="/business">
            <span className={`block p-2 rounded-lg hover:bg-blue-500 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Business
            </span>
          </Link>
        </li>
        <li>
          <Link href="/feedback">
            <span className={`block p-2 rounded-lg hover:bg-blue-500 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Feedback
            </span>
          </Link>
        </li>
      </ul>
      <button
        onClick={toggleTheme}
        className={`mt-4 px-4 py-2 rounded-lg ${theme === 'light' ? 'bg-gray-200 text-gray-900' : 'bg-slate-700 text-gray-200'}`}
      >
        Alternar Tema
      </button>
    </motion.nav>
  )
}