import api from "../../api"

export const getCollabById = async (id: string) => {
    try {
        const res = await api.get(`/collaboration/partnership/${id}`, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error("Error fetching partnership:", error)
        throw error
    }
}