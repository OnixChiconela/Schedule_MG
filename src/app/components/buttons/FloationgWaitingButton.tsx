'use client';

import { useTheme } from '@/app/themeContext';
import { motion } from 'framer-motion';
import { useState } from 'react';
import { IoMdArrowForward } from 'react-icons/io';
import WaitingListModal from '../modals/WaintingListModal';
import { waitingList } from '@/app/api/actions/user/waitingList';
import toast from 'react-hot-toast';

const FloatingWaitingButton = () => {
    const { theme } = useTheme();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const buttonStyle = {
        backgroundColor: theme === 'light' ? '#c026d3' : '#d946ef',
        borderColor: theme === 'light' ? '#c026d3' : '#d946ef',
    };

    const hoverStyle = {
        backgroundColor: theme === 'light' ? '#a21caf' : '#c026d3',
    };

    const handleConfirm = async (email: string) => {
        toast.loading("")
        try {
            await waitingList(email);
            toast.success('Welcome on board!');
            setIsModalOpen(false);

        } catch (error) {
            console.error(error);
            toast.error('Failed to submit. Please check your connection.');
        } finally {
            toast.dismiss()
        }
    };

    return (
        <>
            <motion.div
                className="fixed bottom-6 right-6 z-50 flex items-center justify-center gap-2 px-6 py-3 rounded-full border-2 cursor-pointer"
                style={buttonStyle}
                animate={{ y: [0, -2, 0] }}
                transition={{ duration: 1.5, repeat: Infinity, repeatType: 'reverse' }}
                whileHover={hoverStyle}
                onClick={() => setIsModalOpen(true)}
            >
                <span className="text-sm font-semibold text-white">Join the Waiting List</span>
                <IoMdArrowForward size={20} className="text-white transition-transform hover:scale-120" />
            </motion.div>
            <WaitingListModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} onConfirm={handleConfirm} />
        </>
    );
};

export default FloatingWaitingButton;