<script setup lang="ts">
import { ref, watch } from 'vue'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { useMangaLibraryStore } from '@/stores/mangaLibraryStore'
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

const searchType = ref('manga')
const searchQuery = ref('')
const mangaLibraryStore = useMangaLibraryStore()

const handleSearch = async () => {
  if (searchType.value === 'manga') {
    await mangaLibraryStore.searchManga(searchQuery.value)
  } else if (searchType.value === 'users') {
    // Implement user search logic here
    console.log(`Searching for users: ${searchQuery.value}`)
  }
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

    <div v-if="searchType === 'manga' && mangaLibraryStore.searchResults.length > 0">
      <h2 class="text-xl font-bold mb-2">Search Results</h2>
      <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        <Card v-for="manga in mangaLibraryStore.searchResults" :key="manga.mal_id" class="bg-white">
          <CardHeader>
            <CardTitle>{{ manga.title }}</CardTitle>
          </CardHeader>
          <CardContent>
            <img :src="manga.images.jpg.image_url" :alt="manga.title" class="w-full h-48 object-cover mb-2" />
            <p class="text-sm text-gray-600 mb-2">{{ manga.synopsis?.substring(0, 100) }}...</p>
            <Button @click="mangaLibraryStore.addToLibrary(manga.mal_id)">Add to Library</Button>
          </CardContent>
        </Card>
      </div>
    </div>
  </div>
</template>