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
    scheduledTime: string
) => {
    try {
        const res = await api.post(``)
        return res.data
    } catch (error) {
        console.error('Error answering chat:', error);
        throw error;
    }
}