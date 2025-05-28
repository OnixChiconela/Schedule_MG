import api from "../../api"

export const getTeamSpace = async (userId: string) => {
    try {
        const res = await api.get(`/teams/space?userId=${userId}`)
        return res.data
    } catch (error) {
        console.error('Error fetching team space: ', error)
        throw error
    }
}