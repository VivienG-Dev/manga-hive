import { defineStore } from 'pinia'
import axios from 'axios'

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

interface User {
  id: number
  email: string
  username: string
  imageUrl?: string
  libraryEntries?: any[]
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: null as User | null,
    isAuthenticated: false,
    refreshInterval: null as number | null
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
        this.user = null
        // Handle error (e.g., redirect to login page)
      }
    },
    startRefreshInterval() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
      }
      // Check auth status every 14 minutes (assuming 15-minute token lifespan)
      this.refreshInterval = setInterval(
        async () => {
          await this.refreshToken()
        },
        13 * 60 * 1000
      )
    },
    stopRefreshInterval() {
      if (this.refreshInterval) {
        clearInterval(this.refreshInterval)
        this.refreshInterval = null
      }
    },
    async fetchUserData() {
      try {
        const response = await api.get('/users/me')
        this.user = response.data
        this.isAuthenticated = true
        return this.user
      } catch (error) {
        console.error('Failed to fetch user data:', error)
        this.user = null
        this.isAuthenticated = false
        return null
      }
    },
    async login(email: string, password: string) {
      try {
        const response = await api.post('/auth/login', { email, password })
        localStorage.setItem('accessToken', response.data.accessToken)
        this.isAuthenticated = true
        await this.fetchUserData()
        this.startRefreshInterval()
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
        this.user = null
        this.isAuthenticated = false
        this.stopRefreshInterval()
      } catch (error) {
        console.error('Logout failed:', error)
      }
    },
    async checkAuthStatus() {
      const token = localStorage.getItem('accessToken')
      if (token) {
        try {
          await this.fetchUserData()
          this.startRefreshInterval()
        } catch (error) {
          await this.refreshToken()
        }
      } else {
        this.isAuthenticated = false
        this.user = null
      }
    },
    async fetchUserProfile(username: string) {
      try {
        const response = await api.get(`/users/${username}`)
        return response.data
      } catch (error) {
        console.error('Failed to fetch user profile:', error)
        throw error
      }
    }
  }
})
