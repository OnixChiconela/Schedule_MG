import toast from "react-hot-toast";
import api from "../../api";


export const updateUserProfile = async (userId: string, data: { visualType?: string; visualValue?: string }) => {
    try {
        const res = await api.patch(`/users/update-profile/${userId}`, data, {
            withCredentials: true
        })
        return res.data
    } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
    }
}