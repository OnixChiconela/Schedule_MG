import api from "../../api"

export const getTeamKey= async (teamId: string, userId: string) => {
    try {
        const res = await api.get(`/teams/${teamId}/key?userId=${userId}`)
        return res.data
    } catch (error) {
        console.error('Error fetching team space: ', error)
        throw error
    }
}