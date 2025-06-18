"use client"

import { useTheme } from "@/app/themeContext"
import { useState, useEffect } from "react"
import toast from "react-hot-toast"

interface ScheduleReviewModalProps {
    isOpen: boolean
    onClose: () => void
    message: string | null
    onConfirm: (editedMessage: string) => Promise<void>
}

const ScheduleReviewModal = ({ isOpen, onClose, message, onConfirm }: ScheduleReviewModalProps) => {

    const { theme } = useTheme()
    const [editedMessage, setEditedMessage] = useState(message || "")

    useEffect(() => {
        if (message) {
            setEditedMessage(message)
            toast("Scheduled message ready for review!", {
                duration: 5000,
                style: {
                    background: theme === "light" ? "#fff" : "#1e3a8a",
                    color: theme === "light" ? "#000" : "#fff",
                },
            });
        }
    }, [message, theme])

    if (!isOpen || !message) return null

    const handleConfirm = async () => {
        if (!editedMessage.trim()) {
            toast.error("Message cannot be empty", { duration: 3000 });
            return;
        }
        try {
            await onConfirm(editedMessage);
            toast.success("Message sent successfully", { duration: 3000 });
            onClose();
        } catch (error) {
            toast.error("Failed to send message", { duration: 3000 });
        }
    };

    return (
        <div
            className="fixed inset-0 bg-black/50 bg-opacity-50 flex items-center justify-center z-[1000]"
            data-testid="schedule-review-modal"
        >
            <div
                className={`w-96 p-4 rounded ${theme === "light" ? "bg-white text-gray-900" : "bg-blue-900 text-white"}`}
            >
                <h3 className="text-lg font-semibold mb-4">Review Scheduled Message</h3>
                <textarea
                    value={editedMessage}
                    onChange={(e) => setEditedMessage(e.target.value)}
                    className={`w-full p-2 rounded mb-4 ${theme === "light" ? "bg-gray-100 border-gray-300" : "bg-blue-700 border-blue-200"} resize-none h-32`}
                    placeholder="Edit the scheduled message..."
                    data-testid="review-textarea"
                />
                <div className="flex justify-end space-x-2">
                    <button
                        onClick={onClose}
                        className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-blue-700 hover:bg-blue-600"}`}
                        data-testid="cancel-button"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleConfirm}
                        className={`px-3 py-1 rounded ${theme === "light" ? "bg-blue-500 text-white hover:bg-blue-600" : "bg-blue-600 hover:bg-blue-500"}`}
                        data-testid="confirm-button"
                    >
                        Send
                    </button>
                </div>
            </div>
        </div>
    );
}

export default ScheduleReviewModal