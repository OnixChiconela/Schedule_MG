import { User } from "@/app/types/back-front";
import toast from "react-hot-toast";

export const getUserWithToken = async (): Promise<{ token: string | null; user: User | null }> => {
    try {
        const token = localStorage.getItem('access_token');
        const userData = localStorage.getItem('user_data')

        if (!token || !userData) {
            toast.error("You're not logged in")
            return { token: null, user: null }
        }
        let user
        try {
            user = JSON.parse(userData)
        } catch (parseError) {
            console.error("Failde to parse user data;", parseError)
            return { token: null, user: null }
        }
        return { token, user }
    } catch (error: any) {
        return {token: null, user: null}
    }
}