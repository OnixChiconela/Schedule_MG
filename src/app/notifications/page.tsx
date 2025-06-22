"use client"

import { io } from "socket.io-client"
import { useTheme } from "../themeContext"
import { useUser } from "../context/UserContext"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Invite, NotificationMessage, SystemAlert } from "../types"
import toast from "react-hot-toast"
import { getNotifications } from "../api/actions/notifications/getNotifications"
import Navbar from "../components/navbars/Navbar"
import SideNavbar from "../components/navbars/SideNavbar"
import { motion } from "framer-motion"
import { Bell, MessageSquare } from "lucide-react"
import { acceptInvite } from "../api/actions/notifications/acceptInvite"
import { markAllMessagesAsRead, markAllNotificationsAsRead, markMessageAsRead, markSystemAlertAsRead } from "../api/actions/notifications/markMessageAsRead"
import { format, isThisYear } from "date-fns"
import { useNotifications } from "../context/NotificationContext"


const NotificationsPages = () => {
    const { theme, toggleTheme } = useTheme()
    const { currentUser } = useUser()
    const router = useRouter()
    const { setLastViewed, notifSocket } = useNotifications();

    const [isSidebarOpen, setIsSidebarOpen] = useState(false)
    const [invites, setInvites] = useState<Invite[]>([])
    const [messages, setMessages] = useState<NotificationMessage[]>([])
    const [systemAlerts, setSystemAlerts] = useState<SystemAlert[]>([])
    const [notificationCount, setNotificationCount] = useState(0)
    const [isLoading, setIsLoading] = useState(true);


    useEffect(() => {
        if (!currentUser?.id) {
            toast.error("Please log in to view notifications", { duration: 3000 });
            router.push("/my-space/auth/login");
            return;
        }
    }, [currentUser?.id])

    useEffect(() => {
        let isMounted = true;

        const handleInviteReceived = (data: Invite) => {
            if (isMounted) {
                console.log('inviteReceived:', data);
                setInvites((prev) => [...prev, data]);
                setNotificationCount((prev) => prev + 1);
                toast.success(`Invite received: ${data.partnership?.name || 'Unknown'}`);
            }
        };

        const handleNotificationReceived = (data: NotificationMessage) => {
            if (isMounted) {
                console.log('notificationReceived:', data);
                if (data.user.id !== currentUser?.id) { // Excluir o criador
                    setMessages((prev) => [...prev, data]);
                    setNotificationCount((prev) => prev + 1);
                    toast.success(`New message from ${data.user.firstName} ${data.user.lastName}`);
                } else {
                    console.log(`Notification ignored for sender ${currentUser?.id}`);
                }
            }
        };

        const handleNotificationRead = () => {
            if (isMounted) {
                setNotificationCount((prev) => Math.max(0, prev - 1));
                // Atualizar mensagens ou alertas lidos (se necessário)
            }
        };

        const handleConnectError = (err: Error) => {
            if (isMounted) {
                console.error(`notifSocket connect_error: ${err.message}`);
                toast.error(`Notification socket error: ${err.message}`);
            }
        };

        const handleDisconnect = () => {
            if (isMounted) {
                console.log(`notifSocket disconnected: userId=${currentUser?.id}`);
            }
        };

        if (notifSocket) {
            console.log(`[Socket] Initial notifSocket state: id=${notifSocket.id}, connected=${notifSocket.connected}`);

            // Adicionar listeners para os eventos
            notifSocket.on('inviteReceived', handleInviteReceived);
            notifSocket.on('notificationReceived', handleNotificationReceived);
            notifSocket.on('notificationRead', handleNotificationRead);
            notifSocket.on('connect_error', handleConnectError);
            notifSocket.on('disconnect', handleDisconnect);
        }

        // Carregar notificações iniciais via polling
        if (!currentUser?.id) {
            toast.error("Please log in to view notifications", { duration: 3000 });
            router.push("/my-space/auth/login");
            return;
        }

        const fetchNotifications = async () => {
            try {
                setIsLoading(true);
                const data = await getNotifications(currentUser.id);
                setInvites(data.invites);
                setMessages(data.unreadMessages);
                setSystemAlerts(data.systemAlerts);
                setLastViewed();
            } catch (error) {
                toast.error("Failed to load notifications");
                console.error(error);
                setInvites([]);
                setMessages([]);
                setSystemAlerts([]);
            } finally {
                setIsLoading(false);
            }
        };
        fetchNotifications();

        // Cleanup
        return () => {
            isMounted = false;
            if (notifSocket) {
                notifSocket.off('inviteReceived', handleInviteReceived);
                notifSocket.off('notificationReceived', handleNotificationReceived);
                notifSocket.off('notificationRead', handleNotificationRead);
                notifSocket.off('connect_error', handleConnectError);
                notifSocket.off('disconnect', handleDisconnect);
            }
        };

    }, [currentUser?.id, router, setLastViewed, notifSocket, setNotificationCount]);

    const formatDate = (dateStr: string) => {
        const date = new Date(dateStr);
        return isThisYear(date) ? format(date, 'd MMM') : format(date, 'd MMM yyyy');
    };

    const acceptInviteHandler = async (inviteId: string) => {
        if (!currentUser) return
        try {
            await acceptInvite(inviteId, currentUser?.id)
            setInvites((prev) => prev.filter((inv) => inv.id !== inviteId))
            setNotificationCount((prev) => Math.max(0, prev - 1))
            toast.success("Invited accepted")
        } catch (error) {
            toast.error("Failed to accept invite");
        }
    }

    const markMessageAsReadHandler = async (messageId: string, chatId: string) => {
        if (!currentUser) return
        try {
            await markMessageAsRead(messageId, currentUser.id);
            router.push(`/chat/${chatId}`);
        } catch (error) {
            toast.error("Failed to mark message as read");
        }
    };

    const markNotificationAsReadHandler = async (notificationId: string) => {
        if (!currentUser) return
        try {
            await markSystemAlertAsRead(notificationId, currentUser.id);
        } catch (error) {
            toast.error("Oops. Something went wrong")
        }
    }

    return (
        <div
            className={`min-h-screen flex ${theme === "light" ? "bg-white" : "bg-slate-900"} transition-colors duration-300`}
            style={{ paddingTop: "env(safe-area-inset-top, 0px)" }}
        >
            <Navbar
                themeButton={false}
                showToggleSidebarButton={true}
                isSidebarOpen={isSidebarOpen}
                toggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
                showNotificationBell={true}
            />
            <SideNavbar
                theme={theme}
                toggleTheme={toggleTheme}
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
                isVisible={isSidebarOpen}
            />
            <main
                className="flex-1 p-4 sm:p-6 lg:ml-[260px] sm:pt-20 max-w-screen-xl mx-auto"
                style={{ paddingTop: `calc(5rem + env(safe-area-inset-top, 0px))` }}
            >
                <h1 className={`text-2xl font-bold mb-6 ${theme === "light" ? "text-gray-900" : "text-neutral-200"}`}>
                    Inbox
                </h1>
                {isLoading ? (
                    <p className={`${theme === "light" ? "text-gray-600" : "text-neutral-400"}`}>Loading...</p>
                ) : (
                    <div className="space-y-4">
                        {invites.length === 0 && messages.length === 0 && systemAlerts.length === 0 ? (
                            <p className={`${theme === "light" ? "text-gray-600" : "text-neutral-400"}`}>No notifications</p>
                        ) : (
                            <>
                                {invites.map((invite) => (
                                    <motion.div
                                        key={invite.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-lg shadow-md ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-slate-800 text-neutral-200"
                                            } flex items-center justify-between relative`}
                                    >
                                        {invite.status === 'PENDING' && (
                                            <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Bell size={20} />
                                            <div>
                                                <p className="font-semibold">Invite to {invite.partnership.name}</p>
                                                <p className="text-sm">Role: {invite.role}</p>
                                                <p className="text-sm text-gray-500">
                                                    Invited at: {formatDate(invite.invitedAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => acceptInviteHandler(invite.id)}
                                            className={`px-3 py-1 rounded-lg ${theme === "light" ? "bg-fuchsia-600 text-white" : "bg-fuchsia-700 text-neutral-200"
                                                } hover:bg-fuchsia-800`}
                                            aria-label={`Accept invite to ${invite.partnership.name}`}
                                        >
                                            Accept
                                        </motion.button>
                                    </motion.div>
                                ))}
                                {messages.map((message) => (
                                    <motion.div
                                        key={message.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-lg shadow-md ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-slate-800 text-neutral-200"
                                            } flex items-center justify-between relative`}
                                    >
                                        {!message.read && (
                                            <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <MessageSquare size={20} />
                                            <div>
                                                <p className="font-semibold">
                                                    New message in {message.chat.name} from {message.user.firstName} {message.user.lastName}
                                                </p>
                                                <p className="text-sm">{message.content}</p>
                                                <p className="text-sm text-gray-500">
                                                    Sent at: {formatDate(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => markMessageAsReadHandler(message.id, message.chat.id)}
                                            className={`px-3 py-1 rounded-lg ${theme === "light" ? "bg-fuchsia-600 text-white" : "bg-fuchsia-700 text-neutral-200"
                                                } hover:bg-fuchsia-800`}
                                            aria-label={`View message in ${message.chat.name}`}
                                        >
                                            View
                                        </motion.button>
                                    </motion.div>
                                ))}
                                {systemAlerts.map((alert) => (
                                    <motion.div
                                        key={alert.id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-4 rounded-lg shadow-md ${theme === "light" ? "bg-gray-100 text-gray-900" : "bg-slate-800 text-neutral-200"
                                            } flex items-center justify-between relative`}
                                    >
                                        {!alert.read && (
                                            <span className="absolute top-2 left-2 w-2 h-2 bg-red-500 rounded-full" />
                                        )}
                                        <div className="flex items-center gap-3">
                                            <Bell size={20} />
                                            <div>
                                                <p className="font-semibold">System Alert</p>
                                                <p className="text-sm">{alert.content}</p>
                                                <p className="text-sm text-gray-500">
                                                    Received at: {formatDate(alert.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                        <motion.button
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            onClick={() => markNotificationAsReadHandler(alert.id)}
                                            className={`px-3 py-1 rounded-lg ${theme === "light" ? "bg-fuchsia-600 text-white" : "bg-fuchsia-700 text-neutral-200"
                                                } hover:bg-fuchsia-800`}
                                            aria-label="Mark system alert as read"
                                        >
                                            Mark as Read
                                        </motion.button>
                                    </motion.div>
                                ))}
                            </>
                        )}
                    </div>
                )}
            </main>
        </div>
    )
}

export default NotificationsPages