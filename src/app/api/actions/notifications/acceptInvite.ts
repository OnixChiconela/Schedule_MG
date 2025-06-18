import api from "../../api"

export const acceptInvite = async(inviteId: string, userId: string) => {
    try {
        const res = await api.post(`/notifications/invites/${inviteId},accept`, {userId}, {
            withCredentials: true
        })
        return res
    } catch (error) {
        console.error("Failed to accept invitee: ", error)
    }
}