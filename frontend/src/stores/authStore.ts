import { defineStore } from 'pinia'
import axios from 'axios'
import { useUserStore } from './userStore'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response.status === 401 && !originalRequest._retry) {
      // Check if this is a login request
      if (originalRequest.url.includes('/auth/login')) {
        // This is a login request, don't try to refresh token
        return Promise.reject(error);
      }

      originalRequest._retry = true;
      try {
        const authStore = useAuthStore();
        const newToken = await authStore.refreshToken();
        if (newToken) {
          originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        const authStore = useAuthStore();
        await authStore.logout();
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export const useAuthStore = defineStore('auth', {
  state: () => ({
    isAuthenticated: false,
    refreshInterval: null as any,
    isLoading: true,
  }),
  actions: {
    async refreshToken() {
      try {
        const response = await api.post('/auth/refresh-token')
        localStorage.setItem('accessToken', response.data.accessToken)
        this.isAuthenticated = true
        return response.data.accessToken
      } catch (error) {
        console.error('Error refreshing token:', error)
        this.isAuthenticated = false
      }
    },
    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/login', { email, password })
        localStorage.setItem('accessToken', response.data.accessToken)
        this.isAuthenticated = true
        const userStore = useUserStore()
        await userStore.fetchUserData()
        return response.data
      } catch (error) {
        console.error('Login failed', error)
        throw error
      }
    },
    async signup(email: string, username: string, password: string) {
      try {
        const response = await api.post('/auth/signup', {
          email,
          username,
          password
        })
        return response.data
      } catch (error) {
        console.error('Signup failed', error)
        throw error
      }
    },
    async logout() {
      try {
        await api.post('/auth/logout')
        localStorage.removeItem('accessToken')
        this.isAuthenticated = false
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },
    async checkAuthStatus() {
      this.isLoading = true;
      const token = localStorage.getItem('accessToken');
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          const expiresIn = payload.exp - Math.floor(Date.now() / 1000);
          if (expiresIn < 300) { // 5 minutes
            await this.refreshToken();
          }
          const userStore = useUserStore()
          await userStore.fetchUserData();
          this.isAuthenticated = true;
        } catch (error) {
          console.error('Error checking auth status:', error);
          this.isAuthenticated = false;
        }
      } else {
        this.isAuthenticated = false;
      }
      this.isLoading = false;
    },
  }
})
