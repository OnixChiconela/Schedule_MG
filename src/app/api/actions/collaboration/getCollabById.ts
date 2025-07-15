import api from "../../api"

export const getCollabById = async (id: string) => {
    try {
        const res = await api.get(`/collaboration/partnership/${id}`, {
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership members:", error)
        throw new Error(error)
    }
}