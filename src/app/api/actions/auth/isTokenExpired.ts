import { jwtDecode } from 'jwt-decode'

interface JwtPayload {
    exp: number
}

export const isTokenExpired = (token: string | null): boolean => {
    if (!token) return true
    try {
        const decoded = jwtDecode<JwtPayload>(token)
        const currentTime = Math.floor(Date.now() / 1000)
        return decoded.exp < currentTime
    } catch (error) {
        console.error("Error while decoding token: ", error)
        return true
    }
}

export const getTokenFromStorage = (): string | null => {
    return localStorage.getItem('access_token');
};

export const getUserFromStorage = (): any | null => {
    const userData = localStorage.getItem('user_data');
    return userData ? JSON.parse(userData) : null;
};

export const clearStorage = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_data');
};