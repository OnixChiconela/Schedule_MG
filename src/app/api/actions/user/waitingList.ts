import api from "../../api"

export const waitingList = async (email: string) => {
    try {
        const res = await api.post("/users/waiting-user/create-new", {email})
        return res.data
    } catch (error) {
        console.log(error)
    }
}