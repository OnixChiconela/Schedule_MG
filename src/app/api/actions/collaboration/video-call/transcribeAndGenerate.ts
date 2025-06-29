import api from "@/app/api/api";
import { useTheme } from "@/app/themeContext";
import toast from "react-hot-toast";

export const transcribeAndGenerate = async (
    prompt: string,
    transcription: string,
    action: "generate" | "transcribe" | "suggest" | "summary" | "clarification" = "generate",
    audioBlob?: Blob,
    userId?: string,
) => {
    toast.success(`The god damn prompt: ${prompt}`)
    if (!userId) {
        throw new Error("User ID is required")
    }

    try {
        const formData = new FormData()
        formData.append("userId", userId)
        if (prompt) {
            formData.append("prompt", prompt)
        }
        if (transcription) {
            formData.append("transcription", transcription)
        }
        if (audioBlob) {
            formData.append("file", audioBlob, "recording.webm")
        }
        toast.success(`${formData.get("prompt")}`)
        const endpoint = `/huggingFace/${action}`
        console.log(`[transcribeAndGenerate] sending request to ${endpoint}:`, { prompt, action, hasAudio: !!audioBlob, userId })
        const response = await api.post(endpoint, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
        if (!response.data) {
            throw new Error("No response text received from AI")
        }
        return response.data
    } catch (error) {
        console.error(`[transcribeAndGenerate] Failed to process ${action}:`, error);
        throw error;
    }
}