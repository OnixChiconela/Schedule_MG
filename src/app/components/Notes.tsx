'use client';

import { motion } from 'framer-motion';
import { useTheme } from '@/app/themeContext';
import { X } from 'lucide-react';
import ProfileVisualDropdown from './ProfileVisualDropdown';
import { useState } from 'react';

interface Note {
    id: number;
    content: string;
    title?: string;
    emoji?: string;
    createdAt?: number;
}

interface NotesProps {
    notes: Note[];
    updateEmoji: (id: number, emoji: string) => void;
    updateNote: (id: number, content: string) => void;
    removeNote: (id: number) => void;
    addNote: () => void;
    emojiOptions: string[];
}

const Notes: React.FC<NotesProps> = ({ notes, updateEmoji, updateNote, removeNote, addNote, emojiOptions }) => {
    const { theme } = useTheme();
    const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 mb-6">
            {notes.map((note) => (
                <motion.div
                    key={note.id}
                    className={`p-3 sm:p-4 rounded-xl shadow-lg ${theme === 'light' ? 'bg-white' : 'bg-slate-800'} border ${theme === 'light' ? 'border-gray-200' : 'border-slate-700'} relative min-h-[150px]`}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                >
                    <div className="absolute left-3 sm:left-4 top-2">
                        <div className="relative">
                            <div
                                className={`w-10 h-10 flex items-center justify-center rounded-md cursor-pointer ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-600'}`}
                                onClick={() => setOpenDropdownId(openDropdownId === note.id ? null : note.id)}
                            >
                                <span className="text-xl">{note.emoji || '👤'}</span>
                            </div>
                            <ProfileVisualDropdown
                                isOpen={openDropdownId === note.id}
                                onClose={() => setOpenDropdownId(null)}
                                onSelect={(visual) => {
                                    if (visual.type === 'emoji') {
                                        updateEmoji(note.id, visual.value as string);
                                    }
                                    setOpenDropdownId(null);
                                }}
                                emojis={emojiOptions}
                                // icons={[]}
                                // images={[]}
                            />
                        </div>
                    </div>
                    <button
                        className={`absolute right-2 top-2 ${theme === 'light' ? 'hover:bg-gray-100' : 'hover:bg-slate-600 text-neutral-200'} rounded-md px-2 py-0 transition-colors`}
                        onClick={() => removeNote(note.id)}
                    >
                        <X size={16} />
                    </button>
                    <textarea
                        className={`w-full h-20 sm:h-24 p-2 rounded-md flex ${theme === 'light' ? 'bg-gray-50 text-gray-900' : 'bg-slate-700 text-gray-200'} border ${theme === 'light' ? 'border-gray-300' : 'border-slate-600'} focus:outline-none focus:ring-2 focus:ring-neutral-800 mt-10 sm:mt-10`}
                        value={note.content}
                        onChange={(e) => updateNote(note.id, e.target.value)}
                        placeholder={note.title || 'Add a note or reminder...'}
                    />
                </motion.div>
            ))}
            {notes.length < 3 && (
                <motion.button
                    className={`p-3 sm:p-4 rounded-xl shadow-lg ${theme === 'light' ? 'bg-gray-200 text-gray-800 hover:bg-gray-300' : 'bg-slate-700 text-gray-200 hover:bg-slate-600'} flex items-center justify-center min-h-[150px]`}
                    onClick={addNote}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    whileHover={{ scale: 1.05 }}
                    transition={{ duration: 0.2 }}
                >
                    Add Note
                </motion.button>
            )}
        </div>
    );
};

export default Notes;