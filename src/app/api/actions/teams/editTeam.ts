import api from "../../api";

export const editTeam = async (teamId: string, encryptedName: string, description: string) => {
  try {
    const res = await api.put(`/teams/${teamId}`, { encryptedName, description }, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('Error editing team:', error);
    throw error;
  }
};