"use client"

import { useTheme } from "@/app/themeContext"
import { useState } from "react"
import toast from "react-hot-toast"

interface ScheduleMessageModalProps {
    isOpen: boolean
    onClose: () => void
    onCreate: (prompt: string, scheduledTime: string, requiresReview: boolean) => Promise<void>
}

const ScheduleMessageModal = ({ isOpen, onClose, onCreate }: ScheduleMessageModalProps) => {
    const [prompt, setPrompt] = useState("")
    const [scheduledTime, setScheduledTime] = useState("")
    const [requiresReview, setRequiresReview] = useState(false)
    const { theme } = useTheme()

    if (!isOpen) return null
    const handleCreate = async () => {
        if (!prompt.trim()) {
            toast.error("Message is required", { duration: 3000 })
            return
        }
        if (!scheduledTime) {
            toast.error("Scheduled date is required", { duration: 3000 })
            return
        }
        try {
            await onCreate(prompt, scheduledTime, requiresReview)
            setPrompt("")
            setScheduledTime("")
            setRequiresReview(false)
            toast.success("Message scheduled successfully", { duration: 3000 })
            onClose()
        } catch (error) {
            toast.error("Failed to schedule message", { duration: 3000 })
        }
    }

    return (
            <div
                className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[1000]"
                data-testid="schedule-message-modal"
            >
                <div
                    className={`w-96 p-4 rounded ${theme === "light" ? "bg-white text-black" : "bg-blue-900 text-white"}`}
                >
                    <h3 className="text-lg font-semibold mb-4">Schedule Message</h3>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        className={`w-full p-2 rounded mb-4 ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"} resize-none h-24`}
                        placeholder="Enter your message..."
                        data-testid="prompt-input"
                    />
                    <input
                        type="datetime-local"
                        value={scheduledTime}
                        onChange={(e) => setScheduledTime(e.target.value)}
                        className={`w-full p-2 rounded mb-4 ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"}`}
                        data-testid="schedule-input"
                    />
                    <div className="flex space-x-4 mb-4">
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="auto"
                                checked={!requiresReview}
                                onChange={() => setRequiresReview(false)}
                                className="mr-2"
                                data-testid="auto-send-toggle"
                            />
                            Auto Send
                        </label>
                        <label className="flex items-center">
                            <input
                                type="radio"
                                value="review"
                                checked={requiresReview}
                                onChange={() => setRequiresReview(true)}
                                className="mr-2"
                                data-testid="review-toggle"
                            />
                            Review Before Sending
                        </label>
                    </div>
                    <div className="flex justify-end space-x-2">
                        <button
                            onClick={onClose}
                            className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                            data-testid="cancel-button"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
                            data-testid="confirm-schedule-button"
                        >
                            Schedule
                        </button>
                    </div>
                </div>
            </div>
    )
}

export default ScheduleMessageModal