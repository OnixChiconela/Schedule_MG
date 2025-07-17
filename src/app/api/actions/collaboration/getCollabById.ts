import toast from "react-hot-toast"
import api from "../../api"

export const getCollabById = async (id: string) => {
    try {
        const res = await api.get(`/collaboration/partnership/${id}`, {
            withCredentials: true
        })
        return res.data
    } catch (error: any) {
        console.error("Error fetching partnership:", error)
        toast.error(`oops shdgashdjgasjhdgja ${error}`)
        throw new Error(error)
    }
}