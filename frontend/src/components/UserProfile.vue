<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'

const route = useRoute()
const authStore = useAuthStore()

interface UserData {
  id: number
  username: string
  email?: string
  imageUrl?: string
  libraryEntries?: any[]
}

const userData = ref<UserData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

async function loadUserData() {
  const username = route.params.username as string
  loading.value = true
  error.value = null

  try {
    // First, ensure authentication state is up-to-date
    if (!authStore.isAuthenticated) {
      await authStore.checkAuthStatus()
    }

    if (authStore.isAuthenticated && authStore.user?.username === username) {
      console.log('User is viewing their own profile')
      // If the logged-in user is viewing their own profile, fetch fresh data
      userData.value = await authStore.fetchUserData()
    } else {
      console.log("User is viewing another user's profile")
      // Otherwise, fetch the user data using the username
      userData.value = await authStore.fetchUserProfile(username)
    }
  } catch (e: any) {
    console.error('Error fetching user profile:', e)
    error.value = e.response?.data?.message || 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

onMounted(loadUserData)
</script>

<template>
  <div v-if="loading">Loading...</div>
  <div v-else-if="error">{{ error }}</div>
  <div v-else-if="userData">
    <h1>User Profile</h1>
    <p>Username: {{ userData.username }}</p>
    <p v-if="userData.email">Email: {{ userData.email }}</p>
    <img v-if="userData.imageUrl" :src="userData.imageUrl" alt="Profile Picture" />
    <div v-if="authStore.isAuthenticated && authStore.user?.id === userData.id">
      <button>Edit Profile</button>
    </div>
    <div v-if="userData.libraryEntries && userData.libraryEntries.length > 0">
      <h2>Library Entries</h2>
      <ul>
        <li v-for="entry in userData.libraryEntries" :key="entry.id">
          {{ entry.itemType }}: {{ entry.itemId }} - Status: {{ entry.status }}
        </li>
      </ul>
    </div>
  </div>
  <div v-else>User not found</div>
</template>
