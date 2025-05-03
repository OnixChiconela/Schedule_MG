'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { format, getYear } from 'date-fns';

type Suggestion = {
  id: number;
  title: string;
  date: string;
  category: string;
};

export default function Suggestions() {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const categories = ['Technology', 'Art', 'Finance', 'Education', 'Health', 'Travel', 'Music'];

  useEffect(() => {
    const newSuggestions: Suggestion[] = [
      { id: 1, title: "AI Conference", date: "2025-05-15T09:00:00", category: "Technology" },
      { id: 2, title: "Machine Learning Summit", date: "2025-06-10T10:00:00", category: "Technology" },
      { id: 3, title: "Art Exhibition", date: "2025-05-20T14:00:00", category: "Art" },
      { id: 4, title: "Modern Art Workshop", date: "2025-07-01T13:00:00", category: "Art" },
      { id: 5, title: "Investment Seminar", date: "2025-05-25T11:00:00", category: "Finance" },
      { id: 6, title: "Stock Market Crash Course", date: "2025-06-15T15:00:00", category: "Finance" },
      { id: 7, title: "Online Education Summit", date: "2025-05-30T09:00:00", category: "Education" },
      { id: 8, title: "Teacher Training", date: "2025-06-20T14:00:00", category: "Education" },
      { id: 9, title: "Health & Wellness Expo", date: "2025-06-05T10:00:00", category: "Health" },
      { id: 10, title: "Yoga Retreat", date: "2025-07-10T08:00:00", category: "Health" },
      { id: 11, title: "Travel Expo", date: "2025-07-10T10:00:00", category: "Travel" },
      { id: 12, title: "Adventure Travel Fair", date: "2025-08-01T12:00:00", category: "Travel" },
      { id: 13, title: "Live Concert", date: "2025-06-05T19:00:00", category: "Music" },
      { id: 14, title: "Jazz Festival", date: "2025-07-15T18:00:00", category: "Music" },
    ];
    setSuggestions(newSuggestions);
  }, []);

  const formatEventDate = (dateString: string) => {
    const date = new Date(dateString);
    const currentYear = getYear(new Date());
    const eventYear = getYear(date);
    const formatString = eventYear === currentYear ? 'd MMM' : 'd MMM yyyy';
    return format(date, formatString);
  };

  const removeSuggestion = (id: number) => {
    setSuggestions(suggestions.filter((s) => s.id !== id));
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100">Suggestions</h1>
      <div className="space-x-5 flex overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-transparent">
        {suggestions.map((item) => (
          <motion.div
            key={item.id}
            className="py-4 pr-12 pl-4 rounded-lg shadow-md bg-white dark:bg-slate-800"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h3 className="font-medium text-gray-800 dark:text-gray-200">{item.title}</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {formatEventDate(item.date)} - {item.category}
            </p>
            <button
              className="mt-2 text-red-500 hover:text-red-700 rounded-md px-2 py-1 transition-colors"
              onClick={() => removeSuggestion(item.id)}
            >
              X
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
}