import api from "../../api"

interface createTeamData {
    userId: string
    encryptedName: string
    description: string
    encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>
}
export const createTeam = async (data: createTeamData) => {
    try {
        const res = await api.post(`/teams/new-team?userId=${data.userId}`, data, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error('Error creating team:', error);
        throw error;
    }
}