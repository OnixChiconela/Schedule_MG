'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import io, { Socket } from 'socket.io-client';
import { useUser } from './UserContext';
import { getNotifications, checkUserPartnerships } from '../api/actions/notifications/getNotifications';
import toast from 'react-hot-toast';
import { Invite } from '../types';

interface NotificationContextType {
  notificationCount: number;
  resetCount: () => void;
  setLastViewed: () => void;
  videoSocket: Socket | null;
  notifSocket: Socket | null;
  chatSocket: Socket | null;
  partnershipUpdateSocket: Socket | null
  newCallData: { callId: string; title: string; partnershipId: string; createdById?: string } | null;
  joinPartnership: (partnershipId: string) => void
}

const NotificationContext = createContext<NotificationContextType>({
  notificationCount: 0,
  resetCount: () => { },
  setLastViewed: () => { },
  videoSocket: null,
  notifSocket: null,
  chatSocket: null,
  partnershipUpdateSocket: null,
  newCallData: null,
  joinPartnership: () => { }
});

export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const { currentUser } = useUser();
  const [notificationCount, setNotificationCount] = useState(0);
  const [videoSocket, setVideoSocket] = useState<Socket | null>(null);
  const [notifSocket, setNotifSocket] = useState<Socket | null>(null);
  const [chatSocket, setChatSocket] = useState<Socket | null>(null);
  const [partnershipUpdateSocket, setPartnershipUpdateSocket] = useState<Socket | null>(null);
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
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const videoSocket = io(`${process.env.NEXT_PUBLIC_WS}/video-call`, {
      withCredentials: true,
      query: { userId: currentUser.id, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    });

    const partnershipUpdateSocket = io(`${process.env.NEXT_PUBLIC_WS}/partnership/updates`, {
      withCredentials: true,
      query: { userId: currentUser.id, token },
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    })
    // const partnershipUpdateSocket = io('/partnership/updates', {
    //   path: '/socket.io',
    //   transports: ['websocket'],
    //   secure: true,
    //   withCredentials: true,
    //   query: { userId: currentUser.id, token },
    //   // Define a URL base separadamente:
    //   forceNew: true,
    //   autoConnect: true,
    //   reconnection: true,
    //   timeout: 10000,
    //   upgrade: false, // força WebSocket puro
    //   reconnectionAttempts: 5,
    //   reconnectionDelay: 1000,
    //   reconnectionDelayMax: 5000,
    //   // isto aqui é crucial:
    //   // define o host do backend (caso diferente do frontend)
    //   // mesmo que o path/namespace esteja separado
    //   host: process.env.NEXT_PUBLIC_WS, // ou explicitamente 'wss://seubackend.com'
    // });

    setVideoSocket(videoSocket);
    setNotifSocket(notificationSocket);
    setPartnershipUpdateSocket(partnershipUpdateSocket)

    notificationSocket.on('connect', () => {
      console.log(`notifSocket connected: userId=${currentUser.id}, socketId=${notificationSocket.id}`);
      notificationSocket.emit('joinUserRoom', { userId: currentUser.id });
      // toast.success('Connected to notifications');
    });

    notificationSocket.on('new-call', ({ callId, title, partnershipId, createdById }) => {
      console.log(`Received new-call: callId=${callId}, partnershipId=${partnershipId}, userId=${currentUser.id}, title=${title}, createdById=${createdById}`);
      if (currentUser.id !== createdById) {
        setNewCallData({ callId, title: title || 'Untitled', partnershipId, createdById });
        toast.success(`New call: ${title || 'Untitled'}`);
      }
    });

    // toast.error(`notification id:${notifSocket?.id}`)

    notificationSocket.on('inviteReceived', (data: Invite) => {
      console.log('inviteReceived:', data);
      toast.success(`Invite received: ${data.partnership?.name || 'Unknown'}`);
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
      // toast.error(`Notification socket error: ${err.message}`);
    });

    notificationSocket.on('disconnect', () => {
      console.log(`notifSocket disconnected: userId=${currentUser.id}`);
      setNotifSocket(null);
    });

    videoSocket.on('connect', () => {
      console.log(`videoSocket connected: userId=${currentUser.id}`);
      videoSocket.emit('join', currentUser.id);
      // toast.success('Connected to video call');
    });

    videoSocket.on('connect_error', (err) => {
      console.error(`videoSocket connect_error: ${err.message}`);
      // toast.error(`Video call socket error: ${err.message}`);
    });

    videoSocket.on('disconnect', () => {
      console.log(`videoSocket disconnected: userId=${currentUser.id}`);
      setVideoSocket(null);
    });

    partnershipUpdateSocket.on('connect', () => {
      console.log(`partnershipUpdateSocket connected: userId=${currentUser.id}, socketId=${partnershipUpdateSocket.id}`);
      // toast.success('Connected to partnership updates');
    });

    partnershipUpdateSocket.on('memberRemoved', (data) => {
      console.log(`Received memberRemoved: ${JSON.stringify(data)}`);
      // Delegar ao componente (e.g., CollabMembersModal) ou gerenciar aqui se desejar
      toast.success('Member removed');
    });

    partnershipUpdateSocket.on('roleUpdated', (data) => {
      console.log(`Received roleUpdated: ${JSON.stringify(data)}`);
      // Delegar ao componente ou gerenciar aqui
      toast.success('Role updated');
    });

    partnershipUpdateSocket.on('connect_error', (err) => {
      console.error(`partnershipUpdateSocket connect_error: ${err.message}`);
      // toast.error(`Partnership update socket error: ${err.message}`);
    });

    partnershipUpdateSocket.on('disconnect', () => {
      console.log(`partnershipUpdateSocket disconnected: userId=${currentUser.id}`);
      setPartnershipUpdateSocket(null);
    });

    // Check if user has partnerships before connecting to chatSocket
    const setupChatSocket = async () => {
      try {
        const hasPartnerships = await checkUserPartnerships(currentUser.id);
        if (!hasPartnerships) {
          console.log(`User ${currentUser.id} has no partnerships, skipping chatSocket connection`);
          return;
        }

        const chatSocket = io(`${process.env.NEXT_PUBLIC_WS}/partnership/chat`, {
          withCredentials: true,
          query: { userId: currentUser.id, token },
          transports: ['websocket', 'polling'],
          reconnection: true,
          reconnectionAttempts: 5,
          reconnectionDelay: 1000,
          reconnectionDelayMax: 5000,
        });
        // const chatSocket = io('/partnership/chat', {
        //   path: '/socket.io',
        //   transports: ['websocket'],
        //   secure: true,
        //   withCredentials: true,
        //   query: { userId: currentUser.id, token },
        //   // Define a URL base separadamente:
        //   forceNew: true,
        //   autoConnect: true,
        //   reconnection: true,
        //   timeout: 10000,
        //   upgrade: false, // força WebSocket puro
        //   reconnectionAttempts: 5,
        //   reconnectionDelay: 1000,
        //   reconnectionDelayMax: 5000,
        //   // isto aqui é crucial:
        //   // define o host do backend (caso diferente do frontend)
        //   // mesmo que o path/namespace esteja separado
        //   host: process.env.NEXT_PUBLIC_WS, // ou explicitamente 'wss://seubackend.com'
        // });

        setChatSocket(chatSocket);

        chatSocket.on('connect', () => {
          console.log(`chatSocket connected: userId=${currentUser.id}`);
          // chatSocket.emit("joinPartnership", { partnershipId: currentUser.id }); // Ajustar para partnershipId se necessário
          // toast.success('Connected to chat');
        });

        chatSocket.on("chat-created", (data) => {
          if (data.userId === currentUser.id) {
            // toast.success("chat")
            console.log(`chatSocket received chat-created: ${data.chatId}`);
          }
        });

        chatSocket.on("new-chat", (data) => {
          if (data.visibleTo.includes(currentUser.id)) {
            console.log(`chatSocket received new-chat: ${data.chatId}`);
          }
        });

        chatSocket.on('receiveMessage', (message: { user: { id: string } }) => {
          console.log(`receiveMessage: userId=${currentUser.id}, message=`, message);
          if (message.user.id !== currentUser.id) {
            setNotificationCount((prev) => prev + 1);
          }
        });

        chatSocket.on('messageRead', () => {
          console.log(`messageRead: userId=${currentUser.id}`);
          setNotificationCount((prev) => Math.max(0, prev - 1));
        });

        chatSocket.on('connect_error', (err) => {
          console.error(`chatSocket connect_error: ${err.message}`);
          // toast.error(`Chat socket error: ${err.message}`);
        });

        chatSocket.on('disconnect', () => {
          console.log(`chatSocket disconnected: userId=${currentUser.id}`);
          setChatSocket(null);
        });

        chatSocket.on('error', (data) => {
          console.error(`chatSocket error event: userId=${currentUser.id}, error=${data.message}`);
          // toast.error(`Chat error: ${data.message}`);
        });
      } catch (error) {
        console.error(`Failed to check partnerships for user ${currentUser.id}:`, error);
      }
    };

    setupChatSocket();

    const fetchNotifications = async () => {
      try {
        const lastViewedAt = localStorage.getItem(`lastViewedNotifications_${currentUser.id}`);
        const data = await getNotifications(currentUser.id, lastViewedAt ? new Date(lastViewedAt).toISOString() : null);
        setNotificationCount(
          data!.invites.length + data!.unreadMessages.length + data!.systemAlerts.length,
        );
      } catch (error) {
        console.error(`Failed to fetch notifications for user ${currentUser.id}:`, error);
        setNotificationCount(0);
      }
    };

    fetchNotifications();

    return () => {
      console.log('Cleaning up WebSocket connections');
      notificationSocket.off('connect');
      notificationSocket.off('new-call');
      notificationSocket.off('inviteReceived');
      notificationSocket.off('notificationReceived');
      notificationSocket.off('notificationRead');
      notificationSocket.off('connect_error');
      notificationSocket.off('disconnect');
      videoSocket.off('connect');
      videoSocket.off('connect_error');
      videoSocket.off('disconnect');
      if (partnershipUpdateSocket) {
        partnershipUpdateSocket.off('connect');
        partnershipUpdateSocket.off('memberRemoved');
        partnershipUpdateSocket.off('roleUpdated');
        partnershipUpdateSocket.off('connect_error');
        partnershipUpdateSocket.off('disconnect');
        partnershipUpdateSocket.disconnect();
      }
      if (chatSocket) {
        chatSocket.off("connect");
        chatSocket.off("chat-created");
        chatSocket.off("new-chat");
        chatSocket.off("receiveMessage");
        chatSocket.off("messageRead");
        chatSocket.off("connect_error");
        chatSocket.off("disconnect");
        chatSocket.off("error");
        chatSocket.disconnect();
      }
      notificationSocket.disconnect();
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

  const joinPartnership = (partnershipId: string) => {
    if (chatSocket && chatSocket.connected) {
      console.log(`Joining partnership ${partnershipId} for user ${currentUser?.id}`);
      chatSocket.emit("joinPartnership", { partnershipId, userId: currentUser?.id });
    }
  };

  return (
    <NotificationContext.Provider value={{
      notificationCount,
      resetCount,
      setLastViewed,
      videoSocket,
      notifSocket,
      chatSocket,
      partnershipUpdateSocket,
      newCallData,
      joinPartnership
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