import api from "../../api"

export const getPlans = async () => {
    try {
        const res = await api.get(`paypal/plans`)
        return res.data
    } catch (error) {
        console.error("Failed to get plans:", error )
    }
}