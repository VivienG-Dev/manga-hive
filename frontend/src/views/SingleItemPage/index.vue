<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaLibraryStore, type JikanManga, type JikanCharacter, type JikanImage } from '@/stores/mangaLibraryStore'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

const route = useRoute()
const mangaLibraryStore = useMangaLibraryStore()
const manga = ref<JikanManga | null>(null)
const characters = ref<JikanCharacter[]>([])
const images = ref<JikanImage[]>([])
const loading = ref(true)

const showAllCharacters = ref(false)
const mainCharacters = computed(() => characters.value.filter(char => char.role === 'Main'))
const otherCharacters = computed(() => characters.value.filter(char => char.role !== 'Main'))

const toggleCharacters = () => {
    showAllCharacters.value = !showAllCharacters.value
}

onMounted(async () => {
    const mangaId = route.params.mangaid as string
    try {
        manga.value = await mangaLibraryStore.fetchMangaDetails(mangaId)
        characters.value = await mangaLibraryStore.fetchMangaCharacters(mangaId)
        images.value = await mangaLibraryStore.fetchMangaImages(mangaId)
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
    <main class="container mx-auto px-4 py-8 space-y-16">
        <div v-if="loading">Loading...</div>
        <div v-else-if="manga" class="flex flex-col md:flex-row gap-8 card-transition-large">
            <div class="md:w-1/3">
                <img :src="manga.images.jpg.large_image_url" :alt="manga.title" class="w-full rounded-lg shadow-lg"
                    :style="`view-transition-name: card-${manga.mal_id};`" />
                <Button>Add to list</Button>
            </div>
            <div class="md:w-2/3">
                <div>
                    <h1 class="text-3xl font-bold mb-4">{{ manga.title_english }}</h1>
                    <p class="mt-4">{{ manga.synopsis }}</p>
                </div>
                <div class="grid grid-cols-2 gap-4 mt-4">
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Janapese title:</span> {{ manga.title_japanese }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Romaji title:</span> {{ manga.title }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Start date:</span> {{ formatDate(manga.published.from) ?? 'N/A'
                            }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">End date:</span> {{ isDefaultDate(manga.published.to)
                                ? 'N/A' : formatDate(manga.published.to) }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Status:</span> {{ manga.status }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Genres:</span>
                            {{ manga.genres.map(genre => genre.name).join(', ') }}
                        </CardContent>
                    </Card>
                    <Card class="hidden">
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Score:</span> {{ manga.score }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Chapters:</span> {{ manga.chapters }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Volumes:</span> {{ manga.volumes }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold">Type:</span> {{ manga.type }}
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent class="flex flex-col md:flex-row p-2">
                            <span class="font-semibold" v-if="manga.authors.length > 1">Authors:</span>
                            <span class="font-semibold" v-else>Author:</span>
                            {{ manga.authors.map(author => formatAuthorName(author.name)).join(', ') }}
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        <div v-else>
            <p>Manga not found</p>
        </div>

        <div v-if="characters.length > 0">
            <h2 class="text-2xl font-bold mb-4">Characters</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                <Card v-for="character in mainCharacters" :key="character.character.mal_id" class="flex flex-row">
                    <CardContent class="p-2">
                        <img :src="character.character.images.webp.image_url" :alt="character.character.name"
                            class="w-auto h-28 object-cover rounded-md" />
                    </CardContent>
                    <CardContent class="flex flex-col justify-around items-left p-2">
                        <span class="font-semibold">{{ character.character.name }}</span>
                        <span class="text-sm text-gray-600">
                            <Badge>{{ character.role }}</Badge>
                        </span>
                    </CardContent>
                </Card>
            </div>
            <div v-if="showAllCharacters">
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
                    <Card v-for="character in otherCharacters" :key="character.character.mal_id" class="flex flex-row">
                        <CardContent class="p-2">
                            <img :src="character.character.images.webp.image_url" :alt="character.character.name"
                                class="w-auto h-28 object-cover rounded-md" />
                        </CardContent>
                        <CardContent class="flex flex-col justify-around items-left p-2">
                            <span class="font-semibold">{{ character.character.name }}</span>
                            <span class="text-sm text-gray-600">
                                <Badge>{{ character.role }}</Badge>
                            </span>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
        <div class="mt-4">
            <Button @click="toggleCharacters">
                {{ showAllCharacters ? 'Hide' : 'More' }} Characters
            </Button>
        </div>

        <div v-if="images.length > 0">
            <h2 class="text-2xl font-bold mb-4">Images</h2>
            <div class="grid grid-cols-3 sm:grid-cols-2 md:grid-cols-5 lg:grid-cols-2 gap-4">
                <div v-for="image in images" :key="image.jpg.image_url" class="flex flex-col items-center">
                    <img :src="image.jpg.large_image_url"
                        class="w-full h-auto object-cover rounded-lg shadow-lg mb-2" />
                </div>
            </div>
        </div>
    </main>
</template>
