import api from "@/app/api/api"


export const summarizeChat = async () => {
    try {
        const res = await api.get(`/huggingface/summarizeChat`)
        return res.data
    } catch (error) {

    }
}