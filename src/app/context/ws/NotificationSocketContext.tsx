'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useUser } from '@/app/context/UserContext';

interface NotificationSocketContextType {
    notificationSocket: Socket | null;
}

const NotificationSocketContext = createContext<NotificationSocketContextType>({ notificationSocket: null });

export const NotificationSocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { currentUser } = useUser();
    const [notificationSocket, setNotificationSocket] = useState<Socket | null>(null);

    const token = localStorage.getItem('token'); // Adjust based on your auth
    useEffect(() => {
        if (!currentUser?.id) return;
        const socket = io(`${process.env.NEXT_PUBLIC_WS}/notifications`, {
            withCredentials: true,
            query: { userId: currentUser.id, token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });

        socket.on('connect', () => {
            console.log('Connected to notifications WebSocket');
        });

        socket.on('connect_error', (error) => {
            console.error('Notification socket connection error:', error);
        });

        setNotificationSocket(socket);

        return () => {
            socket.disconnect();
        };
    }, [currentUser?.id]);

    return (
        <NotificationSocketContext.Provider value={{ notificationSocket }}>
            {children}
        </NotificationSocketContext.Provider>
    );
};

export const useSocket = () => useContext(NotificationSocketContext);