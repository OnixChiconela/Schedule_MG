import api from "@/app/api/api"

export const generateText = async (prompt: string) => {
  console.log("generateText chamado com prompt:", prompt);
    try {
        const res = await api.post("/huggingface/generate", {prompt} )
        return res.data
    } catch(error) {
        console.error("Faild to generate AI response: ", error)
    }
}

export const simulateStreaming = async (
  text: string,
  callback: (chunk: string) => void,
  chunkSize: number = 5,
  delay: number = 200
) => {
  const words = text.split(' ');
  for (let i = 0; i < words.length; i += chunkSize) {
    const chunk = words.slice(i, i + chunkSize).join(' ');
    callback(chunk + (i + chunkSize < words.length ? ' ' : ''));
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
};

export const simulateStreamingBChunk = async (
  text: string,
  callback: (chunk: string) => void,
  chunkSize: number = 5,
  delay: number = 5,
  signal?: AbortSignal
): Promise<void> => {
  if (!text || typeof text !== "string") {
    console.error("[Streaming] Invalid input: text must be a non-empty string")
    return
  }
  if (chunkSize <= 0) {
    console.error("[Streaming] Invalid chunkSize: must be positive")
    return
  }

  const words = text.split(" ")
  if (words.length === 0) {
    console.error("[Straming] No words to stream")
    return
  }

  try {
    for (let i = 0; i < words.length; i += chunkSize) {
      if (signal?.aborted) {
        console.log("[Streaming] Streaming aborted")
        throw new Error("streaming aborted")
      }
      const chunk = words.slice(i,i + chunkSize).join(" ")
      callback(chunk + (i + chunkSize < words.length ? " " : " "))
      await new Promise((resolve) => setTimeout(resolve, delay))
    }
    console.log("[Streaming] Streaming completed")
  } catch (error: any) {
    if (error.message === "Streaming Abordet") {
      throw new error
    }
    console.error("[Streaming] Streaming error: ", error)
    throw new Error(`Streaming failed: ${error.message}`)
  }
}