import axios from "axios"
import { clearStorage } from "./actions/auth/isTokenExpired"

// const api = axios.create({
//     baseURL: process.env.NEXT_PUBLIC_FIND_BACKEND || 'http://localhost:8050/api'
// })
const api = axios.create({
    baseURL: 'http://localhost:8050/api'
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('access_token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => Promise.reject(error)
)

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearStorage();
      window.location.href = '/my-space/auth/login'; // Redireciona para a página de login
    }
    return Promise.reject(error);
  }
);

export default api