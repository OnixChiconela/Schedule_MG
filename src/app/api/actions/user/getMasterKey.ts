import * as sodium from "libsodium-wrappers"
import api from "../../api"

export const getMasterKey = async (userId: string, password: string) => {
    await sodium.ready
    try {
        const res = await api.get(`/users/${userId}/master-key`, {
            params: { password }
        })
        return res.data
    } catch (error) {
        console.error('Error fetching master key:', error);
        throw new Error('Failed to fetch master key');
    }
}