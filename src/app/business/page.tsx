'use client'

import MyBusinessTab from "../components/my-business/MyBusinessTab"

import { useTheme } from "../themeContext"
import TrackingNav from "../components/navbars/trackingNav"

export default function Business() {
    const { theme } = useTheme()

    return (
        <>
            <main className={`flex h-screen w-full ${theme === 'light'} transition-colors duration-300 relative`}>
            <TrackingNav
                themeButton={false}
            />
                <div className="flex pt-24">
                    <MyBusinessTab />
                </div>
            </main>
        </>
    )
}