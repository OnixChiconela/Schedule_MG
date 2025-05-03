export type Suggestion = {
    id: number;
    title: string;
    date: string;
    category: string;
};

export const initialSuggestions: Suggestion[] = [
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