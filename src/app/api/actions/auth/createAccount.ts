import api from "../../api"

interface User {
    email: string
    hashedPassword: string
    firstName: string
    lastName: string
}
const createAccount = async(data: User) => {
    try {
        const res = await api.post("/users/create-user", data, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error(error)
    }

    
}

export default createAccount