<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useMangaLibraryStore, type JikanManga } from '@/stores/mangaLibraryStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { CirclePlus } from 'lucide-vue-next'

const searchType = ref('manga')
const searchQuery = ref('')
const mangaLibraryStore = useMangaLibraryStore()

// New refs for the drawer
const isDrawerOpen = ref(false)
const selectedManga = ref<JikanManga | null>(null)
const status = ref<'PLAN_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED'>('PLAN_TO_READ')
const userScore = ref<any>(null)
const volumesProgress = ref<any>(null)
const chaptersProgress = ref<any>(null)
const notes = ref<string>('')

const loading = ref(false)

const handleSearch = async () => {
  loading.value = true
  if (searchType.value === 'manga') {
    await mangaLibraryStore.searchManga(searchQuery.value)
  } else if (searchType.value === 'users') {
    // Implement user search logic here
    console.log(`Searching for users: ${searchQuery.value}`)
  }
  loading.value = false
}

// Debounce function to limit API calls
const debounce = (fn: Function, delay: number) => {
  let timeoutId: ReturnType<typeof setTimeout>
  return (...args: any[]) => {
    clearTimeout(timeoutId)
    timeoutId = setTimeout(() => fn(...args), delay)
  }
}

// Debounced search function
const debouncedSearch = debounce(handleSearch, 300)

// Watch for changes in searchQuery and trigger debounced search
watch(searchQuery, () => {
  if (searchQuery.value.length >= 3) {
    debouncedSearch()
  }
})

const openDrawer = (manga: JikanManga) => {
  selectedManga.value = manga
  isDrawerOpen.value = true
}

const handleAddToLibrary = () => {
  if (selectedManga.value) {
    mangaLibraryStore.addToLibrary({
      malId: selectedManga.value.mal_id,
      status: status.value,
      userScore: userScore.value,
      volumesProgress: volumesProgress.value,
      chaptersProgress: chaptersProgress.value,
      notes: notes.value,
    })
  }
  isDrawerOpen.value = false
  // Reset form values
  status.value = 'PLAN_TO_READ'
  userScore.value = null
  volumesProgress.value = null
  chaptersProgress.value = null
  notes.value = ''
}

const isLoading = computed(() => loading.value && mangaLibraryStore.searchResults.length === 0)
</script>

<template>
  <div class="flex flex-col space-y-4">
    <div class="flex space-x-2">
      <Select v-model="searchType" class="w-[180px]">
        <SelectTrigger class="bg-white">
          <SelectValue placeholder="Select a search type" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>Search In</SelectLabel>
            <SelectItem value="manga">Manga</SelectItem>
            <SelectItem value="users">Users</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Input v-model="searchQuery" placeholder="Search..." class="flex-grow bg-white" />
      <Button @click="handleSearch">Search</Button>
    </div>

    <div v-if="searchType === 'manga'">
      <h2 class="text-xl font-bold mb-2">Search Results</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <template v-if="isLoading">
          <Skeleton v-for="n in 10" :key="n" class="h-64 w-full" />
        </template>
        <template v-else>
          <Card v-for="manga in mangaLibraryStore.searchResults" :key="manga.mal_id" class="p-2 space-y-4">
            <CardHeader class="relative p-0">
              <img :src="manga.images.jpg.image_url" :alt="manga.title" class="w-full h-64 object-cover rounded-md" />
              <Button @click="openDrawer(manga)" size="icon" class="absolute bottom-2 right-2 space-x-2">
                <CirclePlus class="w-6 h-6" />
              </Button>
            </CardHeader>
            <CardContent class="p-0">
              <CardTitle>{{ manga.title }}</CardTitle>
            </CardContent>
          </Card>
        </template>
      </div>
    </div>

    <Drawer v-model:open="isDrawerOpen">
      <DrawerContent>
        <div class="mx-auto w-full max-w-lg">
          <DrawerHeader>
            <DrawerTitle>{{ selectedManga?.title }}</DrawerTitle>
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
            <DrawerClose class="w-full">
              <Button class="w-full" variant="outline">Cancel</Button>
            </DrawerClose>
            <Button class="w-full" @click="handleAddToLibrary">Add to Library</Button>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  </div>
</template>