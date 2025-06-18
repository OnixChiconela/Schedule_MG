"use client"

import { useTheme } from "@/app/themeContext"
import { motion, AnimatePresence } from "framer-motion"
import { X } from "lucide-react"
import { useState } from "react"

interface JoinCallModalProps {
    isOpen: boolean
    onClose: () => void
    onJoin: () => void
    title: string
}

export default function JoinCallModal({ isOpen, onClose, onJoin, title }: JoinCallModalProps) {
    const { theme } = useTheme()

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                >
                    <motion.div
                        className={`rounded-lg p-6 w-full max-w-md ${theme == "light" ? "bg-white" : "bg-gray-800"}`}
                        initial={{ scale: 0.95, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.95, opacity: 0 }}
                        transition={{ duration: 0.2 }}
                    >
                        <div className="flex justify-between items-center mb-3">
                            <h2 className={`text-lg font-semibold`}>Join Call</h2>
                            <button
                                onClick={onClose}
                                className={`p-1 rounded-full ${theme === "light" ? "hover:bg-gray-200" : "hover:bg-gray-700"}`}
                            >
                                <X size={20} />
                            </button>
                        </div>
                        <p className="mb-4">You have been invited to join the call: <strong>{title}</strong></p>
                        <div className="flex justify-end gap-2">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-gray-700 hover:bg-gray-600"}`}
                            >
                                Decline
                            </button>
                            <button
                                onClick={() => {
                                    onJoin();
                                    onClose();
                                }}
                                className={`px-4 py-2 rounded-lg ${theme === "light" ? "bg-fuchsia-500 hover:bg-fuchsia-600 text-white" : "bg-fuchsia-700 hover:bg-fuchsia-800 text-white"}`}
                            >
                                Join
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}