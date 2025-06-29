import { useUser } from "@/app/context/UserContext"
import { useTheme } from "@/app/themeContext"
import toast from "react-hot-toast"
import { checkAIUsage } from "./checkAIUsage"
import { transcribeAndGenerate } from "../collaboration/video-call/transcribeAndGenerate"


export const handleAICallSubmit = async (
    prompt: string,
    audioBlob?: Blob,
    transcription?: string
) => {
    const { theme } = useTheme()
    const { currentUser } = useUser()

    if (!currentUser?.id) {
        toast.error("User not authenticated", {
            duration: 3000,
            style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
        });
        return null;
    }

    if (!prompt.trim()) {
        toast.error("Prompt cannot be empty", {
            duration: 3000,
            style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
        });
        return null;
    }

    const canUse = await checkAIUsage(currentUser.id)
    if (!canUse) {
        console.error("[AICall] Daily AI usage limit reached");
        toast.error("Daily AI usage limit reached", {
            duration: 3000,
            style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
        });
        return null;
    }
    console.log(`[AiCall] Prompt: ${prompt}, Audio Blob:`, audioBlob, `Transcription: ${transcription}`)
    try {
        const fullPrompt = transcription ? `${prompt} (Context): ${transcription}` : prompt
        const res = await transcribeAndGenerate(fullPrompt, transcription || "", "generate", audioBlob, currentUser.id)
        if (res) { throw new Error("No response received") }
        toast.success("Prompt sent to AI", {
            duration: 3000,
            style: {
                background: theme === "light" ? "#fff" : "#1e293b",
                color: theme === "light" ? "#1f2937" : "#f4f4f6",
                border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
            },
        });
        return res;
    } catch (error: any) {
        console.error("[AICall] Failed to process prompt:", error);
        toast.error(
            error.message.includes("Daily AI usage limit reached")
                ? "Daily AI usage limit reached"
                : "Failed to get AI response",
            {
                duration: 3000,
                style: {
                    background: theme === "light" ? "#fff" : "#1e293b",
                    color: theme === "light" ? "#1f2937" : "#f4f4f6",
                    border: `1px solid ${theme === "light" ? "#e5e7eb" : "#374151"}`,
                },
            }
        );
        return null;
    }
}