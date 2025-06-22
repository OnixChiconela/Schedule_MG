'use client';

import { fetchEventSuggestions } from '@/app/api/actions/eventSuggestions/fetchEventSuggestions';
import { useTheme } from '@/app/themeContext';
import { format, getYear } from 'date-fns';
import { useState, useEffect } from 'react';
import SuggestionCards from './SuggestionCard';
import toast from 'react-hot-toast';

export interface Suggestion {
    id: string;
    title: string;
    date: string;
    category: string;
    description: string;
    imageUrl: string
    url: string;
}

interface EventSuggestionsProps {
    userCategories: string[];
    location?: { latitude: number; longitude: number } | null;
}

const LOCAL_STORAGE_KEY = 'eventSuggestions';

const EventSuggestions: React.FC<EventSuggestionsProps> = ({ userCategories, location }) => {
    const { theme } = useTheme();
    const [displayedSuggestions, setDisplayedSuggestions] = useState<Suggestion[]>([]);
    const [availableSuggestions, setAvailableSuggestions] = useState<Suggestion[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const categoryColors = {
        'Music': 'border-pink-500',
        'Arts & Theatre': 'border-purple-500',
        'Sports': 'border-green-500',
        'Miscellaneous': 'border-gray-300',
    };

    const saveToLocalStorage = (suggestions: Suggestion[]) => {
        try {
            localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(suggestions));
        } catch (err) {
            console.error('Error saving to localStorage:', err);
        }
    };

    const loadFromLocalStorage = (): Suggestion[] => {
        try {
            const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
            return stored ? JSON.parse(stored) : [];
        } catch (err) {
            console.error('Error loading from localStorage:', err);
            return [];
        }
    };

    const removeSuggestion = (id: string) => {
        const updatedDisplayed = displayedSuggestions.filter(s => s.id !== id);
        const updatedAvailable = availableSuggestions.filter(s => s.id !== id);

        let newDisplayed = updatedDisplayed;
        if (updatedAvailable.length > 0 && updatedDisplayed.length < 3) {
            const nextEvent = updatedAvailable.find(s => !updatedDisplayed.some(ds => ds.id === s.id));
            if (nextEvent) {
                newDisplayed = [...updatedDisplayed, nextEvent];
            }
        }

        setDisplayedSuggestions(newDisplayed);
        setAvailableSuggestions(updatedAvailable);
        saveToLocalStorage(updatedAvailable);
    };

    const formatEventDate = (dateString: string) => {
        const date = new Date(dateString);
        const currentYear = getYear(new Date());
        const eventYear = getYear(date);
        const formatString = eventYear === currentYear ? 'd MMM' : 'd MMM yyyy';
        return format(date, formatString);
    };

    // useEffect(() => {
    //     const fetchSuggestions = async () => {
    //         if (!location) {
    //             toast.error("Cannot find your location")
    //             setLoading(false);
    //             return;
    //         }

    //         const storedSuggestions = loadFromLocalStorage();
    //         if (storedSuggestions.length > 0) {
    //             setAvailableSuggestions(storedSuggestions);
    //             setDisplayedSuggestions(storedSuggestions.slice(0, 3));
    //             setLoading(false);
    //             return;
    //         }

    //         // Se não houver eventos no localStorage, buscar do backend
    //         try {
    //             // const fetchedSuggestions = await fetchEventSuggestions({ latitude: 34.0522, longitude: -118.24534 }, userCategories);
    //             const fetchedSuggestions = await fetchEventSuggestions(location, userCategories);
    //             const mappedSuggestions = fetchedSuggestions.map((event: any, index: number) => ({
    //                 id: `${event.name}-${event.date}-${index}`,
    //                 title: event.name,
    //                 date: event.date,
    //                 category: event.category,
    //                 url: event.url || `https://example.com/events/${event.name.replace(/\s/g, '-')}`,
    //                 description: event.description || 'No description available',
    //                 imageUrl: event.imageUrl
    //             }));

    //             // Armazenar até 10 eventos
    //             const limitedSuggestions = mappedSuggestions.slice(0, 10);
    //             setAvailableSuggestions(limitedSuggestions);
    //             setDisplayedSuggestions(limitedSuggestions.slice(0, 3));
    //             saveToLocalStorage(limitedSuggestions);
    //         } catch (err: any) {
    //             console.error('Error fetching suggestions:', err.message || err);
    //             setError(err.message || 'Failed to load suggestions');
    //         } finally {
    //             setLoading(false);
    //         }
    //     };

    //     fetchSuggestions();
    // }, [location, userCategories]);

    const interest = localStorage.getItem("userPreferences")

    if (loading) return <div className="text-center py-4">Loading...</div>;
    if (error) return <div className="text-center py-4 text-red-500">{error}</div>;
    if (!interest) {
        return (
            <div className={`${theme === 'light' ? 'text-neutral-600 hover:text-neutral-800' : 'text-neutral-300 hover:text-neutral-100'} underline cursor-pointer text-center`}
                onClick={() => window.location.href = '/onboarding'}
            >
                Pick your preferences so we can give you ideas!
            </div>
        );
    }
    if (displayedSuggestions.length == 0) {
        return (
            <div className={`${theme === 'light' ? 'text-neutral-600 hover:text-neutral-800' : 'text-neutral-300 hover:text-neutral-100'} underline cursor-pointer text-center`}
                onClick={() => window.location.href = '/onboarding'}
            >
                
            </div>
        );
    }

    return (
        <>
            <h2 className={`text-lg sm:text-[18px] font-semibold mb-3 sm:mb-4 ${theme === 'light' ? 'text-neutral-800' : 'text-neutral-300'}`}>
                Event Suggestions
            </h2>
            <SuggestionCards
                suggestions={displayedSuggestions}
                userInterests={userCategories}
                categoryColors={categoryColors}
                removeSuggestion={removeSuggestion}
                formatEventDate={formatEventDate}
            />
        </>
    );
};

export default EventSuggestions;