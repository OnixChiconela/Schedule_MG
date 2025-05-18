'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MoreHorizontal, Pen, Trash } from 'lucide-react'
import { useTheme } from '@/app/themeContext'

interface BusinessHeaderProps {
    name: string
    onEdit: () => void
    onDelete: () => void
}

export default function BusinessHeader({ name, onEdit, onDelete }: BusinessHeaderProps) {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const { theme } = useTheme()

    const buttonVariants = {
        hover: { scale: 1.05, transition: { duration: 0.2 } },
        tap: { scale: 0.95 },
    }

    return (
        <div className="flex items-center justify-between relative">
            <motion.h2
                className={`text-2xl font-semibold w-[90%] ${theme === 'light' ? 'text-gray-900' : 'text-white'}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.3 }}
            >
                {name}
            </motion.h2>
            <motion.div className="relative">
                <motion.button
                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                    className={`rounded-xl font-bold transition-colors border-2 px-1 justify-center ${theme === 'light'
                        ? 'border-neutral-300 hover:border-neutral-400'
                        : 'border-slate-300 text-neutral-200 hover:border-slate-400'}`}
                    variants={buttonVariants}
                    whileHover="hover"
                    whileTap="tap"
                >
                    <MoreHorizontal />
                </motion.button>
                {isMenuOpen && (
                    <motion.div
                        className={`absolute right-0 mt-2 p-1 rounded-md border-2 shadow-lg 
                        ${theme === 'light' ? 'bg-neutral-100 border-neutral-200' : 'bg-slate-800/90 border-slate-500'} ring-opacity-5`}
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.2 }}
                    >
                        <motion.button
                            onClick={() => {
                                onEdit()
                                setIsMenuOpen(false)
                            }}
                            className={` w-full flex text-left rounded-md px-4 py-2 text-base items-center gap-2 ${theme === 'light' ? 'text-gray-700 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-600'}`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Pen className="inline" size={17} /> Edit
                        </motion.button>
                        <motion.button
                            onClick={() => {
                                onDelete()
                                setIsMenuOpen(false)
                            }}
                            className={` w-full flex text-left rounded-md px-4 py-2 text-base items-center gap-2 ${theme === 'light' ? 'text-red-600 hover:bg-gray-100' : 'text-red-400 hover:bg-slate-600'}`}
                            variants={buttonVariants}
                            whileHover="hover"
                            whileTap="tap"
                        >
                            <Trash className="inline" size={17} /> Delete
                        </motion.button>
                    </motion.div>
                )}
            </motion.div>
        </div>
    )
}