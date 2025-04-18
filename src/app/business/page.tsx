'use client'

import MyBusinessTab from "../components/my-business/MyBusinessTab"
import SideNavbar from "../components/navbars/SideNavbar"
import { useTheme } from "../themeContext"

export default function Business() {
    const { theme, toggleTheme } = useTheme()

    return (
        <main className={`flex h-screen w-full ${theme === 'light' ? 'bg-white text-black' : 'bg-slate-800 text-gray-200'} transition-colors duration-300 relative`}>
            <SideNavbar theme={theme} toggleTheme={toggleTheme} />
            <div className="flex-1">
                <MyBusinessTab />
            </div>
        </main>
    )
}