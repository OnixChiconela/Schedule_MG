import api from "../../api"

export interface createTeamData {
    userId: string;
    encryptedName: string;
    encryptedDescription: string;
    encryptedKeys: Record<string, { encryptedKey: string; nonce: string }>;
    nameNonce: string;
    descriptionNonce: string; // Adicionar o descriptionNonce
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