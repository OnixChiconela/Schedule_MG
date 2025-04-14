'use client'

import Link from 'next/link'
import { Calendar, CheckSquare, Target } from 'lucide-react'

export default function SideNavbar() {
  return (
    <aside className="fixed left-0 top-0 h-full w-60 bg-white shadow-md p-4 flex flex-col justify-between z-50">
      <div>
        <h1 className="text-2xl font-bold mb-6">Scheour</h1>
        <nav className="flex flex-col gap-4">
          <NavItem href="/tasks" icon={<CheckSquare size={18} />} label="Tasks" />
          <NavItem href="/calendar" icon={<Calendar size={18} />} label="Calendar" />
          <NavItem href="/objectives" icon={<Target size={18} />} label="Objectives" />
        </nav>
      </div>
      <div>
        {/* Pode incluir configurações, logout ou avatar aqui futuramente */}
      </div>
    </aside>
  )
}

function NavItem({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <Link href={href}>
      <div className="flex items-center gap-3 px-2 py-2 rounded-md hover:bg-gray-100 transition-colors cursor-pointer">
        {icon}
        <span className="text-sm font-medium">{label}</span>
      </div>
    </Link>
  )
}
