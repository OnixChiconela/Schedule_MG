"use client";

import { useTheme } from "@/app/themeContext";
import { Users } from "@/app/types";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect } from "react";
import { Divider } from "../../navbars/SideNavbar";

interface PermissionModalProps {
    isOpen: boolean;
    onClose: () => void;
    partnershipUsers: Users[];
    selectedUsers: string[];
    setSelectedUsers: (users: string[]) => void;
    onSave: (chatId: string) => void;
    chatId: string;
    visibleTo: string[];
}

const PermissionModal: React.FC<PermissionModalProps> = ({
    isOpen,
    onClose,
    partnershipUsers,
    selectedUsers,
    setSelectedUsers,
    onSave,
    chatId,
    visibleTo,
}) => {
    const { theme } = useTheme();
    const controls = useAnimationControls();

    // Animação controlada
    useEffect(() => {
        if (isOpen) {
            controls.start({ opacity: 1, scale: 1 });
        } else {
            controls.start({ opacity: 0, scale: 0.95 });
        }
    }, [isOpen, controls]);

    if (!isOpen) return null;

    const handleToggleUser = (userId: string) => {
        if (selectedUsers.includes(userId)) {
            setSelectedUsers(selectedUsers.filter((id) => id !== userId));
        } else {
            setSelectedUsers([...selectedUsers, userId]);
        }
    };

    return (
        <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={controls}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
        >
            <motion.div
                className={`w-96 rounded-lg p-6 shadow-lg ${theme === "light" ? "bg-white text-neutral-800" : "bg-slate-800 text-neutral-200"}`}
                initial={{ scale: 0.95 }}
                animate={controls}
                exit={{ scale: 0.95 }}
            >
                <h3 className="text-xl font-bold pb-1">Manage Chat Permissions</h3>
                <div><Divider theme={theme} /></div>

                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {partnershipUsers.map((user) => (
                        <div key={user.id} className="flex items-center justify-between py-1">
                            <label className="flex items-center space-x-3 cursor-pointer w-full">
                                <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user.id)}
                                    onChange={(e) => {
                                        if (e.target.checked) {
                                            setSelectedUsers([...selectedUsers, user.id]);
                                        } else {
                                            setSelectedUsers(selectedUsers.filter((id) => id !== user.id));
                                        }
                                    }}
                                    className="mr-2 "
                                />
                                {/* <div className="h-4 w-4 border rounded-full p-[2px]">
                                    <div className={`h-full w-full ${selectedUsers.includes(user.id)
                                        ? "bg-fuchsia-600"
                                        : ""} rounded-full`} />
                                </div> */}
                                <span className="text-sm font-medium">{`${user.firstName} ${user.lastName}`}</span>
                            </label>

                        </div>
                    ))}
                </div>
                <div className="mt-6 flex justify-end space-x-4">
                    <button
                        onClick={onClose}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${theme === "light"
                            ? "bg-gray-200 hover:bg-gray-300 text-gray-800"
                            : "bg-slate-700 hover:bg-slate-600 text-white"
                            }`}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={() => onSave(chatId)}
                        className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${theme === "light"
                            ? "bg-blue-600 hover:bg-blue-700 text-white"
                            : "bg-blue-700 hover:bg-blue-800 text-white"
                            }`}
                        disabled={selectedUsers.length === 0}
                    >
                        Save
                    </button>
                </div>
            </motion.div>
        </motion.div>
    );
};

export default PermissionModal;