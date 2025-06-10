import axios from "axios"

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_FIND_BACKEND || 'http://localhost:8050/api'
})
// const api = axios.create({
//     baseURL: 'http://localhost:8050/api'
// })

export default api