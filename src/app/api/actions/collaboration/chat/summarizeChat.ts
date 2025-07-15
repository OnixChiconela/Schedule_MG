import api from "@/app/api/api"


export const summarizeChat = async (partnershipId: string, chatId: string, userId: string) => {
    try {
        const res = await api.post(`/collab-chat/summarize`, {partnershipId, chatId, userId}, {
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}