"use client"

import { Dialog } from "@headlessui/react"
import { X } from "lucide-react"
import { useState } from "react"

interface ModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (title: string, tasks: string[]) => void
}

const NewProjectModal: React.FC<ModalProps> = ({
    isOpen,
    onClose,
    onCreate
}) => {
    const [title, setTitle] = useState('')
    const [tasksText, setTasksText] = useState('')

    const handleSubmit = () => {
        const tasks = tasksText
            .split('\n')
            .map(task => task.trim())
            .filter(task => task.length > 0)

        if (title.trim()) {
            onCreate(title.trim(), tasks)
            setTitle('')
            setTasksText('')
            onClose()
        }
    }

    return (
        <Dialog open={isOpen} onClose={onClose} className="fixed inset-0 z-50 flex items-center justify-center">
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" />
            <div className="bg-white rounded-2xl p-6 w-full max-w-md z-50 relative shadow-xl">
                <button className="absolute top-3 right-3 text-gray-500 hover:text-black" onClick={onClose}>
                    <X size={20} />
                </button>

                <Dialog.Title className="text-xl font-bold mb-4">Create New Corner</Dialog.Title>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Corner Title</label>
                    <input
                        className="w-full border border-gray-300 rounded-xl px-3 py-2"
                        placeholder="e.g. Cozy Morning"
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium mb-1">Tasks (one per line)</label>
                    <textarea
                        className="w-full border border-gray-300 rounded-xl px-3 py-2 h-24"
                        placeholder="Buy coffee\nWrite notes"
                        value={tasksText}
                        onChange={e => setTasksText(e.target.value)}
                        onKeyDown={e => {
                            if (e.key === 'Enter') {
                                e.preventDefault()
                                const lines = tasksText.split('\n')
                                const newText = tasksText + '\n• '
                                setTasksText(newText)
                            }
                        }}
                    />

                </div>

                <button
                    className="bg-black text-white px-4 py-2 rounded-xl hover:bg-neutral-800 transition w-full"
                    onClick={handleSubmit}
                >
                    Create
                </button>
            </div>
        </Dialog>
    )
}

export default NewProjectModal