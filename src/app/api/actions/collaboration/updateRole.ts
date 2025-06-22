import api from "../../api"

export const updateMemberRole = async (
    partnershipId: string,
    memberId: string,
    requireUserId: string,
    newRole: string) => {
    try {
        const res = await api.patch(`/collaboration/update-role/${partnershipId}/${memberId}`, {
            newRole,
            requireUserId
        }, { withCredentials: true, })
        res.data
    } catch (error) {
        console.log("Failed to update member role", error)
        throw error;
    }
}