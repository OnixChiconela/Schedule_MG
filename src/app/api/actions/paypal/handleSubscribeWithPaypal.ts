import api from "../../api"


export const handleSubscribeWithPaypal = async(userId: string, planId: string) => {
    try {
        const res = await api.post(`paypal/create-subscription`, {userId, planId})
        return res.data as {approvalUrl?: string; subscriptionId: string}
    } catch (error) {
        console.error("Failed to subscribe:", error)
        throw new Error('Subscription failed. Please try again.')
    }
}