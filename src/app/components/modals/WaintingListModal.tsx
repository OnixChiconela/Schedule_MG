'use client';

import { useState } from 'react';
import { useTheme } from '@/app/themeContext';
import { motion, AnimatePresence } from 'framer-motion';
import { IoMdArrowForward } from 'react-icons/io';
import { waitingList } from '@/app/api/actions/user/waitingList';
import toast from 'react-hot-toast';

interface WaitingListModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: (email: string) => void;
}

const WaitingListModal: React.FC<WaitingListModalProps> = ({ isOpen, onClose, onConfirm }) => {
    const { theme } = useTheme();
    const [email, setEmail] = useState('');
    const [error, setError] = useState<string | null>(null);

    const handleSubmit = async () => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            setError('Please enter a valid email address.');
            return;
        }

        setError(null);
        onConfirm(email);
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className={`${theme == "light" ? "bg-white" : "bg-slate-800"} p-6 rounded-xl shadow-lg w-full max-w-md`}
                        initial={{ y: 50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 50, opacity: 0 }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <h2 className={`${theme == "light" ? "text-gray-900" : "text-gray-100"} text-xl font-bold mb-4`}>Join the Waiting List</h2>
                        {/* <p className={`${theme == "light" ? "text-gray-600" : "text-gray-300"} mb-4`}>
                            Sign up to get early access to <strong>Scheuor</strong> and enjoy:
                        </p> */}
                        {/* <ul className={`list-disc list-inside ${theme == "light" ? "text-gray-500" : "text-gray-300"} mb-4 flex flex-col gap-2`}>
                            <li>Early access to the beta version</li>
                            <li>Smart suggestions for local events and content</li>
                            <li>Exclusive previews of upcoming features</li>
                            <li>Help shape the product with your feedback</li>
                            <li>Be among the first to use the cloud database when it launches</li>
                        </ul> */}

                        <span className={`${theme == "light" ? "text-neutral-600" : "text-neutral-200"}`}>Email:</span>
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder=""
                            className={`w-full p-2 mb-4 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-fuchsia-600 dark:focus:ring-fuchsia-400
                ${theme == "light" ? "text-neutral-600" : "text-neutral-200"}`}
                        />
                        {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                        <div className="flex justify-end gap-4">
                            <button
                                onClick={onClose}
                                className={`px-4 py-2 ${theme == "light" ? "text-gray-600 hover:text-gray-800" : "text-gray-300 hover:text-gray-100"}  `}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                className="flex items-center gap-2 px-4 py-2 bg-fuchsia-600 text-white rounded-full hover:bg-fuchsia-900 transition"
                            >
                                Confirm 
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export default WaitingListModal;