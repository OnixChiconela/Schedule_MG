'use client'

import Link from 'next/link'
import { Calendar, CheckSquare, Target } from 'lucide-react'

interface SideNavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function SideNavbar({ theme }: SideNavbarProps) {
  return (
    <aside
      className={`fixed left-0 top-0 h-full w-60 shadow-md p-4 flex flex-col justify-between z-50 ${
        theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'
      } transition-colors duration-300`}
    >
      <div>
        <h1 className="text-2xl font-bold mb-6">Scheour</h1>
        <nav className="flex flex-col gap-4">
          <NavItem
            href="/tasks"
            icon={<CheckSquare size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />}
            label="Tasks"
            theme={theme}
          />
          <NavItem
            href="/calendar"
            icon={<Calendar size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />}
            label="Calendar"
            theme={theme}
          />
          <NavItem
            href="/objectives"
            icon={<Target size={18} className={theme === 'light' ? 'text-gray-600' : 'text-gray-300'} />}
            label="Objectives"
            theme={theme}
          />
        </nav>
      </div>
      <div>
        {/* Pode incluir configurações, logout ou avatar aqui futuramente */}
      </div>
    </aside>
  )
}

function NavItem({
  href,
  icon,
  label,
  theme,
}: {
  href: string
  icon: React.ReactNode
  label: string
  theme: 'light' | 'dark'
}) {
  return (
    <Link href={href}>
      <div
        className={`flex items-center gap-3 px-2 py-2 rounded-md transition-colors cursor-pointer ${
          theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-700'
        }`}
      >
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  )
}