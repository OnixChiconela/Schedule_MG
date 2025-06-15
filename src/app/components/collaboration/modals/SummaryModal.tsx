"use client"

import { useTheme } from "@/app/themeContext"
import { motion } from "framer-motion"

interface SummaryModalProps {
    isOpen: boolean
    onClose: () => void
    summary: string | null
}

const SummaryModal: React.FC<SummaryModalProps> = ({
    isOpen,
    onClose,
    summary
}) => {
    const { theme } = useTheme()
    if (!isOpen || !summary) return null

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div
                className={`w-96 p-4 rounded ${theme === "light" ? "bg-white text-gray-900" : "bg-blue-900 text-white"}`}
            >
                <h3 className="text-lg font-semibold mb-4">Chat Summary</h3>
                <p className="mb-4">{summary}</p>
                <div className="flex justify-end">
                    <button
                        onClick={onClose}
                        className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                    >
                        Close
                    </button>
                </div>
            </div>
        </motion.div>
    )
}

export default SummaryModal