<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useMangaLibraryStore, type JikanManga, type JikanCharacter } from '@/stores/mangaLibraryStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toast'
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
} from '@/components/ui/drawer'
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

const route = useRoute()
const { toast } = useToast()
const mangaLibraryStore = useMangaLibraryStore()
const manga = ref<JikanManga | null>(null)
const characters = ref<JikanCharacter[]>([])
const loading = ref(true)
const errorMessage = ref<string | null>(null)

const showAllCharacters = ref(false)
const mainCharacters = computed(() => characters.value.filter(char => char.role === 'Main'))
const otherCharacters = computed(() => characters.value.filter(char => char.role !== 'Main'))

// New refs for the drawer
const isDrawerOpen = ref(false)
const selectedManga = ref<JikanManga | null>(null)
const status = ref<'PLAN_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED'>('PLAN_TO_READ')
const userScore = ref<any>(null)
const volumesProgress = ref<any>(null)
const chaptersProgress = ref<any>(null)
const notes = ref<string>('')

const toggleCharacters = () => {
    showAllCharacters.value = !showAllCharacters.value
}

onMounted(async () => {
    const mangaId = route.params.mangaid as string
    try {
        manga.value = await mangaLibraryStore.fetchMangaDetails(mangaId)
        characters.value = await mangaLibraryStore.fetchMangaCharacters(mangaId)
    } catch (error: any) {
        errorMessage.value = error.message
    } finally {
        loading.value = false
    }
})

const formatAuthorName = (authorName: string): string => {
    const nameParts = authorName.split(', ');
    return nameParts.length > 1 ? `${nameParts[1]} ${nameParts[0]}` : authorName;
};

const isDefaultDate = (date: string): boolean => {
    return new Date(date).getTime() === 0;
}

const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

const openDrawer = (manga: JikanManga) => {
    selectedManga.value = manga
    isDrawerOpen.value = true
}

const handleAddToLibrary = async () => {
    if (selectedManga.value) {
        try {
            const response = await mangaLibraryStore.addToLibrary({
                malId: selectedManga.value.mal_id,
                status: status.value,
                userScore: userScore.value || 0,
                volumesProgress: volumesProgress.value || 0,
                chaptersProgress: chaptersProgress.value || 0,
                notes: notes.value || '',
            })

            isDrawerOpen.value = false
            // Reset form values
            status.value = 'PLAN_TO_READ'
            userScore.value = null
            volumesProgress.value = null
            chaptersProgress.value = null
            notes.value = ''

            if (response === 'Item already in library.') {
                toast({
                    title: 'Already in your library.',
                    description: 'The manga is already in your library.',
                })
            } else {
                toast({
                    title: 'Added to library',
                    description: 'The manga has been successfully added to your library.',
                })
            }
        } catch (error) {
            toast({
                title: 'Failed to add item to library',
                description: 'An error occurred while adding the item to your library.',
            })
        }
    }
}
</script>

<template>
    <main v-if="loading" class="container flex flex-col md:flex-row mx-auto px-4 py-2 md:py-4 gap-4">
        <Skeleton class="h-96 md:h-[500px] w-full md:w-96 rounded-md" />
        <div class="space-y-2 w-full">
            <Skeleton class="h-8 md:h-[40px]" />
            <Skeleton class="h-44 md:h-[144px]" />
            <Skeleton class="hidden md:block  h-44 md:h-[300px]" />
        </div>
    </main>
    <main v-else-if="errorMessage" class="container mx-auto px-4 space-y-16">
        <!-- Display error message -->
        <div class="text-red-500">{{ errorMessage }}</div>
    </main>
    <main v-else-if="manga" class="container mx-auto px-4 space-y-16">
        <Toaster />
        <div class="flex flex-col md:flex-row gap-8 card-transition-large">
            <div class="md:w-1/4 flex flex-col gap-2">
                <img :src="manga.images.webp.large_image_url" :alt="manga.title" class="w-full rounded-lg shadow-lg"
                    :style="`view-transition-name: card-${manga.mal_id};`" />
                <Button @click.stop="openDrawer(manga)">Add to list</Button>
            </div>
            <div class="md:w-3/4">
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

        <div v-if="characters.length > 0">
            <h2 class="text-2xl font-bold mb-4">Characters</h2>
            <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
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
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-4">
                    <Card v-for="character in otherCharacters" :key="character.character.mal_id" class="flex flex-row">
                        <CardContent class="p-2">
                            <img :src="character.character.images.webp.image_url" :alt="character.character.name"
                                class="w-20 h-28 object-cover rounded-md" />
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

            <div v-if="characters.length > 0">
                <Button @click="toggleCharacters">
                    {{ showAllCharacters ? 'Hide' : 'More' }} Characters
                </Button>
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
    </main>
</template>
