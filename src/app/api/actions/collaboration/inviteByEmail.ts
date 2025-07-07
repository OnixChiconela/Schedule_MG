import toast from "react-hot-toast"
import api from "../../api"

export const inviteByEmail = async (
    partnershipId: string,
    email: string,
    ownerId: string,
    role: string
) => {
    try {
        const res = await api.post(`/collaboration/${partnershipId}/invite-by-email/members`, {
            email, ownerId, role
        }, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error('Failed to invite by email:', error);
        throw new Error('Failed to invite by email');
    }
}