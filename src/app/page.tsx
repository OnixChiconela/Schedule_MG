'use client'

import dynamic from 'next/dynamic'
import { Sun, Moon } from 'lucide-react'
import SideNavbar from './components/navbars/SideNavbar'
import { useTheme } from './themeContext'

const ThreeCanvas = dynamic(() => import('@/app/components/canvas/ThreeCanvas'), { ssr: false })

export default function Home() {
  const { theme, toggleTheme } = useTheme()
  console.log(`Home: Received theme ${theme}`)

  return (
    <main className={`h-screen flex ${theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'} transition-colors duration-300 relative`}>
      <SideNavbar theme={theme} toggleTheme={toggleTheme} />
      <div className="flex-1 ml-60">
        <button
          onClick={() => {
            toggleTheme()
          }}
          className={`absolute top-4 right-4 p-2 rounded-md z-50 pointer-events-auto ${
            theme === 'light' ? 'bg-gray-100 hover:bg-gray-200' : 'bg-slate-700 hover:bg-slate-600'
          } transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
          aria-label={`Alternar para modo ${theme === 'light' ? 'escuro' : 'claro'}`}
          data-testid="theme-toggle"
        >
          {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
        </button>
        <ThreeCanvas theme={theme} />
      </div>
    </main>
  )
}