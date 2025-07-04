import api from "../api"


export const awakeSv = async() => {
    try {
        const wake = api.get("/")
        return (await wake).data
    } catch (error) {

    }
}