import api from "../../api"

const getTeamDetails = async (teamId: string, userId: string) => {
    console.log(userId, "   get team details api")
    const url = `/teams/team-details/${teamId}?userId=${userId}`;
    console.log("Fetching URL:", url);
    try {
        const res = await api.get(`/teams/team-details/${teamId}?userId=${userId}`)
        return res.data
    } catch (error) {
        console.error("")
    }
}

export default getTeamDetails