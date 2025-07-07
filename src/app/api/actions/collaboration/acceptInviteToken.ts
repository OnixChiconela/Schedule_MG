import api from "../../api"


export const acceptInviteToken = async(inviteId: string, userId: string) => {
    try {
        const res = await api.post(`/collaboration/partnerships/accept-invite-token/${inviteId}`, {userId}, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        throw new Error("Failed to accept invite")
    }
}