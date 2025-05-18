"use client";

import { useState, MouseEvent } from "react";
import { motion } from "framer-motion";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";

interface CreateSubfolderModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (title: string, description: string, content: string) => void;
    initialTitle?: string;
    initialDescription?: string;
    initialContent?: string;
    isEditing?: boolean;
}

export default function CreateSubfolderModal({
    isOpen,
    onClose,
    onSubmit,
    initialTitle = "",
    initialDescription = "",
    initialContent = "",
    isEditing = false,
}: CreateSubfolderModalProps) {
    const { theme } = useTheme();
    const [title, setTitle] = useState(initialTitle);
    const [description, setDescription] = useState(initialDescription);
    const [content, setContent] = useState(initialContent);

    const safeTheme = theme || "light";

    const handleSubmit = () => {
        if (!title.trim()) {
            toast.error("Title is required");
            return;
        }
        if (description.length > 150) {
            toast.error("Description cannot exceed 150 characters");
            return;
        }
        onSubmit(title, description, content);
    };

    const handleBackgroundClick = () => {
        onClose();
    };

    const handleModalContentClick = (e: MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className={`fixed inset-0 z-50 flex items-center justify-center ${safeTheme === "light" ? "bg-gray-100/50" : "bg-slate-800/50"}`}
            style={{
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onClick={handleBackgroundClick}
        >
            <motion.div
                className={`p-6 rounded-2xl shadow-xl w-full max-w-md ${safeTheme === "light" ? "bg-white" : "bg-slate-800/90"}`}
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ duration: 0.3 }}
                onClick={handleModalContentClick}
            >
                <h2
                    className={`text-2xl font-semibold mb-4 ${safeTheme === "light" ? "text-gray-900" : "text-gray-100"}`}
                >
                    {isEditing ? "Edit Fragment" : "Create New Fragment"}
                </h2>
                <div className="space-y-4">
                    <div>
                        <label
                            className={`block mb-2 font-medium ${safeTheme === "light" ? "text-gray-700" : "text-gray-300"}`}
                        >
                            Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Enter fragment title..."
                            className={`w-full p-3 rounded-lg border ${safeTheme === "light" ? "border-gray-300 bg-white text-gray-900" : "border-slate-600 bg-slate-900 text-gray-200"} focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                        />
                    </div>
                    <div>
                        <label
                            className={`block mb-2 font-medium ${safeTheme === "light" ? "text-gray-700" : "text-gray-300"}`}
                        >
                            Description (optional)
                        </label>
                        <textarea
                            value={description}
                            onChange={(e) => {
                                if (e.target.value.length <= 150) {
                                    setDescription(e.target.value);
                                }
                            }}
                            placeholder="Enter fragment description..."
                            rows={3}
                            className={`w-full p-3 rounded-lg border ${safeTheme === "light" ? "border-gray-300 bg-white text-gray-900" : "border-slate-600 bg-slate-900 text-gray-200"} focus:outline-none focus:ring-2 focus:ring-neutral-700`}
                        />
                        <p className={`text-xs mt-1 ${safeTheme === "light" ? "text-gray-500" : "text-gray-400"}`}>
                            {description.length}/150 characters
                        </p>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <motion.button
                            onClick={onClose}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === "light" ? "bg-gray-200 hover:bg-gray-300 text-gray-900" : "bg-slate-600 hover:bg-slate-500 text-gray-200"}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            onClick={handleSubmit}
                            className={`px-4 py-2 rounded-xl font-semibold transition-colors ${safeTheme === "light" ? "bg-neutral-900 hover:bg-black text-white" : "bg-neutral-900 hover:bg-black text-gray-100"}`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={!title.trim()}
                        >
                            {isEditing ? "Update" : "Create"}
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
}