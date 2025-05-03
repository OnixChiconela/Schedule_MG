'use client';

import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useTheme } from '../themeContext';
import { IoMdArrowDropdown } from 'react-icons/io';

type Option = {
    value: string;
    label: string;
};

type CustomDropdownProps = {
    options: Option[];
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
};

const CustomDropdown = ({ options, value, onChange, placeholder }: CustomDropdownProps) => {
    const { theme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selectedLabel = options.find((opt) => opt.value === value)?.label || placeholder || 'Select...';

    return (
        <div className="relative w-full" ref={dropdownRef}>
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-3 py-1.5 rounded-md text-sm flex items-center justify-between ${theme === 'light' ? 'bg-white text-gray-900 border border-gray-300' : 'bg-slate-600 text-neutral-200 border border-slate-500'} focus:outline-none focus:ring-2 focus:ring-fuchsia-500`}
            >
                <span>{selectedLabel}</span>
                <IoMdArrowDropdown
                    size={16}
                    className={`transition-transform ${isOpen ? 'rotate-180' : ''}`}
                />
            </button>
            <AnimatePresence>
                {isOpen && (
                    <motion.ul
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    transition={{ duration: 0.2 }}
                    className={`absolute z-10 w-full mt-1 rounded-md shadow-lg ${theme === 'light' ? 'bg-white border border-gray-300' : 'bg-slate-600 border border-slate-500'} max-h-60 overflow-y-auto scrollbar-thin scrollbar-w-1 ${theme === 'light' ? 'scrollbar-thumb-gray-400 scrollbar-track-gray-100' : 'scrollbar-thumb-gray-500 scrollbar-track-slate-700'}`}
                    >
                        {options.map((option) => (
                            <li
                                key={option.value}
                                onClick={() => {
                                    onChange(option.value);
                                    setIsOpen(false);
                                }}
                                className={`px-3 py-1.5 text-sm cursor-pointer ${theme === 'light' ? 'text-gray-900 hover:bg-fuchsia-100' : 'text-neutral-200 hover:bg-fuchsia-700'} ${value === option.value ? 'bg-fuchsia-500 text-white' : ''}`}
                            >
                                {option.label}
                            </li>
                        ))}
                    </motion.ul>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CustomDropdown;