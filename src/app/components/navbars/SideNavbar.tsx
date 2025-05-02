'use client'

import Link from 'next/link'
import { motion } from 'framer-motion'
import { BriefcaseBusiness, Calendar, Car, Home, Mail, MoonStar, PenBox, Sun } from 'lucide-react'
import { IconType } from 'react-icons'

interface SideNavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function SideNavbar({ theme, toggleTheme }: SideNavbarProps) {
  const buttonVariants = {
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 },
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
              <MoonStar size={20} />
            </div>
          }
        </motion.button>
      </div>

      <ul>
        <li>
          <SideNavButton
            title='Home'
            link='/dashboard'
            icon={Home}
            theme={theme}
          />
        </li>
      </ul>
      <div className='py-2'><hr className={`${theme == "light" ? "text-gray-300" : "text-neutral-700"}`} /></div>
      <ul className="flex flex-col ">
        <li>
          <SideNavButton
            title='Tasks'
            link='/task'
            icon={PenBox}
            theme={theme}
          />
        </li>
        <li>
          <SideNavButton
            title='Calendar'
            link='/calendar'
            icon={Calendar}
            theme={theme}
          />
        </li>
        <div className='py-2'><hr className={`${theme == "light" ? "text-gray-300" : "text-neutral-700"}`} /></div>

        <li>
          <SideNavButton
            title='My business'
            link='/business'
            icon={BriefcaseBusiness}
            theme={theme}
          />
        </li>
        <li>
          <SideNavButton
            title='Feedback'
            link='/feedback'
            icon={Mail}
            theme={theme}
          />
        </li>
        <div className='py-2'><hr className={`${theme == "light" ? "text-gray-300" : "text-neutral-700"}`} /></div>
        <li>
          <SideNavButton
            title='Roadmap'
            link='/tracking'
            icon={Car}
            theme={theme}
          />
        </li>

      </ul>

    </motion.nav>
  )
}

const SideNavButton = ({ title, link, icon: Icon, theme }: { title: string, link?: string, icon: IconType, theme: "light" | "dark" }) => {
  // const { theme } = useTheme()
  return (
    <Link href={link!}>
      <span className={`flex gap-1 p-2 rounded-lg hover:bg-fuchsia-800/50 hover:text-white ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
        <Icon size={22} />
        {title}
      </span>
    </Link>
  )
}