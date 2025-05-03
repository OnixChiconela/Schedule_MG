'use client'

import { useRouter } from "next/navigation";
import ClientOnly from "../components/ClientOnly"
import SideNavbar from "../components/navbars/SideNavbar"
import { ThemeProvider, useTheme } from "../themeContext"
import { motion } from "framer-motion"
import { format, getYear } from 'date-fns';
import Navbar from "../components/navbars/Navbar";
import { useState, useEffect } from "react";
import { X } from "lucide-react";

type Task = {
    id: number;
    title: string;
    status: "To Do" | "In Progress" | "Done";
    createdDate: string;
    dueDate: string;
    priority: "Low" | "Medium" | "High";
    isCompleted: boolean;
};

type Corner = {
    id: number;
    title: string;
    tasks: Task[];
};

type Suggestion = {
    id: number;
    title: string;
    date: string;
    category: string;
};

export default function DashboardPPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [corners, setCorners] = useState<Corner[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("corners");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [suggestions, setSuggestions] = useState<Suggestion[]>([
        { id: 1, title: "AI Conference", date: "2025-05-15T09:00:00", category: "Technology" },
        { id: 2, title: "Machine Learning Summit", date: "2025-06-10T10:00:00", category: "Technology" },
        { id: 3, title: "Art Exhibition", date: "2025-05-20T14:00:00", category: "Art" },
        { id: 4, title: "Modern Art Workshop", date: "2025-07-01T13:00:00", category: "Art" },
        { id: 5, title: "Investment Seminar", date: "2025-05-25T11:00:00", category: "Finance" },
        { id: 6, title: "Stock Market Crash Course", date: "2025-06-15T15:00:00", category: "Finance" },
        { id: 7, title: "Online Education Summit", date: "2025-05-30T09:00:00", category: "Education" },
        { id: 8, title: "Teacher Training", date: "2025-06-20T14:00:00", category: "Education" },
        { id: 9, title: "Health & Wellness Expo", date: "2025-06-05T10:00:00", category: "Health" },
        { id: 10, title: "Yoga Retreat", date: "2025-07-10T08:00:00", category: "Health" },
        { id: 11, title: "Travel Expo", date: "2025-07-10T10:00:00", category: "Travel" },
        { id: 12, title: "Adventure Travel Fair", date: "2025-08-01T12:00:00", category: "Travel" },
        { id: 13, title: "Live Concert", date: "2025-06-05T19:00:00", category: "Music" },
        { id: 14, title: "Jazz Festival", date: "2025-07-15T18:00:00", category: "Music" },
    ]);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        const currentYear = getYear(new Date());
        const eventYear = getYear(date);
        const formatString = eventYear === currentYear ? "d MMM" : "d MMM yyyy";
        return format(date, formatString);
    };

    // Initialize corners with fake data if none exist
    useEffect(() => {
        if (corners.length === 0 && typeof window !== "undefined") {
            const initialCorners: Corner[] = [
                { id: 1, title: "morning", tasks: [{ id: 1, title: "Plan day", status: "To Do", createdDate: "2025-05-03", dueDate: "2025-05-03", priority: "Medium", isCompleted: false }, { id: 2, title: "Check emails", status: "To Do", createdDate: "2025-05-03", dueDate: "2025-05-03", priority: "Low", isCompleted: false }] },
                { id: 2, title: "afternoon", tasks: [{ id: 3, title: "Team sync", status: "In Progress", createdDate: "2025-05-03", dueDate: "2025-05-03", priority: "High", isCompleted: false }] },
                { id: 3, title: "evening", tasks: [{ id: 4, title: "Relax", status: "To Do", createdDate: "2025-05-03", dueDate: "2025-05-03", priority: "Low", isCompleted: false }, { id: 5, title: "Read book", status: "To Do", createdDate: "2025-05-03", dueDate: "2025-05-03", priority: "Low", isCompleted: false }] },
            ];
            setCorners(initialCorners);
            localStorage.setItem("corners", JSON.stringify(initialCorners));
        }
    }, [corners.length]);

    const removeSuggestion = (id: number) => {
        setSuggestions(suggestions.filter((s) => s.id !== id));
    };

    // Fake user interests
    const userInterests = ["Technology", "Art", "Music", "Travel"];

    // Map category to border color
    const categoryColors: { [key: string]: string } = {
        Technology: "border-blue-500",
        Art: "border-purple-500",
        Finance: "border-green-500",
        Education: "border-yellow-500",
        Health: "border-red-500",
        Travel: "border-teal-500",
        Music: "border-pink-500",
    };

    return (
        <ClientOnly>
            <Navbar
                themeButton={true}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <ThemeProvider>
                <div className={`min-h-screen flex ${theme === 'light' ? 'bg-gray-white' : 'bg-slate-900'} transition-colors duration-300`}>
                    <SideNavbar
                        theme={theme}
                        toggleTheme={toggleTheme}
                        isOpen={isSidebarOpen}
                        setIsOpen={setIsSidebarOpen}
                        isVisible={isSidebarOpen}
                    />
                    <main className="flex-1 p-6 lg:ml-[260px] pt-20">
                        <h1 className={`text-3xl font-bold mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                            Dashboard
                        </h1>
                        <section className="mb-6">
                            <h2 className={`text-[22px] font-semibold mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                                Upcoming
                            </h2>
                            <div className="space-x-5 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                                {corners.slice(0, 3).map((corner) => (
                                    <motion.div
                                        key={corner.id}
                                        className={`relative p-5 cursor-pointer rounded-xl shadow-lg border-l-4 border-blue-500 bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-50' : 'from-slate-800 to-slate-700'} w-64`}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                        onClick={() => router.push('/tasks')}
                                    >
                                        <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                            {corner.title}
                                        </h3>
                                        {corner.tasks.slice(0, 2).map((task) => (
                                            <p key={task.id} className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {task.title} - Due: {formatEventDate(task.dueDate)}
                                            </p>
                                        ))}
                                    </motion.div>
                                ))}
                            </div>
                        </section>
                        <section className="mb-6">
                            <h2 className={`text-lg font-semibold mb-4 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'}`}>
                                Event suggestion <a className={`${theme == "light" ? 'text-neutral-600' : 'text-neutral-500'}`}>{`(Illustrative data)`}</a>
                            </h2>
                            <div className="space-x-5 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
                                {suggestions
                                    .filter((s) => userInterests.includes(s.category))
                                    .slice(0, 3)
                                    .map((item) => (
                                        <motion.div
                                            key={item.id}
                                            className={`relative p-5 rounded-xl shadow-lg border-l-4 ${categoryColors[item.category]} bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-50' : 'from-slate-800 to-slate-700'} w-64`}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                {item.title}
                                            </h3>
                                            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {formatEventDate(item.date)} - {item.category}
                                            </p>

                                            <div className={`absolute top-2 right-2 w-6  cursor-pointer
                                                h-6 transiction-colors items-center justify-center 
                                                ${theme == "light" ? 'text-neutral-700 hover:text-neutral-950' : 'text-neutral-300 hover:text-neutral-100'}`}
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSuggestion(item.id);
                                                }}
                                            >
                                                <X size={20} />
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        </section>
                    </main>
                </div>
            </ThemeProvider>
        </ClientOnly>
    );
}