import api from "@/app/api/api";

export const processAudioWithAI = async (
    action: "generate" | "transcribe" | "suggest" | "summarize" | "clarification",
    audioBlob: Blob,
    userId: string,
    extraData?: { prompt?: string; transcription?: string }
) => {
    try {
        const formData = new FormData()
        formData.append("userId", userId)
        formData.append("file", audioBlob, "recording.webm")

        if (extraData?.prompt) formData.append("prompt", extraData.prompt)
        if (extraData?.transcription) formData.append("transcription", extraData.transcription)

        const res = await api.post(`/huggingface/${action}`, formData, {
            headers: { "Content-Type": "multipart/form-data" },
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("[ProcessAudioWithAI] Failed")
        throw new Error(error);
    }
}

export const callAITextOnly = async (
    action: "generate" | "suggest" | "summary" | "clarification",
    payload: { prompt?: string; transcription?: string; userId: string }
) => {
    try {
        const res = await api.post(`/huggingface/${action}`, payload, {
            headers: { "Content-Type": "application/json" },
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("[ProcessAudioWithAI] Failed")
        throw new Error(error)
    }
}