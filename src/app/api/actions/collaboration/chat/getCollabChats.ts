import toast from "react-hot-toast"
import api from "../../../api"

export const getCollabChats = async(id: string) => {
    try {
        const res = await api(`/collab-chat/partnership-chat/${id}`, {
            withCredentials: true
        })
        toast.success("In the APi")
        return res.data
    } catch (error) {
        console.error("error: ", error)
        throw new Error
    }
}