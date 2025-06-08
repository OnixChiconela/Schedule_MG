import api from "../../api";

export const getUserMasterKey = async (userId: string) => {
  try {
    const res = await api.get(`/users/master-key?userId=${userId}`, { withCredentials: true });
    console.log("user master key from api: ", res.data.masterKey)
    return res.data.masterKey; // Retorna a masterKey em base64
  } catch (error) {
    console.error('Error fetching user master key:', error);
    throw new Error('Failed to retrieve master key');
  }
};

const reauthenticateUserMasterKey = async (userId: string, password: string): Promise<string> => {
  try {
    const res = await api.post(`/user/reauth`, { userId, password }, { withCredentials: true });
    return res.data.masterKey;
  } catch (error) {
    console.error('Error re-authenticating user master key:', error);
    throw new Error('Failed to re-authenticate and retrieve master key');
  }
};