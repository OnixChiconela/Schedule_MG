'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { useUser } from './UserContext';
import { getNotifications } from '../api/actions/notifications/getNotifications';
import toast from 'react-hot-toast';
import { Invite } from '../types';

interface NotificationContextType {
    notificationCount: number;
    resetCount: () => void;
    setLastViewed: () => void;
    videoSocket: Socket | null;
    notifSocket: Socket | null;
    chatSocket: Socket | null;
    newCallData: { callId: string; title: string; partnershipId: string } | null;
}

const NotificationContext = createContext<NotificationContextType>({
    notificationCount: 0,
    resetCount: () => {},
    setLastViewed: () => {},
    videoSocket: null,
    notifSocket: null,
    chatSocket: null,
    newCallData: null,
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
    const { currentUser } = useUser();
    const [notificationCount, setNotificationCount] = useState(0);
    const [videoSocket, setVideoSocket] = useState<Socket | null>(null);
    const [notifSocket, setNotifSocket] = useState<Socket | null>(null);
    const [chatSocket, setChatSocket] = useState<Socket | null>(null);
    const [newCallData, setNewCallData] = useState<NotificationContextType['newCallData']>(null);
    const token = typeof window !== 'undefined' ? localStorage.getItem('access_token') : null;

    useEffect(() => {
        if (!currentUser?.id || !token) {
            console.warn('Missing userId or token in localStorage');
            return;
        }

        const notificationSocket = io(`${process.env.NEXT_PUBLIC_WS}/notifications`, {
            withCredentials: true,
            query: { userId: currentUser.id, token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });

        const chatSocket = io(`${process.env.NEXT_PUBLIC_WS}/partnership/chat`, {
            withCredentials: true,
            query: { userId: currentUser.id, token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });

        const videoSocket = io(`${process.env.NEXT_PUBLIC_WS}/video-call`, {
            withCredentials: true,
            query: { userId: currentUser.id, token },
            transports: ['websocket', 'polling'],
            reconnection: true,
            reconnectionAttempts: 3,
            reconnectionDelay: 1000,
        });

        setVideoSocket(videoSocket);
        setNotifSocket(notificationSocket);
        setChatSocket(chatSocket);

        notificationSocket.on('connect', () => {
            console.log(`notifSocket connected: userId=${currentUser.id}, socketId=${notificationSocket.id}`);
            notificationSocket.emit('joinUserRoom', { userId: currentUser.id });
            toast.success('Connected to notifications');
        });

        notificationSocket.on('new-call', ({ callId, title, partnershipId }) => {
            console.log(`Received new-call: callId=${callId}, partnershipId=${partnershipId}, userId=${currentUser.id}, title=${title}`);
            setNewCallData({ callId, title: title || 'Untitled', partnershipId });
            toast.success(`New call: ${title || 'Untitled'}`);
        });

        notificationSocket.on('inviteReceived', (data) => {
            console.log('inviteReceived:', data);
            toast.success('Invite received');
            setNotificationCount((prev) => prev + 1);
        });

        notificationSocket.on('notificationReceived', () => {
            setNotificationCount((prev) => prev + 1);
        });

        notificationSocket.on('notificationRead', () => {
            setNotificationCount((prev) => Math.max(0, prev - 1));
        });

        notificationSocket.on('connect_error', (err) => {
            console.error(`notifSocket connect_error: userId=${currentUser.id}, error=${err.message}`);
            toast.error(`Notification socket error: ${err.message}`);
        });

        notificationSocket.on('disconnect', () => {
            console.log(`notifSocket disconnected: userId=${currentUser.id}`);
        });

        chatSocket.on('connect', () => {
            console.log(`chatSocket connected: userId=${currentUser.id}`);
            chatSocket.emit('join', currentUser.id);
            toast.success('Connected to chat');
        });

        chatSocket.on('receiveMessage', (message: { user: { id: string } }) => {
            if (message.user.id !== currentUser.id) {
                setNotificationCount((prev) => prev + 1);
            }
        });

        chatSocket.on('messageRead', () => {
            setNotificationCount((prev) => Math.max(0, prev - 1));
        });

        chatSocket.on('connect_error', (err) => {
            console.error(`chatSocket connect_error: ${err.message}`);
        });

        videoSocket.on('connect', () => {
            console.log(`videoSocket connected: userId=${currentUser.id}`);
            videoSocket.emit('join', currentUser.id);
            toast.success('Connected to video call');
        });

        videoSocket.on('connect_error', (err) => {
            console.error(`videoSocket connect_error: ${err.message}`);
            toast.error(`Video call socket error: ${err.message}`);
        });

        const fetchNotifications = async () => {
            try {
                const lastViewedAt = localStorage.getItem(`lastViewedNotifications_${currentUser.id}`);
                const data = await getNotifications(currentUser.id, lastViewedAt ? new Date(lastViewedAt).toISOString() : null);
                setNotificationCount(
                    data!.invites.length + data!.unreadMessages.length + data!.systemAlerts.length,
                );
            } catch (error) {
                setNotificationCount(0);
            }
        };

        fetchNotifications();

        return () => {
            notificationSocket.off('connect');
            notificationSocket.off('new-call');
            notificationSocket.off('inviteReceived');
            notificationSocket.off('notificationReceived');
            notificationSocket.off('notificationRead');
            notificationSocket.off('connect_error');
            notificationSocket.off('disconnect');
            chatSocket.off('connect');
            chatSocket.off('receiveMessage');
            chatSocket.off('messageRead');
            chatSocket.off('connect_error');
            videoSocket.off('connect');
            videoSocket.off('connect_error');
            notificationSocket.disconnect();
            chatSocket.disconnect();
            videoSocket.disconnect();
        };
    }, [currentUser?.id, token]);

    const resetCount = () => {
        setNotificationCount(0);
    };

    const setLastViewed = () => {
        const now = new Date().toISOString();
        localStorage.setItem(`lastViewedNotifications_${currentUser?.id}`, now);
        resetCount();
    };

    return (
        <NotificationContext.Provider value={{
            notificationCount,
            resetCount,
            setLastViewed,
            videoSocket,
            notifSocket,
            chatSocket,
            newCallData,
        }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
