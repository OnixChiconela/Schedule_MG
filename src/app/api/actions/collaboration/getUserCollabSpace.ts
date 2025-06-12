import api from "../../api"

export const getUserCollabSpace = async(userId: string) => {
    try {
        const response = await api(`/collaboration/${userId}/space`, {
            withCredentials: true
        }) 
        return response.data
    } catch (error) {

    }
}