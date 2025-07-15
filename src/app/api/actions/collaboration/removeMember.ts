import toast from "react-hot-toast"
import api from "../../api"

export const removeMember = async(
    partnershipId: string,
    memberId: string,
    requireUserId: string
) => {
    try {
        const res = await api.delete(`/collaboration/remove/${partnershipId}/${memberId}`, {
            withCredentials: true,
            data: requireUserId
        })
        toast.success("removing")
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}