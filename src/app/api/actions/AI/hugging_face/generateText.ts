import api from "@/app/api/api"
import toast from "react-hot-toast"

export const generateText = async (prompt: string) => {
    try {
        const res = await api.post("/huggingface/generate", {prompt} )
        return res.data
    } catch(error) {
        console.error("Faild to generate AI response: ", error)
    }
}