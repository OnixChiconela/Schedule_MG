import api from "../../api"

 export const getUsers = async() => {
    try {
        const res = await api.get("/users/all-users")
        return res.data
    } catch (error) {
        console.log(error)
        
    }
}