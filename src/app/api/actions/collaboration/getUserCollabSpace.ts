import api from "../../api"

export const getUserCollabSpace = async(userId: string) => {
    try {
        const response = await api(`/collaboration/${userId}/space`, {
            withCredentials: true
        }) 
        return response.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}