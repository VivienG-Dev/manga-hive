<script setup lang="ts">
import { ref, onMounted, watch, computed, TransitionGroup } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

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

const sortOrder = ref('asc')
const statusFilter = ref('all')

const filteredAndSortedEntries = computed(() => {
  if (!userData.value?.libraryEntries) return []

  let filtered = userData.value.libraryEntries

  if (statusFilter.value !== 'all') {
    filtered = filtered.filter(entry => entry.status.toLowerCase().replace(' ', '_') === statusFilter.value)
  }

  return filtered.sort((a, b) => {
    const comparison = a.title.localeCompare(b.title)
    return sortOrder.value === 'asc' ? comparison : -comparison
  })
})

async function loadUserData() {
  loading.value = true
  error.value = null

  try {
    if (authStore.isLoading) {
      await new Promise(resolve => {
        const checkInterval = setInterval(() => {
          if (!authStore.isLoading) {
            clearInterval(checkInterval)
            resolve(true)
          }
        }, 100)
      })
    }

    if (authStore.isAuthenticated && authStore.user) {
      console.log('User is viewing their own profile')
      userData.value = authStore.user
    } else {
      error.value = 'You must be logged in to view this page'
    }
  } catch (e: any) {
    console.error('Error loading user profile:', e)
    error.value = 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUserData()
})

watch(
  () => authStore.user,
  async (newUser) => {
    if (newUser) {
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
          <RouterLink to="/settings">
            <Button variant="outline" class="bg-white bg-opacity-60 p-2 rounded-md">Settings</Button>
          </RouterLink>
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
      <h2 class="text-2xl font-bold mb-4">My Library Entries</h2>
      <div class="flex items-center space-x-4 mb-4">
        <div>
          <Select v-model="sortOrder" id="sort-order" class="p-2 border rounded">
            <SelectTrigger class="bg-white">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Sort By</SelectLabel>
                <SelectItem value="asc">A-Z</SelectItem>
                <SelectItem value="desc">Z-A</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Select v-model="statusFilter" id="status-filter" class="p-2 border rounded">
            <SelectTrigger class="bg-white">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectLabel>Status</SelectLabel>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="reading">Reading</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on_hold">On Hold</SelectItem>
                <SelectItem value="dropped">Dropped</SelectItem>
                <SelectItem value="plan_to_read">Plan to Read</SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <TransitionGroup name="fade" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Transition v-for="entry in filteredAndSortedEntries" :key="entry.id" name="fade">
            <Card class="flex items-center space-x-4 p-2">
              <img v-if="entry.imageUrl" :src="entry.imageUrl" :alt="entry.title"
                class="w-30 h-40 object-cover rounded-md" />
              <Skeleton v-else class="h-64 w-full" />
              <div class="space-y-4">
                <CardHeader class="p-0">
                  <CardTitle>{{ entry.title }}</CardTitle>
                </CardHeader>
                <CardContent class="p-0">
                  <p><strong>Status:</strong> {{ entry.status }}</p>
                  <p><strong>Chapters:</strong> {{ entry.chapters || 'N/A' }}</p>
                  <p><strong>Volumes:</strong> {{ entry.volumes || 'N/A' }}</p>
                  <p><strong>Score:</strong> {{ entry.score || 'N/A' }}</p>
                </CardContent>
              </div>
            </Card>
          </Transition>
        </TransitionGroup>
      </div>
    </div>
    <div v-else-if="userData.libraryEntries && userData.libraryEntries.length === 0" class="mt-8">
      <p>You haven't added any entries to your library yet.</p>
    </div>
  </div>
  <div v-else>User not found</div>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease-in-out;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
