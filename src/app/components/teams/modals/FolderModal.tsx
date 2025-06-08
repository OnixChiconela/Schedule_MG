"use client";

import { motion } from "framer-motion";
import { X } from "lucide-react";
import { useState } from "react";

type FolderModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onCreate: (title: string) => void;
    theme: string;
};

const FolderModal = ({ isOpen, onClose, onCreate, theme }: FolderModalProps) => {
    const [title, setTitle] = useState("");

    const handleSubmit = () => {
        if (title.trim()) {
            onCreate(title);
            setTitle("");
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <motion.div
            className="fixed inset-0 flex items-center justify-center z-50 bg-gray-100/50 dark:bg-slate-800/50"
            style={{
                backdropFilter: "blur(4px)",
                WebkitBackdropFilter: "blur(4px)",
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
        >
            <motion.div
                className={`p-6 rounded-xl shadow-lg w-full max-w-sm ${theme === "light" ? "bg-white border-gray-200" : "bg-slate-700 border-gray-700"}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                transition={{ duration: 0.3, ease: "easeInOut" }}
            >
                <div className="flex justify-between items-center mb-6">
                    <h2
                        className={`text-xl font-semibold ${theme === "light" ? "text-gray-900" : "text-white"}`}
                    >
                        Create Folder
                    </h2>
                    <button onClick={onClose} className="p-1">
                        <X size={20} className={theme === "light" ? "text-gray-600" : "text-gray-300"} />
                    </button>
                </div>
                <div className="space-y-6">
                    <div>
                        <label className={`block text-sm font-medium mb-2 ${theme === "light" ? "text-gray-700" : "text-gray-300"}`}>
                            Folder Name
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className={`w-full p-2 rounded-md border ${theme === "light"
                                ? "border-gray-300 bg-white text-gray-900"
                                : "border-slate-600 bg-slate-800 text-gray-200"
                                } focus:outline-none focus:ring-2 focus:ring-fuchsia-700`}
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <motion.button
                            onClick={onClose}
                            className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                                ? "bg-gray-200 hover:bg-gray-300 text-gray-900"
                                : "bg-slate-600 hover:bg-slate-500 text-gray-200"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Cancel
                        </motion.button>
                        <motion.button
                            onClick={handleSubmit}
                            className={`px-5 py-2 rounded-xl font-semibold transition-colors ${theme === "light"
                                ? "bg-neutral-800 hover:bg-black text-white"
                                : "bg-neutral-900 hover:bg-black text-gray-200"
                                }`}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Create
                        </motion.button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default FolderModal;
