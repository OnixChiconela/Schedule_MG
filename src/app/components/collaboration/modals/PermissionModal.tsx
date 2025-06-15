"use client"

import { useTheme } from "@/app/themeContext"
import { Users } from "@/app/types"
import {motion} from "framer-motion"

interface PermissionModalProps {
    isOpen: boolean
    onClose: () => void
    partnershipUsers: Users[]
    selectedUsers: string[]
    setSelectedUsers: (users: string[]) => void
    onSave: (chatId: string) => void
    chatId: string
}

const PermissionModal: React.FC<PermissionModalProps> = ({
    isOpen,
    onClose,
    partnershipUsers,
    selectedUsers,
    setSelectedUsers,
    onSave,
    chatId
}) => {
    const {theme} = useTheme()
    if(!isOpen) return null
    return(
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        >
            <div className={`w-80 rounded-lg p-4 ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-800 text-neutral-200"}`}>
                <h3 className="text-lg font-semibold mb-4">Manage chat permissions</h3>
                <div className="space-y-2 mb-4">
                    {partnershipUsers.map((user) => (
                        <div key={user.id} className="flex items-center">
                            <input 
                                type="checkbox"
                                checked={selectedUsers.includes(user.id)}
                                onChange={(e) => {
                                    if(e.target.checked) {
                                        setSelectedUsers([...selectedUsers, user.id])
                                    } else {
                                        setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                                    }
                                }}
                                className="mr-2"
                            />
                            <label>{`${user.firstName} ${user.lastName}`}</label>
                        </div>
                    ))}
                    <div className="mt-4 flex justify-end space-x-2">
                        <button
                            onClick={onClose}
                            className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-800"}`}
                        >
                            Cancel
                        </button>
                        <button
                            onClick={() => onSave(chatId)}
                            className={`px-3 py-1 rounded ${theme === "light" ? "bg-gray-200 hover:bg-gray-300" : "bg-slate-700 hover:bg-slate-800"}`}
                        >
                            Save
                        </button>
                    </div>
                </div>
            </div>

        </motion.div>
    )
}

export default PermissionModal