import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Event, UserPreferences } from '../types/events';

// Simulação de eventos sugeridos (pode vir de uma API ou banco de dados)
const fetchSuggestedEvents = async (interests: string[]): Promise<Event[]> => {
    try {
        // Carrega o JSON diretamente (não precisa de requisição POST para um arquivo estático)
        const response = await fetch('/fake/suggestedEvents.json');
        const data = await response.json();

        // Filtra eventos com base nos interesses do usuário
        const filteredEvents = data.filter((event: Event) =>
            event.tags.some((tag: string) => interests.includes(tag))
        );
        return filteredEvents;
    } catch (error) {
        console.error('Erro ao carregar eventos sugeridos:', error);
        return [];
    }
};

const SuggestedEvents = ({ userPreferences }: { userPreferences: UserPreferences }) => {
    const [suggestedEvents, setSuggestedEvents] = useState<Event[]>([]);

    useEffect(() => {
        const loadSuggestions = async () => {
            const events = await fetchSuggestedEvents(userPreferences.interests);
            console.log("loading events...")
            setSuggestedEvents(events.slice(0, 3)); // Limita a 3 sugestões
        };
        loadSuggestions();
    }, [userPreferences.interests]);

    return (
        <div className="mb-6 mt-6">
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-4">Suggested Events</h3>
          {suggestedEvents.length > 0 ? (
            <div className="space-y-2">
              {suggestedEvents.map((event) => (
                <motion.div
                  key={event.id}
                  className="p-4 rounded-lg bg-gray-100 dark:bg-slate-700"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <h4 className="font-medium text-gray-800 dark:text-gray-200">{event.title}</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {new Date(event.start).toLocaleString()} - {new Date(event.end).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Categories: {event.tags.join(', ') || 'None'}
                  </p>
                  <button
                    className="mt-2 text-blue-500 hover:underline"
                    onClick={() => {
                      // Aqui você pode implementar a lógica para adicionar o evento ao calendário
                      console.log('Adicionar evento ao calendário:', event);
                    }}
                  >
                    Add to Calendar
                  </button>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-600 dark:text-gray-400">
              No suggested events available.
            </p>
          )}
        </div>
      );
    };

export default SuggestedEvents;