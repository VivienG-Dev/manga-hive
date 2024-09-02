import { defineStore } from 'pinia'
import axios from 'axios'

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  withCredentials: true
})

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

export interface JikanManga {
  mal_id: number;
  title: string;
  images: {
    jpg: {
      image_url: string;
    };
  };
  synopsis: string;
  authors: { name: string }[];
  genres: { name: string }[];
  chapters: number;
  volumes: number;
  score: number;
}

interface LibraryEntry {
  id: number;
  userId: number;
  malId: number;
  itemType: 'MANGA' | 'ANIME';
  status: 'PLAN_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED';
  title: string | null;
  imageUrl: string | null;
  synopsis: string | null;
  authors: string | null;
  genres: string | null;
  chapters: number | null;
  volumes: number | null;
  userScore: number | null;
  volumesProgress: number | null;
  chaptersProgress: number | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface AddToLibraryPayload {
  malId: number;
  status: LibraryEntry['status'];
  userScore: number | null;
  volumesProgress: number | null;
  chaptersProgress: number | null;
  notes: string | null;
}

export const useMangaLibraryStore = defineStore('mangaLibrary', {
  state: () => ({
    searchResults: [] as JikanManga[],
    libraryEntries: [] as LibraryEntry[],
  }),
  actions: {
    async searchManga(query: string) {
      try {
        const response = await axios.get<{ data: JikanManga[] }>(`https://api.jikan.moe/v4/manga?q=${query}&sfw`)
        this.searchResults = response.data.data
      } catch (error) {
        console.error('Failed to search manga', error)
      }
    },
    async addToLibrary(payload: AddToLibraryPayload) {
      try {
        const manga = this.searchResults.find(result => result.mal_id === payload.malId);
        if (!manga) {
          throw new Error('Manga not found in search results');
        }
        const response = await api.post<LibraryEntry>('/library', {
          malId: payload.malId,
          itemType: 'MANGA',
          status: payload.status,
          title: manga.title,
          imageUrl: manga.images.jpg.image_url,
          synopsis: manga.synopsis,
          authors: manga.authors.map(author => author.name).join(', '),
          genres: manga.genres.map(genre => genre.name).join(', '),
          chapters: manga.chapters,
          volumes: manga.volumes,
          userScore: payload.userScore,
          volumesProgress: payload.volumesProgress,
          chaptersProgress: payload.chaptersProgress,
          notes: payload.notes
        });
        this.libraryEntries.push(response.data);
      } catch (error) {
        console.error('Failed to add item to library', error);
        throw error;
      }
    },
    async fetchLibrary() {
      try {
        const response = await api.get<LibraryEntry[]>('/library')
        this.libraryEntries = response.data
      } catch (error) {
        console.error('Failed to fetch library', error)
      }
    },
  },
})