import api from "../../api"

export interface CreatePartnershipData {
    userId: string
    name: string
    description?: string
    invitedUserIds?: string[]
}

export const createCollab = async (data: CreatePartnershipData) => {
    try {
        const res = await api.post(`collaboration/create-partnership?userId=${data.userId}`, data, {
            withCredentials: true
        }) 
        return res.data
    } catch (error) {
        console.error("Error creating partnership:", error)
        throw error
    }
}