import api from "@/app/api/api"

export const answerChat = async (partnershipId: string, chatId: string, userId: string) => {
    try {
        const res = await api.post(`/collab-chat/answer`, {partnershipId, chatId, userId})
        return res.data
    } catch (error) {
        console.error('Error answering chat:', error);
        throw error;
    }
}

export const createScheduledMessage = async (
    partnershipId: string,
    chatId: string,
    userId: string,
    prompt: string,
    scheduledTime: string,
    requiresReview: boolean
) => {
    try {
        const res = await api.post(`collab-chat/schedule-message`, {
            partnershipId,
            chatId,
            userId,
            prompt,
            scheduledTime,
            requiresReview
        })
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}