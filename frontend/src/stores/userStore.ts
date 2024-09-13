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

interface UserData {
    id: number
    email: string
    username: string
    avatarUrl?: string | null;
    backgroundImageUrl?: string | null;
    private: boolean
    libraryEntries?: any[]
}

export const useUserStore = defineStore('userData', {
    state: () => ({
        user: {} as UserData,
    }),
    actions: {
        async updateProfile(userData: Partial<UserData>) {
            const response = await api.put('/users/me', userData)
            this.user = { ...this.user, ...response.data }
            return response.data
        },
        async uploadFile(file: File, fieldName: 'avatarUrl' | 'backgroundImageUrl') {
            const formData = new FormData()
            formData.append('file', file)
            formData.append('fieldName', fieldName)

            const response = await api.post('/users/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            })

            if (response.data && response.data.url) {
                return response.data.url
            } else {
                throw new Error('File upload failed')
            }
        },
        async fetchUserData() {
            try {
                const response = await api.get('/users/me')
                this.user = response.data
                return this.user
            } catch (error) {
                console.error('Failed to fetch user data:', error)
                return null
            }
        },

        async fetchPublicProfile(username: string) {
            try {
                const response = await api.get(`/users/${username}`)
                return response.data
            } catch (error) {
                console.error('Failed to fetch public profile:', error)
                throw error
            }
        }
    },
})