import api from "../../api"


export const getInvite = async (inviteToken: string) => {
    try {
        const res = await api.get(`collaboration/partnerships/invite/${inviteToken}`, { withCredentials: true })
        return res.data
    } catch (error) {
        console.error('Error fetching invite:', error);
        throw new Error("Failed to fetch invite")
    }
}

export const acceptInviteToken = async (inviteToken: string, userId: string) => {
    try {
        const res = await api.post(`/collaboration/partnerships/accept-invite-token/${inviteToken}`,{userId}, {
            withCredentials: true
        });
        return res.data;
    } catch (error: any) {
        console.error('Error accepting invite:', error);
        throw new Error(error.response?.data?.message || 'Failed to accept invite');
    }
}