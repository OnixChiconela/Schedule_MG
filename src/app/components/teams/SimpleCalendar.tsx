"use client";

import { useTheme } from "@/app/themeContext";
import { useState, useContext } from "react";
import { ChevronLeft, ChevronRight, Trash2 } from "lucide-react";
import { motion } from "framer-motion"

const SimpleCalendar = ({ onDateSelect }: { onDateSelect: (section: string) => void }) => {
    const { theme } = useTheme();
    const [currentDate, setCurrentDate] = useState(new Date());
    const [selectedDate, setSelectedDate] = useState<number | null>(null);
    const [showCategories, setShowCategories] = useState(false);
    const [categories, setCategories] = useState<{ [key: string]: string }>({
        Work: "#3b82f6",
        Personal: "#22c55e",
        Study: "#f59e0b",
        Other: "#6b7280",
    });

    const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();
    const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
    const paddingDays = Array.from({ length: firstDay }, (_, i) => i);

    const prevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
        setSelectedDate(null);
    };

    const nextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
        setSelectedDate(null);
    };

    const addCategory = () => {
        const categoryName = prompt("Enter category name:");
        if (categoryName && !categories[categoryName]) {
            setCategories({ ...categories, [categoryName]: "#3b82f6" });
        }
    };

    const updateCategoryColor = (category: string, color: string) => {
        setCategories({ ...categories, [category]: color });
    };

    const removeCategory = (category: string) => {
        const newCategories = { ...categories };
        delete newCategories[category];
        setCategories(newCategories);
    };

    return (
        <div className="mt-1">
            <div className="flex items-center justify-between mb-2">
                <button onClick={prevMonth} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronLeft size={20} />
                </button>
                <h3 className="text-lg font-semibold">
                    {currentDate.toLocaleString("default", { month: "long", year: "numeric" })}
                </h3>
                <button onClick={nextMonth} className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
                    <ChevronRight size={20} />
                </button>
            </div>
            <div className="grid grid-cols-7 gap-1 text-center">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="text-xs font-semibold text-gray-500 dark:text-gray-400">
                        {day}
                    </div>
                ))}
                {paddingDays.map((_, i) => (
                    <div key={`pad-${i}`} />
                ))}
                {days.map((day) => {
                    const isToday =
                        day === new Date().getDate() &&
                        currentDate.getMonth() === new Date().getMonth() &&
                        currentDate.getFullYear() === new Date().getFullYear();
                    const isSelected = day === selectedDate;

                    return (
                        <button
                            key={day}
                            onClick={() => {
                                console.log("Date clicked:", day); // Depuração
                                setSelectedDate(day);
                                onDateSelect("Calendar");
                            }}
                            className={`text-sm p-1 rounded-lg border border-transparent transition-all ${isToday
                                    ? theme === "light"
                                        ? "bg-blue-500 text-white"
                                        : "bg-blue-700 text-white"
                                    : isSelected
                                        ? theme === "light"
                                            ? "bg-blue-500/50 text-white"
                                            : "bg-blue-700/50 text-white"
                                        : theme === "light"
                                            ? "bg-white text-gray-800 hover:bg-gray-100 border-gray-200"
                                            : "bg-slate-700 text-gray-200 hover:bg-slate-600 border-slate-600"
                                }`}
                        >
                            {day}
                        </button>
                    );
                })}
            </div>
            {/* Show More btn and categories section */}
            <div className="mt-4">
                <button
                    onClick={() => setShowCategories(!showCategories)}
                    className={`w-full text-left p-2 rounded-lg text-sm font-medium ${theme === "light" ? "bg-neutral-100 text-neutral-800 hover:bg-neutral-200" : "bg-slate-700 text-neutral-200 hover:bg-neutral-700"
                        }`}
                >
                    {showCategories ? "Hide Categories" : "Show More"}
                </button>
                {showCategories && (
                    <motion.div className="mt-2 space-y-2" initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.3 }}>
                        <button
                            onClick={addCategory}
                            className={`w-full text-left p-2 rounded-lg text-sm font-medium ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-700 text-white hover:bg-blue-800"
                                }`}
                        >
                            Add Category
                        </button>
                        {Object.entries(categories)
                            .filter(([category]) => category.toLowerCase() !== "other")
                            .map(([category, color]) => (
                                <div
                                    key={category}
                                    className={`flex items-center justify-between gap-2 rounded-md p-2 ${theme === "light" ? "hover:bg-gray-100" : "hover:bg-slate-600"
                                        } transition-all duration-150`}
                                >
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="color"
                                            value={color}
                                            onChange={(e) => updateCategoryColor(category, e.target.value)}
                                            className="w-5 h-5 rounded cursor-pointer"
                                            style={{
                                                appearance: "none",
                                                backgroundColor: color,
                                                border: "1px solid",
                                                borderColor: theme === "light" ? "#d1d5db" : "#4b5563",
                                                padding: 0,
                                                margin: 0,
                                            }}
                                        />
                                        <span
                                            className={`text-sm font-medium ${theme === "light" ? "text-gray-900" : "text-neutral-200"} cursor-pointer hover:underline`}
                                        >
                                            {category}
                                        </span>
                                    </div>
                                    <button
                                        onClick={() => removeCategory(category)}
                                        className={`p-1 rounded-full ${theme === "light" ? "text-gray-500 hover:bg-gray-200" : "text-neutral-400 hover:bg-slate-500"
                                            } transition-all duration-150`}
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        {Object.keys(categories).filter((cat) => cat.toLowerCase() !== "other").length === 0 && (
                            <p className={`text-sm ${theme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                                No categories available
                            </p>
                        )}
                    </motion.div>
                )}
            </div>
        </div>
    );
};

export default SimpleCalendar;
