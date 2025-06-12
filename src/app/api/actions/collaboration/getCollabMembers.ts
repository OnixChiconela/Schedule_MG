import api from "../../api"


export const getCollabMembers = async (id: string) => {
    try {
        const res = await api.get(`/collaboration/${id}/members`, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error("Error fetching partnership members:", error)
        throw error
    }
}