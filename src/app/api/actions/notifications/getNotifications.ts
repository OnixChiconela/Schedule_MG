import toast from "react-hot-toast"
import api from "../../api"

export const getNotifications = async (userId: string, lastViewedAt?: string | null) => {
    try {
        const res = await api.get(`/notifications/pending/${userId}`, {
            withCredentials: true
        })
        const data = {
            invites: res.data.invites || [],
            systemAlerts: res.data.systemAlerts || [],
            unreadMessages: res.data.unreadMessages || [],
        };
        if (lastViewedAt) {
            const lastViewedDate = new Date(lastViewedAt);
            data.invites = data.invites.filter((invite: { invitedAt: string }) => new Date(invite.invitedAt) > lastViewedDate);
            data.unreadMessages = data.unreadMessages.filter((msg: { createdAt: string }) => new Date(msg.createdAt) > lastViewedDate);
            data.systemAlerts = data.systemAlerts.filter((alert: { createdAt: string }) => new Date(alert.createdAt) > lastViewedDate);
        }
        return data;
    } catch (error) {
        console.error('Failed while loading notifications:', error);
        throw new Error('Failed to load notifications');
    }
} 

export const checkUserPartnerships = async (userId: string) => {
    try {
        const res = await api.get(`/collaboration/partnerships/check-memberships/${userId}`)
        return res.data
    } catch (error) {
        console.error(`Error checking partnership for user ${userId}:`, error)
        return false
    }
}

