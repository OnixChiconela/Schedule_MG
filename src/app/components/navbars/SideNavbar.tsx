'use client'
import Link from 'next/link'

interface SideNavbarProps {
  theme: 'light' | 'dark'
  toggleTheme: () => void
}

export default function SideNavbar({ theme, toggleTheme }: SideNavbarProps) {
  return (
    <nav className={`p-4 ${theme === 'light' ? 'bg-gray-100' : 'bg-slate-800'} text-white fixed w-[260px] h-screen`}>
      <Link href="/calendar" className={`block p-2 hover:bg-slate-700 ${theme === 'light' ? 'text-neutral-900' : ''}`}>Calendar</Link>
      <Link href="/tasks" className={`block p-2 hover:bg-slate-700 ${theme === 'light' ? 'text-neutral-900' : ''}`}>Tasks</Link>
      <Link href="/business" className={`block p-2 hover:bg-slate-700 ${theme === 'light' ? 'text-neutral-900' : ''}`}>My Business</Link>
    </nav>
  )
}