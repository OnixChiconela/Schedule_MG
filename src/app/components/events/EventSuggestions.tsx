'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/app/themeContext';
import { motion } from 'framer-motion';
import { useLocation } from '@/app/context/LocationContext';
import { fetchEventSuggestions } from '@/app/api/actions/eventSuggestions/fetchEventSuggestions';

type Event = {
  name: string;
  description: string;
  date: string;
  location: string;
  category: string;
  source: string;
  url: string;
};

const EventSuggestions = ({ userCategories }: { userCategories: string[] }) => {
  const { theme } = useTheme();
  const location = useLocation();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadSuggestions = async () => {
      if (!location) {
        setLoading(false);
        return;
      }

      try {
        const suggestions = await fetchEventSuggestions(location, userCategories);
        // Limit to top 3 events
        setEvents(suggestions.slice(0, 3));
      } catch (error) {
        console.error('Failed to load event suggestions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSuggestions();
  }, [location, userCategories]);

  if (loading) {
    return <div className={`text-center mt-10 ${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}>Loading suggestions...</div>;
  }

  if (!location) {
    return <div className={`text-center mt-10 ${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}>Unable to determine your location.</div>;
  }

  if (!events.length) {
    return <div className={`text-center mt-10 ${theme == "light" ? "text-neutral-800" : "text-neutral-200"}`}>No events found for your preferences.</div>;
  }

  if (!events) {
    return
  }

  return (
    <div className="grid gap-4 p-4 mt-10">
      <h2 className={`text-xl font-semibold ${theme === 'light' ? 'text-neutral-700' : 'text-neutral-300'}`}>
        Recommended Events
      </h2>
      {events.map((event, index) => (
        <motion.div
          key={index}
          className={`p-4 rounded-xl border ${theme === 'light' ? 'border-gray-100 bg-white' : 'border-slate-600 bg-slate-800'}`}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <h3 className={`text-lg font-semibold ${theme === 'light' ? 'text-black' : 'text-white'}`}>
            {/* {event.name} */}
          </h3>
          <p className={`text-sm ${theme === 'light' ? 'text-gray-600' : 'text-gray-400'}`}>
            {/* {event.description.slice(0, 100)}... */}
          </p>
          <div className="mt-2 text-sm">
            {/* <p><strong>Date:</strong> {event!.date}</p>
            <p><strong>Location:</strong> {event!.location}</p>
            <p><strong>Category:</strong> {event!.category}</p>
            <p><strong>Source:</strong> {event!.source}</p> */}
            <a href={event.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              View details
            </a>
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export default EventSuggestions;