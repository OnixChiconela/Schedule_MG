import api from "@/app/api/api"

export const updateChatpermissions = async (chatId: string, userId: string, visibleTo: string[]) => {
    try {
        const res = await api.put(`/collab-chat/${chatId}/permissions`,{
            userId,
            visibleTo
        }, {
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}