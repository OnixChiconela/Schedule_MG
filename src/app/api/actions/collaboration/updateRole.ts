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
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}