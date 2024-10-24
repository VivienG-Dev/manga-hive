<script setup lang="ts">
import { ref, onMounted, watch, computed, TransitionGroup } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import { useMangaLibraryStore, type JikanManga, type LibraryEntry } from '@/stores/mangaLibraryStore'
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
const router = useRouter()

const userData = ref<UserData | null>(null)
const loading = ref(true)
const error = ref<string | null>(null)

const selectedManga = ref<JikanManga | null>(null)
const selectedLibraryEntry = ref<LibraryEntry | null>(null)
const isDrawerOpen = ref(false)
const selectedEntry = ref<any>(null)
const status = ref<'PLAN_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED'>('PLAN_TO_READ')
const userScore = ref<number>(0)
const volumesProgress = ref<number>(0)
const chaptersProgress = ref<number>(0)
const notes = ref<string>('')

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

const refreshUserData = async () => {
  try {
    await userStore.fetchUserData()
    userData.value = userStore.user
  } catch (error) {
    console.error('Failed to refresh user data', error)
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

const openDrawer = (entry: any) => {
  selectedEntry.value = entry
  status.value = entry.status
  userScore.value = entry.userScore
  volumesProgress.value = entry.volumesProgress
  chaptersProgress.value = entry.chaptersProgress
  notes.value = entry.notes || ''
  isDrawerOpen.value = true
}

const updateLibraryEntry = async () => {
  isDrawerOpen.value = false
  try {
    await mangaLibraryStore.updateLibraryEntry({
      id: selectedEntry.value.id,
      status: status.value,
      userScore: userScore.value,
      volumesProgress: volumesProgress.value,
      chaptersProgress: chaptersProgress.value,
      notes: notes.value,
    })
    await refreshUserData()
    toast({
      title: 'Library entry updated',
      description: 'The library entry has been successfully updated.',
    })
  } catch (error) {
    console.error('Failed to update library entry', error)
    toast({
      title: 'Failed to update library entry',
      description: 'An error occurred while updating the library entry.',
    })
  }
}

const goToMangaPage = (manga: LibraryEntry) => {
  const mangaId = manga.malId.toString()
  router.push({
    path: `/mangas/${mangaId}/${manga.title.replace(/ /g, '-')}`,
  })
}
</script>

<template>
  <div v-if="loading" class="mt-8">Loading...</div>
  <div v-else-if="error" class="mt-8">{{ error }}</div>
  <div v-else-if="userData" class="mt-8">
    <Toaster />
    <Card class="h-96 overflow-hidden border border-black dark:border-slate-500">
      <CardHeader class="flex flex-row justify-between items-start h-4/6 bg-cover bg-no-repeat"
        :style="{ backgroundColor: userData.backgroundImageUrl ? 'transparent' : '#e5e5e5', backgroundImage: userData.backgroundImageUrl ? `url('${userData.backgroundImageUrl}')` : 'none' }">
        <div class="bg-white p-2 rounded-md border border-black dark:border-slate-500 transition-all duration-200">
          <CardTitle class="text-foreground dark:text-background">My profile</CardTitle>
        </div>
        <div v-if="authStore.isAuthenticated && userStore.user?.id === userData.id">
          <RouterLink to="/settings">
            <Button variant="outline"
              class="bg-white bg-opacity-90 p-2 rounded-md hover:shadow-neo border border-black dark:border-slate-500 transition-all duration-200">Settings</Button>
          </RouterLink>
        </div>
      </CardHeader>
      <CardContent class="relative -top-12 flex flex-col justify-center items-center h-2/6 gap-2">
        <img :src="userData.avatarUrl || '/default-avatar.webp'" alt="Profile Picture"
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
            <SelectTrigger
              class="bg-white hover:shadow-neo border border-black dark:border-slate-500 transition-all duration-200">
              <SelectValue placeholder="Sort By" />
            </SelectTrigger>
            <SelectContent class="shadow-neo border border-black dark:border-slate-500">
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
            <SelectTrigger
              class="bg-white hover:shadow-neo border border-black dark:border-slate-500 transition-all duration-200">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent class="shadow-neo border border-black dark:border-slate-500">
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
            <Card
              class="relative flex items-center space-x-4 p-2 hover:shadow-neo border border-black dark:border-slate-500 transition-all duration-200 cursor-pointer"
              @click="goToMangaPage(entry)">
              <img v-if="entry.imageUrl" :src="entry.imageUrl" :alt="entry.title"
                class="w-30 h-40 object-cover rounded-md" />
              <Skeleton v-else class="h-64 w-full" />
              <div class="space-y-4">
                <CardHeader class="p-0">
                  <CardTitle>{{ entry.title }}</CardTitle>
                </CardHeader>
                <CardContent class="p-0">
                  <p><strong>Status:</strong> {{ formatStatus(entry.status) }}</p>
                  <p><strong>Volumes:</strong> {{ entry.volumesProgress || 'N/A' }}</p>
                  <p><strong>Score:</strong> {{ entry.userScore || 'N/A' }}</p>
                  <p><strong>Note:</strong> {{ entry.notes || 'N/A' }}</p>
                </CardContent>
                <DropdownMenu>
                  <DropdownMenuTrigger as-child @click.stop>
                    <Button class="absolute bottom-2 right-2" variant="ghost">
                      <Ellipsis :size="20" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" class="shadow-neo border border-black dark:border-slate-500">
                    <DropdownMenuGroup>
                      <DropdownMenuItem @click.stop="openDrawer(entry)" class="cursor-pointer"> Edit </DropdownMenuItem>
                      <DropdownMenuItem @click.stop="removeFromLibrary(entry.id)" class="cursor-pointer"> Delete
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
          </Transition>
        </TransitionGroup>
      </div>

      <Drawer v-model:open="isDrawerOpen">
        <DrawerContent>
          <div class="mx-auto w-full max-w-lg">
            <DrawerHeader>
              <DrawerTitle>{{ selectedEntry?.title }}</DrawerTitle>
              <DrawerDescription>Fill in the details to add this manga to your library.</DrawerDescription>
            </DrawerHeader>
            <div class="p-4">
              <div class="space-y-4">
                <div class="flex items-center space-x-8">
                  <div class="w-full">
                    <Label for="status">Status</Label>
                    <Select v-model="status">
                      <SelectTrigger>
                        <SelectValue placeholder="Select a status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="PLAN_TO_READ">Plan to Read</SelectItem>
                        <SelectItem value="READING">Reading</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        <SelectItem value="DROPPED">Dropped</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div class="w-full">
                    <Label for="userScore">Your Score (0-10)</Label>
                    <Input id="userScore" v-model="userScore" type="number" min="0" max="10" />
                  </div>
                </div>

                <div class="flex items-center space-x-8">
                  <div class="w-full">
                    <Label for="volumesProgress">Volumes Progress</Label>
                    <Input id="volumesProgress" v-model="volumesProgress" type="number" min="0" />
                  </div>

                  <div class="w-full">
                    <Label for="chaptersProgress">Chapters Progress</Label>
                    <Input id="chaptersProgress" v-model="chaptersProgress" type="number" min="0" />
                  </div>
                </div>

                <div>
                  <Label for="notes">Notes</Label>
                  <Textarea id="notes" v-model="notes" />
                </div>
              </div>
            </div>
            <DrawerFooter class="flex flex-row justify-between">
              <DrawerClose class="w-full" as-child>
                <Button class="w-full" variant="outline">Cancel</Button>
              </DrawerClose>
              <Button class="w-full" @click="updateLibraryEntry">Update</Button>
            </DrawerFooter>
          </div>
        </DrawerContent>
      </Drawer>
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
