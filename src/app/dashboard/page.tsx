'use client'

import { useRouter } from "next/navigation";
import ClientOnly from "../components/ClientOnly"
import SideNavbar from "../components/navbars/SideNavbar"
import { ThemeProvider, useTheme } from "../themeContext"
import { motion } from "framer-motion"
import { format, getYear } from 'date-fns';
import Navbar from "../components/navbars/Navbar";
import { useEffect, useState } from "react";
import { X } from "lucide-react";
import CustomDropdown from "../components/CustomDropdown";
import { initialSuggestions } from "../fake/suggestions";
import { emojiOptions } from "../components/emojiOptions";

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

type Note = {
    id: number;
    content: string;
    title?: string;
    emoji?: string;
    createdAt?: number
};

export default function DashboardPPage() {
    const { theme, toggleTheme } = useTheme();
    const router = useRouter();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [corners] = useState<Corner[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("corners");
            return saved ? JSON.parse(saved) : [{ id: 1, title: "", tasks: [] }, { id: 2, title: "", tasks: [] }, { id: 3, title: "", tasks: [] }];
        }
        return [{ id: 1, title: "", tasks: [] }, { id: 2, title: "", tasks: [] }, { id: 3, title: "", tasks: [] }];
    });

    const [notes, setNotes] = useState<Note[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("notes");
            return saved ? JSON.parse(saved) : [];
        }
        return [];
    });
    const [userInterests] = useState<string[]>(() => {
        if (typeof window !== "undefined") {
            const saved = localStorage.getItem("userPreferences");
            return saved ? JSON.parse(saved).interests : [];
        }
        return [];
    });

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

    const [suggestions, setSuggestions] = useState<Suggestion[]>(initialSuggestions);

    const removeSuggestion = (id: number) => {
        setSuggestions(suggestions.filter((s) => s.id !== id));
    };

    const addNote = () => {
        if (notes.length < 3) {
            const newNote: Note = { id: Date.now(), title: `Note ${notes.length + 1}`, content: "", emoji: "📝", createdAt: Date.now() };
            setNotes([...notes, newNote]);
            localStorage.setItem("notes", JSON.stringify([...notes, newNote]));
        }
    };

    const updateNote = (id: number, content: string) => {
        const updatedNotes = notes.map((note) => (note.id === id ? { ...note, content } : note));
        setNotes(updatedNotes);
        localStorage.setItem("notes", JSON.stringify(updatedNotes));
    };

    const removeNote = (id: number) => {
        const updatedNotes = notes.filter((note) => note.id !== id);
        setNotes(updatedNotes);
        localStorage.setItem("notes", JSON.stringify(updatedNotes));
    };

    const checkExpiredNotes = () => {
        const twentyFourHours = 24 * 60 * 60 * 1000;
        const now = Date.now();
        const updatedNotes = notes.filter((note) => now - note.createdAt! < twentyFourHours);
        if (updatedNotes.length !== notes.length) {
            setNotes(updatedNotes);
            localStorage.setItem("notes", JSON.stringify(updatedNotes));
        }
    };

    useEffect(() => {
        checkExpiredNotes(); // Verifica ao carregar
        const interval = setInterval(checkExpiredNotes, 60000); // Verifica a cada minuto
        return () => clearInterval(interval); // Limpa o intervalo ao desmontar
    }, [notes]);

    const updateEmoji = (id: number, emoji: string) => {
        const updatedNotes = notes.map((note) => (note.id === id ? { ...note, emoji } : note));
        setNotes(updatedNotes);
        localStorage.setItem("notes", JSON.stringify(updatedNotes));
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return "Good morning, ready for a great day?";
        if (hour < 17) return "Good afternoon, how's it going?";
        return "Good evening, how was your day?";
    };

    return (
        <ClientOnly>
            <Navbar
                themeButton={true}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={toggleSidebar}
            />
            <div
                className={`min-h-screen flex ${theme === 'light' ? 'bg-white' : 'bg-slate-900'} transition-colors duration-300`}
                style={{
                    paddingTop: 'env(safe-area-inset-top, 0px)', // Adiciona padding superior seguro
                }}
            >
                <SideNavbar
                    theme={theme}
                    toggleTheme={toggleTheme}
                    isOpen={isSidebarOpen}
                    setIsOpen={setIsSidebarOpen}
                    isVisible={isSidebarOpen}
                />
                <main
                    className="flex-1 p-4 sm:p-6 lg:ml-[260px] sm:pt-20 max-w-screen-xl mx-auto"
                    style={{
                        paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))`, // Combina pt-20 com safe-area-inset-top
                    }}
                >
                    <section className="mb-6">
                        <motion.h1
                            className={`text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            {`${getGreeting()}`}
                        </motion.h1>
                        <motion.div
                            className={`text-lg sm:text-xl font-medium mb-3 sm:mb-4 ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.5, delay: 0.2 }}
                        >
                            Quick notes!
                        </motion.div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
                            {notes.map((note) => (
                                <motion.div
                                    key={note.id}
                                    className={`p-3 sm:p-4 rounded-xl shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} border ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'} relative min-h-[150px]`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.3 }}
                                >
                                    <div className="absolute left-3 sm:left-4 top-2">
                                        <CustomDropdown
                                            options={emojiOptions.map((emoji) => ({ value: emoji, label: emoji }))}
                                            value={note.emoji || ""}
                                            onChange={(value) => updateEmoji(note.id, value)}
                                        />
                                    </div>
                                    <button
                                        className={`absolute right-2 top-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-600 text-neutral-200'} rounded-md px-2 py-0 transition-colors`}
                                        onClick={() => removeNote(note.id)}
                                    >
                                        <X size={16} />
                                    </button>
                                    <textarea
                                        className={`w-full h-20 sm:h-24 p-2 rounded-md flex ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-slate-700 text-gray-200'} border ${theme === 'light' ? 'border-gray-300' : 'border-slate-600'} focus:outline-none focus:ring-2 focus:ring-neutral-800 mt-10 sm:mt-10`}
                                        value={note.content}
                                        onChange={(e) => updateNote(note.id, e.target.value)}
                                        placeholder={note.title || "Add a note or reminder..."}
                                    />
                                </motion.div>
                            ))}
                            {notes.length < 3 && (
                                <motion.button
                                    className={`p-3 sm:p-4 rounded-xl shadow-lg ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-slate-700 text-gray-200 hover:bg-slate-600'} flex items-center justify-center min-h-[150px]`}
                                    onClick={addNote}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    whileHover={{ scale: 1.05 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    Add Note
                                </motion.button>
                            )}
                        </div>
                    </section>
                    <section className="mb-6">
                        <h2 className={`text-xl sm:text-[22px] font-semibold mb-3 sm:mb-4 ${theme === 'light' ? 'text-gray-900' : 'text-gray-100'}`}>
                            Upcoming
                        </h2>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {corners.slice(0, 3).map((corner) => (
                                <motion.div
                                    key={corner.id}
                                    className={`p-3 sm:p-5 rounded-xl shadow-lg border-l-4 border-fuchsia-800 bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-50' : 'from-slate-800 to-slate-700'} min-h-[120px] cursor-pointer`}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    whileHover={{ scale: 1.05, transition: { duration: 0.2 } }}
                                    onClick={() => router.push('/tasks')}
                                >
                                    <h3 className={`text-base sm:text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                        {corner.title || <div className={`h-2 w-full rounded ${theme === 'light' ? 'bg-gray-300' : 'bg-gray-600'} h-1 w-2`}></div>}
                                    </h3>
                                    {corner.tasks.length === 0 ? (
                                        <>
                                            <p className={theme === 'light' ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>-</p>
                                            <p className={theme === 'light' ? 'text-gray-400 text-sm' : 'text-gray-600 text-sm'}>-</p>
                                        </>
                                    ) : (
                                        corner.tasks.slice(0, 2).map((task) => (
                                            <p key={task.id} className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {task.title} - Due: {formatEventDate(task.dueDate)}
                                            </p>
                                        ))
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    </section>
                    <section className="mb-6">
                        <h2 className={`text-lg sm:text-[18px] font-semibold mb-3 sm:mb-4 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'}`}>
                            Event suggestion <a className={`${theme == "light" ? 'text-neutral-600' : 'text-neutral-500'}`}>{`(Illustrative data)`}</a>
                        </h2>
                        {userInterests.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {suggestions
                                    .filter((s) => userInterests.includes(s.category))
                                    .slice(0, 3)
                                    .map((item) => (
                                        <motion.div
                                            key={item.id}
                                            className={`p-3 sm:p-5 rounded-xl shadow-lg border-l-4 ${categoryColors[item.category]} bg-gradient-to-br ${theme === 'light' ? 'from-white to-gray-50' : 'from-slate-800 to-slate-700'} min-h-[120px] relative`} // Adicionado 'relative'
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <h3 className={`text-base sm:text-lg font-semibold ${theme === 'light' ? 'text-gray-700' : 'text-gray-300'}`}>
                                                {item.title}
                                            </h3>
                                            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
                                                {formatEventDate(item.date)} - {item.category}
                                            </p>
                                            <div
                                                className={`absolute top-2 right-2 w-6 h-6 cursor-pointer transition-all flex items-center justify-center rounded-full ${theme === 'light' ? 'text-neutral-700 hover:bg-red-100 hover:text-neutral-950' : 'text-neutral-300 hover:bg-red-900/20 hover:text-neutral-100'} z-10`} // Adicionado 'z-10' e fundo no hover
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    removeSuggestion(item.id);
                                                }}
                                                aria-label="Remove suggestion"
                                            >
                                                <X size={16} />
                                            </div>
                                        </motion.div>
                                    ))}
                            </div>
                        ) : (
                            <div className={`${theme == "light" ? "text-neutral-600 hover:text-neutral-800" : "text-neutral-300 hover:text-neutral-100"} underline cursor-pointer`}
                                onClick={() => router.push('/onboarding')}
                            >
                                Pick your preferences so we can give you ideas
                            </div>
                        )}

                        <motion.p
                            className={`mt-3 sm:mt-4 text-sm ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 0.5 }}
                        >
                            Smart notes. soon...
                        </motion.p>
                    </section>
                </main>
            </div>
        </ClientOnly>
    );
}

const categoryColors: { [key: string]: string } = {
    Technology: "border-blue-500",
    Art: "border-purple-500",
    Finance: "border-green-500",
    Education: "border-yellow-500",
    Health: "border-red-500",
    Travel: "border-teal-500",
    Music: "border-pink-500",
};