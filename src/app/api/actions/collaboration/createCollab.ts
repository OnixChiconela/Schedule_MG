import api from "../../api"

export interface CreatePartnershipData {
    // userId: string
    name: string
    description?: string
    // invitedUserIds?: string[]
}

export const createCollab = async (userId: string, data: CreatePartnershipData) => {
    try {
        const res = await api.post(`/collaboration/create-partnership?userId=${userId}`, data, {
            withCredentials: true
        }) 
        return res.data
    } catch (error: any) {
        console.error("Error fetching:", error)
        throw new Error(error)
    }
}