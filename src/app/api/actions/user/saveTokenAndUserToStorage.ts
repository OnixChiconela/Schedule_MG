import { User } from "@/app/types/back-front";


export const saveTokenAndUserToStorage = async (token: string, user: User, refreshToken: string) => {
    try {
        localStorage.setItem('access_token', token)
        localStorage.setItem('refresh_token', refreshToken)
        localStorage.setItem('user_data', JSON.stringify(user))
    } catch (error: any) {
        // console.log(error)
        throw new Error(error)
    }
}