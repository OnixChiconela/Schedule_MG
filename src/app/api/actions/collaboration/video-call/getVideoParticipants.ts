import api from "@/app/api/api"


export const getVideoParticipants = async (callId: string, userId: string) => {
    try {
        const res = await api.get(`/video-call/video-participants/${callId}`, {})
    } catch (error) {

    }
}