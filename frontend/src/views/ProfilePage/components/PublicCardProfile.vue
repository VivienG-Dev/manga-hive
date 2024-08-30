<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

const route = useRoute()
const router = useRouter()
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
    userData.value = await authStore.fetchPublicProfile(username)
  } catch (e: any) {
    console.error('Error fetching user profile:', e)
    error.value = e.response?.data?.message || 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUserData()
})

watch(
  () => route.params.username,
  async (newUsername, oldUsername) => {
    if (newUsername !== oldUsername) {
      await loadUserData()
    }
  }
)
</script>

<template>
  <div v-if="loading" class="mt-8">Loading...</div>
  <div v-else-if="error" class="mt-8">{{ error }}</div>
  <div v-else-if="userData" class="mt-8">
    <Card class="h-96 overflow-hidden">
      <CardHeader class="flex flex-row justify-between items-start h-4/6 bg-cover bg-no-repeat bg-bottom bg-sign-in">
        <div class="bg-white bg-opacity-60 p-2 rounded-md">
          <CardTitle class="text-foreground dark:text-background">My profile</CardTitle>
        </div>
        <div v-if="authStore.isAuthenticated && authStore.user?.id === userData.id">
          <button>Edit Profile</button>
        </div>
      </CardHeader>
      <CardContent class="relative -top-12 flex flex-col justify-center items-center h-2/6 gap-2">
        <img :src="userData.imageUrl || 'https://i.pravatar.cc/300'" alt="Profile Picture"
          class="w-32 h-auto md:w-40 md:h-auto rounded-full border-4 border-white" />
        <div class="text-center">
          <h3>{{ userData.username }}</h3>
          <p>{{ userData.libraryEntries?.length }} Library Entries</p>
        </div>
      </CardContent>
    </Card>

    <div v-if="userData.libraryEntries && userData.libraryEntries.length > 0" class="mt-8">
      <h2 class="text-2xl font-bold mb-4">Library Entries</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card v-for="entry in userData.libraryEntries" :key="entry.id" class="bg-white">
          <CardHeader>
            <CardTitle>{{ entry.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <img v-if="entry.imageUrl" :src="entry.imageUrl" :alt="entry.title" class="w-full h-48 object-cover mb-2" />
            <p><strong>Type:</strong> {{ entry.itemType }}</p>
            <p><strong>Status:</strong> {{ entry.status }}</p>
            <p v-if="entry.authors"><strong>Authors:</strong> {{ entry.authors }}</p>
            <p v-if="entry.genres"><strong>Genres:</strong> {{ entry.genres }}</p>
            <p v-if="entry.chapters"><strong>Chapters:</strong> {{ entry.chapters }}</p>
            <p v-if="entry.volumes"><strong>Volumes:</strong> {{ entry.volumes }}</p>
            <p v-if="entry.score"><strong>Score:</strong> {{ entry.score }}</p>
          </CardContent>
        </Card>
      </div>
    </div>
    <div v-else-if="userData.libraryEntries && userData.libraryEntries.length === 0" class="mt-8">
      <p>This user hasn't added any entries to their library yet.</p>
    </div>
  </div>
  <div v-else>User not found</div>
</template>
