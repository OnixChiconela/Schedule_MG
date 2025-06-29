import toast from "react-hot-toast"
import { transcribeAndGenerate } from "./transcribeAndGenerate"


export async function transcribeAudio(audioBlob: Blob, userId: string, retries = 2) {
    if (audioBlob.size === 0) {
        console.error("[AICALL] Empty audio blob cannot transcribe")
        toast.error("No audio recorder to transcribe", { duration: 3000 })
        return ""
    }

    for (let attempt = 1; attempt <= retries; attempt++) {
        try {
            const transcription = await transcribeAndGenerate("", "", "transcribe", audioBlob, userId)
            if (transcription) {
                console.log("[AICall] transcription successful:", transcription)
                return transcription
            }
            console.error("[AICall] Transcription API returned no text")
            return ""
        } catch (error: any) {
            console.error(`[AICall] Transcription failed (attempt ${attempt}):`, error);
            if (attempt === retries) {
                toast.error(
                    error.message.includes("Daily AI usage limit reached")
                        ? "Daily AI usage limit reached"
                        : "Transcription service unavailable",
                    {
                        duration: 3000,
                    }
                );
                return "";
            }
        }
    }
    return ""
}