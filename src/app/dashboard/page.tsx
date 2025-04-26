"use client"

import { useRouter } from "next/navigation";
import ThreeCanvas from "../components/canvas/ThreeCanvas";
import ClientOnly from "../components/ClientOnly"
import SideNavbar from "../components/navbars/SideNavbar"
import { ThemeProvider, useTheme } from "../themeContext"
import { motion } from "framer-motion"
import { format, getYear } from 'date-fns';

//fake data for now
const upcomingItems = [
    {
        id: 1,
        title: 'Team Meeting',
        date: '2025-04-28T10:00:00',
        category: 'Business',
    },
    {
        id: 2,
        title: 'AI Workshop',
        date: '2025-05-01T14:00:00',
        category: 'Tecnologia',
    },
    {
        id: 3,
        title: 'Music Festival',
        date: '2025-06-10T18:00:00',
        category: 'Música',
    },
]

export default function DashboardPPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter()

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        const currentYear = getYear(new Date()); // 2025 based on context
        const eventYear = getYear(date);
        const formatString = eventYear === currentYear ? 'd MMM' : 'd MMM yyyy';
        return format(date, formatString);
    };

    return (
        <ClientOnly>
            <ThemeProvider>
                <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gray-white' : 'bg-slate-900'}`}>
                    {/* Sidebar */}
                    <SideNavbar theme={theme} toggleTheme={toggleTheme} />

                    {/* Main Content */}
                    <main className="flex-1 p-6 md:ml-[260px]">
                        <h1 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                            Dashboard
                        </h1>
                        {/* 3D Canvas */}
                        <div className="w-full h-[50vh] mb-6">
                            <ThreeCanvas theme={theme} />
                        </div>
                        {/* Upcoming Section */}
                        <section className="mb-6">
                            <h2 className={`text-2xl font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                                Upcoming
                            </h2>
                            {upcomingItems.length > 0 ? (
                                <div className="space-y-4">
                                    {upcomingItems.map((item) => (
                                        <motion.div
                                            key={item.id}
                                            className={`p-4 rounded-lg shadow-md ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className={`font-medium ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                                {item.title}
                                            </h3>
                                            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {formatEventDate(item.date)} - {item.category}
                                            </p>
                                            <button
                                                className={`mt-2 text-gray-950 dark:text-gray-500 hover:underline rounded-md px-2 py-1 transition-colors`}
                                                onClick={() => router.push('/calendar')}
                                            >
                                                View Details
                                            </button>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                    No upcoming items available.
                                </p>
                            )}
                        </section>
                    </main>
                </div>
            </ThemeProvider>
        </ClientOnly>
    )
}