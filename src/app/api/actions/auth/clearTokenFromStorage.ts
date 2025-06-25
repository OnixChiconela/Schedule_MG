
export const clearTokenFromStorage = async () => {
    try {
        localStorage.removeItem('access_token')
        localStorage.removeItem('user_data')
    } catch (error) {
        console.log("Cannot remove user data and token: ", error)
    }
}