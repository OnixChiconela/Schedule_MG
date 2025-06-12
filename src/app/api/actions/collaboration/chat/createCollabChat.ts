import api from "@/app/api/api"

interface chatCreation {
    partnershipId: string
    userId: string
    name: string
}
export const createCollabChat = async(data: chatCreation) => {
    try {
        const res = await api.post(`/collab-chat/create-chat`, data, {
            withCredentials: true
        })
        return res.data
    } catch (error) { 
        console.error("Failed to create new chat")
        throw new Error
    }
}