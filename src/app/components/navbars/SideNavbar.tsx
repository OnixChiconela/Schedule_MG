'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { MoonStar, Sun } from 'lucide-react'
import { IOptions, RecursivePartial } from 'node_modules/@tsparticles/engine/types/export-types'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'

interface SideNavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function SideNavbar({ theme, toggleTheme }: SideNavbarProps) {
  const [init, setInit] = useState(false)
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
  }

  useEffect(() => {
    console.log('Initializing particles engine')
    initParticlesEngine(async (engine) => {
      try {
        await loadSlim(engine)
        setInit(true)
        console.log('Particles engine initialized')
      } catch (error) {
        console.error('Error initializing particles:', error)
        setInit(false)
      }
    })
  }, [])

  const particlesOptions: RecursivePartial<IOptions> = {
    particles: {
      number: {
        value: 4,
        density: {
          enable: true,
          height: 30, // Mantido conforme pedido
        },
      },
      color: {
        value: theme === 'light' ? '#000000' : '#ffffff',
      },
      shape: {
        type: 'star',
      },
      opacity: {
        value: 0.1,
      },
      size: {
        value: { min: 1, max: 2 },
      },
      move: {
        enable: true,
        speed: 0.8,
        direction: 'none' as const,
        random: true,
        straight: false,
        outModes: {
          default: 'split',
        },
      },
    },
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 4,
          duration: 0.4,
        },
      },
    },
  }

  return (
    <motion.nav
      className={`p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-950/50'} text-white fixed w-[260px] h-screen items-center`}
      initial={{ x: -64 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className='flex mb-6 items-center justify-between'>
        <h2 className={`text-2xl font-bold  ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
          Scheuor
        </h2>
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

      <ul className="space-y-4">
        <li>
          <Link href="/calendar">
            <span className={`block p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Calendar
            </span>
          </Link>
        </li>
        <li>
          <Link href="/business">
            <span className={`block p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Business
            </span>
          </Link>
        </li>
        <li>
          <Link href="/feedback">
            <span className={`block p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme === 'light' ? 'text-gray-900' : 'text-gray-200'}`}>
              Feedback
            </span>
          </Link>
        </li>
      </ul>

    </motion.nav>
  )
}