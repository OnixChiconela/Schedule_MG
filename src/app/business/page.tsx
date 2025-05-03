'use client'

import { useState } from "react"
import MyBusinessTab from "../components/my-business/MyBusinessTab"
import Navbar from "../components/navbars/Navbar"
import SideNavbar from "../components/navbars/SideNavbar"
import { useTheme } from "../themeContext"
import TrackingNav from "../components/navbars/trackingNav"

export default function Business() {
    const { theme, toggleTheme } = useTheme()
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    return (
        <>
            <main className={`flex h-screen w-full ${theme === 'light'} transition-colors duration-300 relative`}>
            <TrackingNav
                themeButton={false}
            />
                {/* <SideNavbar theme={theme} toggleTheme={toggleTheme} /> */}
                <div className="flex pt-24">
                    <MyBusinessTab />
                </div>
            </main>
        </>
    )
}