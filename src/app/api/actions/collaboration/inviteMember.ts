import api from "../../api"


export const inviteMember = async (
    partnershipId: string,
    email: string,
    ownerId: string,
    role: string) => {
    try {
        const res = await api.post(`collaboration/${partnershipId}/invite/members`, { email, ownerId, role }, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error('Error inviting member:', error);
        throw new Error('Failed to invite member');
    }
}