<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaLibraryStore, type JikanManga, type JikanCharacter } from '@/stores/mangaLibraryStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

const route = useRoute()
const mangaLibraryStore = useMangaLibraryStore()
const manga = ref<JikanManga | null>(null)
const characters = ref<JikanCharacter[]>([])
const loading = ref(true)

onMounted(async () => {
    const mangaId = route.params.mangaid as string
    try {
        manga.value = await mangaLibraryStore.fetchMangaDetails(mangaId)
        characters.value = await mangaLibraryStore.fetchMangaCharacters(mangaId)
    } catch (error) {
        console.error('Error fetching manga details:', error)
    } finally {
        loading.value = false
    }
})

const formatAuthorName = (authorName: string): string => {
    const nameParts = authorName.split(', ');
    return nameParts.length > 1 ? `${nameParts[1]} ${nameParts[0]}` : authorName;
};

// Cannot change the word wrap my IDE so let's just use a function to check if the date is the default date (that's a fucking bad way to do it ahahah)
const isDefaultDate = (date: string): boolean => {
    return new Date(date).getTime() === 0;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}
</script>

<template>
    <main class="container mx-auto px-4 py-8">
        <div v-if="loading">Loading...</div>
        <div v-else-if="manga" class="flex flex-col md:flex-row gap-8 card-transition-large">
            <div class="md:w-1/3">
                <img :src="manga.images.jpg.large_image_url" :alt="manga.title" class="w-full rounded-lg shadow-lg"
                    :style="`view-transition-name: card-${manga.mal_id};`" />
                <Button>Add to list</Button>
            </div>
            <div class="md:w-2/3">
                <h1 class="text-3xl font-bold mb-4">{{ manga.title_english }}</h1>
                <div class="mb-4">
                    <span class="font-semibold">Janapese title:</span> {{ manga.title_japanese }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Romaji title:</span> {{ manga.title }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Status:</span> {{ manga.status }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Start date:</span> {{ formatDate(manga.published.from) ?? 'N/A' }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">End date:</span> {{ isDefaultDate(manga.published.to)
                        ? 'N/A' : formatDate(manga.published.to) }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Genres:</span>
                    {{ manga.genres.map(genre => genre.name).join(', ') }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Score:</span> {{ manga.score }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Chapters:</span> {{ manga.chapters }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Volumes:</span> {{ manga.volumes }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold">Type:</span> {{ manga.type }}
                </div>
                <div class="mb-4">
                    <span class="font-semibold" v-if="manga.authors.length > 1">Authors:</span>
                    <span class="font-semibold" v-else>Author:</span>
                    {{ manga.authors.map(author => formatAuthorName(author.name)).join(', ') }}
                </div>
                <p class="text-gray-700">{{ manga.synopsis }}</p>
            </div>
        </div>
        <div v-else>
            <p>Manga not found</p>
        </div>
        <div v-if="characters.length > 0">
            <h2 class="text-2xl font-bold mb-4">Characters</h2>
            <div class="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-7 gap-4">
                <div v-for="character in characters" :key="character.character.mal_id"
                    class="flex flex-col items-center">
                    <img :src="character.character.images.webp.image_url" :alt="character.character.name"
                        class="w-32 h-auto object-cover rounded-lg shadow-lg mb-2" />
                    <span class="text-center font-semibold">{{ character.character.name }}</span>
                    <span class="text-center text-sm text-gray-600">{{ character.role }}</span>
                </div>
            </div>
        </div>
    </main>
</template>
