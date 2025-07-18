import axios from "axios"
import { clearStorage, getTokenFromStorage, isTokenExpired } from "./actions/auth/isTokenExpired"
import { useRouter } from "next/navigation";

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_FIND_BACKEND || 'http://localhost:8050/api'
})
// const api = axios.create({
//     baseURL: 'http://localhost:8050/api'
// })

// Controle para evitar múltiplas renovações simultâneas
let isRefreshing = false;
let failedQueue: Array<{ resolve: (token: string) => void; reject: (error: any) => void }> = [];

// Função para processar a fila de requisições pendentes
const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token as string);
    }
  });
  failedQueue = [];
};

api.interceptors.request.use(
  async (config) => {
    // Ignorar endpoints de autenticação
    if (config.url?.includes('/auth/login') || config.url?.includes('/auth/refresh-token') || config.url?.includes('/auth/forgot-password')) {
      console.log(`Skipping interceptor for ${config.url}`);
      return config;
    }

    const token = getTokenFromStorage();

    // Se o token existe e não está expirado, usá-lo
    if (token && !isTokenExpired(token)) {
      config.headers['Authorization'] = `Bearer ${token}`;
      return config;
    }

    // Se o token está expirado ou não existe, tentar renovar
    if (isRefreshing) {
      // Aguardar a renovação em andamento
      return new Promise((resolve, reject) => {
        failedQueue.push({
          resolve: (token) => {
            config.headers['Authorization'] = `Bearer ${token}`;
            resolve(config);
          },
          reject,
        });
      });
    }

    isRefreshing = true;
    try {
      const refreshToken = localStorage.getItem('refresh_token');
      if (!refreshToken) {
        throw new Error('No refresh token available');
      }

      // console.log('Attempting to refresh token');
      const res = await api.post('/auth/refresh-token', { refreshToken });
      const { accessToken } = res.data;

      if (!accessToken) {
        throw new Error('Invalid response from refresh token endpoint');
      }

      localStorage.setItem('access_token', accessToken);
      // console.log('Token refreshed successfully:', accessToken);
      config.headers['Authorization'] = `Bearer ${accessToken}`;
      processQueue(null, accessToken);
      return config;
    } catch (err: any) {
      console.error('Error refreshing token:', err.message);
      processQueue(err);
      await clearStorage();

      // Usar o roteador do frontend para navegação
      if (typeof window !== 'undefined') {
        const router = useRouter();
        router.push('/my-space/auth/login');
      }
      return Promise.reject(err);
    } finally {
      isRefreshing = false;
    }
  },
  (error) => {
    console.error('Request interceptor error:', error);
    return Promise.reject(error);
  }
);

export default api