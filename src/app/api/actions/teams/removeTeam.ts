import api from "../../api";

export const removeTeam = async (teamId: string) => {
  try {
    const res = await api.delete(`/teams/${teamId}`, {
      withCredentials: true,
    });
    return res.data;
  } catch (error) {
    console.error('Error removing team:', error);
    throw error;
  }
};