import toast from "react-hot-toast"
import api from "../../api"

export const acceptInvite = async (memberId: string, userId: string) => {
    toast.success(`member id: ${memberId}`)
    try {
        const res = await api.post(`collaboration/accept/${memberId}`, {userId}, {
            withCredentials: true
        })
        return res.data
    } catch(error) {
        console.log("Failed to accept invite")
        throw new Error()
    }
} 