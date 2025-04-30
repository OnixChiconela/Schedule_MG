'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Briefcase, BriefcaseBusiness, Calendar, Car, Mail, MoonStar, PenBox, Sun } from 'lucide-react'
import { IOptions, RecursivePartial } from 'node_modules/@tsparticles/engine/types/export-types'
import Particles, { initParticlesEngine } from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { useTheme } from '@/app/themeContext'
import { IconType } from 'react-icons'

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

      <ul className="flex flex-col ">
        <li>
          <SideNavButton
            title='Tasks'
            link='/calendar'
            icon={PenBox}
          />
        </li>
        <li>
          <SideNavButton
            title='Calendar'
            link='/calendar'
            icon={Calendar}
          />
        </li>
        <li>
          <SideNavButton
            title='Calendar'
            link='/business'
            icon={BriefcaseBusiness}
          />
        </li>
        <li>
          <SideNavButton
            title='Feedback'
            link='/feedback'
            icon={Mail}
          />
        </li>
        <li>
          <SideNavButton
            title='Roadmap'
            link='/tracking'
            icon={Car}
          />
        </li>
        
      </ul>

    </motion.nav>
  )
}

const SideNavButton = ({ title, link, icon: Icon }: { title: string, link?: string, icon: IconType }) => {
  const { theme } = useTheme()
  return (
    <Link href={link!}>
      <span className={`flex gap-1 p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme == 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
        <Icon size={22} />
        {title}
      </span>
    </Link>
  )
}