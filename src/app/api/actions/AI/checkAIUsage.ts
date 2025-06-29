import toast from "react-hot-toast"
import api from "../../api"

export const checkAIUsage = async (userId: string) => {
    try {
        const response = await api.get(`/huggingface/check-ai-usage?userId=${userId}`)
        if (!response.data.canUse) {
            return false
        }
        return true
    } catch (error) {
        toast.error("Failed to check your AI usage. Try again!")
        return false
    }
}