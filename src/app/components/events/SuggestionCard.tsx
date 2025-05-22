'use client';

import { useTheme } from '@/app/themeContext';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';

interface Suggestion {
  id: string;
  title: string;
  date: string;
  category: string;
  url: string;
  description: string;
  imageUrl?: string;
}

interface SuggestionCardsProps {
  suggestions: Suggestion[];
  userInterests: string[];
  categoryColors: { [key: string]: string };
  removeSuggestion: (id: string) => void;
  formatEventDate: (dateString: string) => string;
}

const shuffleSuggestions = (suggestions: Suggestion[]): Suggestion[] => {
  const shuffled = [...suggestions];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  const result: Suggestion[] = [];
  for (const suggestion of shuffled) {
    if (result.length === 0 || suggestion.category !== result[result.length - 1].category) {
      result.push(suggestion);
    }
  }
  const remaining = shuffled.filter(s => !result.includes(s));
  result.push(...remaining);
  return result.slice(0, 3);
};

const SuggestionCards: React.FC<SuggestionCardsProps> = ({ suggestions, userInterests, categoryColors, removeSuggestion, formatEventDate }) => {
  const { theme } = useTheme();
  const displayedSuggestions = shuffleSuggestions(suggestions);
  console.log('Displayed Suggestions:', displayedSuggestions); // Log temporário

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {displayedSuggestions.map((item) => (
        <motion.div
          key={item.id}
          className={`relative rounded-xl shadow-md border-l-4 ${categoryColors[item.category] || 'border-gray-300'} overflow-hidden cursor-pointer transition-transform hover:scale-[1.02]`}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          onClick={() => window.open(item.url, '_blank')}
        >
          <div className="relative w-full h-32">
            <img
              src={item.imageUrl || 'https://example.com/images/default.jpg'} // Usar imageUrl do evento, com fallback
              alt={item.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/20" />
          </div>
          <div className={`p-4 ${theme === 'light' ? 'bg-white' : 'bg-slate-800'}`}>
            <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-gray-800' : 'text-gray-200'} line-clamp-1`}>
              {item.title}
            </h3>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} mt-1 line-clamp-2`}>
              {item.description}
            </p>
            <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'} mt-1`}>
              {formatEventDate(item.date)} • {item.category}
            </p>
          </div>
          <div
            className={`absolute top-2 right-2 w-6 h-6 cursor-pointer transition-all flex items-center justify-center rounded-full ${theme === 'light' ? 'text-neutral-700 hover:bg-red-100 hover:text-neutral-950' : 'text-neutral-300 hover:bg-red-900/20 hover:text-neutral-100'} z-10`}
            onClick={(e) => {
              e.stopPropagation();
              removeSuggestion(item.id);
            }}
            aria-label="Remove suggestion"
          >
            <X size={16} />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default SuggestionCards;