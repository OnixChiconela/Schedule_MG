import api from "../../api"


export const completeInvite = async (inviteToken: string, userId: string) => {
    try {
        const res = await api.post('/collaboration/partnerships/compete-invite', {inviteToken, userId}, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error('Error completing invite:', error)
        throw new Error("Failed to complete invite")
    }
}