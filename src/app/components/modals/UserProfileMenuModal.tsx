'use client';

import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '@/app/themeContext';
import { ReactNode } from 'react';
import { Divider } from '../navbars/SideNavbar';
import { useUser } from '@/app/context/UserContext';

interface UserProfileMenuModalProps {
    isOpen: boolean;
    onClose: () => void;
    name: string;
    email?: string;
    visual: ReactNode;
    onSettingsClick: () => void;
    onProfileClick: () => void;
    onLogoutClick: () => void;
}

const UserProfileMenuModal: React.FC<UserProfileMenuModalProps> = ({
    isOpen,
    onClose,
    name,
    email,
    visual,
    onSettingsClick,
    onProfileClick,
    onLogoutClick,
}) => {
    const { theme } = useTheme();
    const modalRef = useRef<HTMLDivElement>(null);
    const { currentUser } = useUser()

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (modalRef.current && !modalRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);



    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    ref={modalRef}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute z-20 mt-2 left-0 w-80 rounded-md shadow-lg ${theme === 'light' ? 'bg-white border border-gray-300' : 'bg-slate-900 border border-slate-800'}`}
                >
                    <div className="p-4">
                        <div className="flex items-center mb-4">
                            <div className="w-10 h-10 flex items-center justify-center">{visual}</div>
                            <div className="ml-3">
                                <p className={`text-sm font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'}`}>
                                    {name}
                                </p>
                                {email && (
                                    <p className={`text-xs ${theme === 'light' ? 'text-gray-500' : 'text-gray-400'}`}>
                                        {email}
                                    </p>
                                )}
                            </div>
                        </div>

                        <Divider theme={theme} />

                        <ul className="mt-2">
                            <li
                                onClick={onSettingsClick}
                                className={`px-3 py-2 text-sm cursor-pointer rounded-md ${theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-500'}`}
                            >
                                Settings
                            </li>
                            <li
                                onClick={onProfileClick}
                                className={`px-3 py-2 text-sm cursor-pointer rounded-md ${theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-500'}`}
                            >
                                Go to Profile Page
                            </li>
                            <li
                                onClick={onLogoutClick}
                                className={`px-3 py-2 text-sm cursor-pointer rounded-md ${theme === 'light' ? 'text-gray-800 hover:bg-gray-100' : 'text-gray-200 hover:bg-slate-500'}`}
                            >
                                {currentUser ? (
                                    <div>Log out</div>
                                ): (
                                    <div>Log in</div>
                                )}
                            </li>
                        </ul>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default UserProfileMenuModal;