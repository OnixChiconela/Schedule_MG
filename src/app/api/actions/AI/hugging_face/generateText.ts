import api from "@/app/api/api"

export const generateText = async (prompt: string) => {
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