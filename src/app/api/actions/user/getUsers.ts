import api from "../../api"

 export const getUsers = async() => {
    try {
        const res = await api.get("/users/all-users")
        console.log(res.data)
        return res.data
    } catch (error) {
        console.log(error)
        
    }
}