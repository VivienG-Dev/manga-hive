<script setup lang="ts">
import { ref, onMounted, watch, computed, TransitionGroup } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useMangaLibraryStore } from '@/stores/mangaLibraryStore'
import type { UserData } from '@/stores/userStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toast'
import { Ellipsis } from 'lucide-vue-next'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'

const authStore = useAuthStore()
const userStore = useUserStore()
const mangaLibraryStore = useMangaLibraryStore()
const { toast } = useToast()

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

    if (authStore.isAuthenticated && userStore.user) {
      userData.value = userStore.user
    } else {
      error.value = 'You must be logged in to view this page'
    }
  } catch (e: any) {
    error.value = 'Failed to load user profile'
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await loadUserData()
})

watch(
  () => userStore.user && authStore.isAuthenticated,
  async (newUser) => {
    if (newUser) {
      await loadUserData()
    }
  }
)

const formatStatus = (status: string) => {
  switch (status) {
    case 'READING':
      return 'Reading'
    case 'COMPLETED':
      return 'Completed'
    case 'ON_HOLD':
      return 'On Hold'
    case 'DROPPED':
      return 'Dropped'
    case 'PLAN_TO_READ':
      return 'Plan to Read'
    default:
      return 'Unknown'
  }
}

const removeFromLibrary = async (id: number) => {
  try {
    await mangaLibraryStore.removeItemFromLibrary(id)
    toast({
      title: 'Item removed from library',
      description: 'The item has been successfully removed from your library.',
    })
    if (userData.value && userData.value.libraryEntries) {
      userData.value.libraryEntries = userData.value.libraryEntries.filter(entry => entry.id !== id)
    }
  } catch (error) {
    toast({
      title: 'Failed to remove item from library',
      description: 'An error occurred while removing the item from your library.',
    })
  }
}
</script>

<template>
  <div v-if="loading" class="mt-8">Loading...</div>
  <div v-else-if="error" class="mt-8">{{ error }}</div>
  <div v-else-if="userData" class="mt-8">
    <Toaster />
    <Card class="h-96 overflow-hidden">
      <CardHeader class="flex flex-row justify-between items-start h-4/6 bg-cover bg-no-repeat"
        :style="{ backgroundImage: `url('${userData.backgroundImageUrl || '/default-background.jpg'}')` }">
        <div class="bg-white bg-opacity-60 p-2 rounded-md">
          <CardTitle class="text-foreground dark:text-background">My profile</CardTitle>
        </div>
        <div v-if="authStore.isAuthenticated && userStore.user?.id === userData.id">
          <RouterLink to="/settings">
            <Button variant="outline" class="bg-white bg-opacity-60 p-2 rounded-md">Settings</Button>
          </RouterLink>
        </div>
      </CardHeader>
      <CardContent class="relative -top-12 flex flex-col justify-center items-center h-2/6 gap-2">
        <img :src="userData.avatarUrl || '/default-avatar.jpg'" alt="Profile Picture"
          class="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white object-cover" />
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
            <Card class="relative flex items-center space-x-4 p-2">
              <img v-if="entry.imageUrl" :src="entry.imageUrl" :alt="entry.title"
                class="w-30 h-40 object-cover rounded-md" />
              <Skeleton v-else class="h-64 w-full" />
              <div class="space-y-4">
                <CardHeader class="p-0">
                  <CardTitle>{{ entry.title }}</CardTitle>
                </CardHeader>
                <CardContent class="p-0">
                  <p><strong>Status:</strong> {{ formatStatus(entry.status) }}</p>
                  <p><strong>Chapters:</strong> {{ entry.chapters || 'N/A' }}</p>
                  <p><strong>Volumes:</strong> {{ entry.volumes || 'N/A' }}</p>
                  <p><strong>Score:</strong> {{ entry.score || 'N/A' }}</p>
                </CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child>
                    <Button class="absolute bottom-2 right-2" variant="ghost">
                      <Ellipsis :size="20" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuGroup>
                      <DropdownMenuItem class="cursor-pointer"> Edit </DropdownMenuItem>
                      <DropdownMenuItem @click="removeFromLibrary(entry.id)" class="cursor-pointer"> Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
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
