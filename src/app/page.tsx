'use client'

import dynamic from 'next/dynamic'
import { useState } from 'react'
import { Sun, Moon } from 'lucide-react'
import SideNavbar from './components/navbars/SideNavbar'

const ThreeCanvas = dynamic(() => import('@/app/components/canvas/ThreeCanvas'), { ssr: false })

export default function Home() {
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  const toggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'))
  }

  return (
    <main className={`h-screen flex ${theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'} transition-colors duration-300`}>
      <SideNavbar theme={theme} toggleTheme={toggleTheme} />
      <div className="flex-1 ml-60 relative">
        <button
          onClick={toggleTheme}
          className={`absolute top-4 right-4 p-2 rounded-md ${
            theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-700 hover:bg-slate-600'
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <ThreeCanvas theme={theme} />
      </div>
    </main>
  )
}