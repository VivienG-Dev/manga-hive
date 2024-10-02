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
  title_japanese: string;
  title_english: string;
  published: {
    from: string;
    to: string;
  };
  images: {
    jpg: {
      image_url: string;
      large_image_url: string;
    };
    webp: {
      image_url: string;
      large_image_url: string;
    }
  };
  synopsis: string;
  authors: { name: string }[];
  genres: { name: string }[];
  chapters: number;
  volumes: number;
  score: number;
  status: string;
  type: string;
}

export interface JikanCharacter {
  character: {
    mal_id: number;
    images: {
      webp: {
        image_url: string;
      };
    };
    name: string;
  };
  role: string;
}

export interface JikanImage {
  jpg: {
    image_url: string,
    small_image_url: string,
    large_image_url: string
  },
  webp: {
    image_url: string,
    small_image_url: string,
    large_image_url: string
  }
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
    characters: [] as JikanCharacter[],
    topManga: [] as JikanManga[],
    pagination: {
      currentPage: 1,
      lastVisiblePage: 1,
      hasNextPage: false,
    },
  }),
  actions: {
    async searchManga(query: string, page: number = 1) {
      try {
        const response = await axios.get<{ data: JikanManga[], pagination: { last_visible_page: number, has_next_page: boolean } }>(
          `https://api.jikan.moe/v4/manga?q=${query}&page=${page}&limit=15&sfw`
        )
        this.searchResults = response.data.data
        this.pagination = {
          currentPage: page,
          lastVisiblePage: response.data.pagination.last_visible_page,
          hasNextPage: response.data.pagination.has_next_page,
        }
      } catch (error) {
        console.error('Failed to search manga', error)
      }
    },
    async addToLibrary(payload: AddToLibraryPayload) {
      try {
        const mangaDetails = await this.fetchMangaDetails(payload.malId.toString());
        if (!mangaDetails) {
          throw new Error('Manga not found');
        }

        const response = await api.post<LibraryEntry | { message: string }>('/library', {
          malId: payload.malId,
          itemType: 'MANGA',
          status: payload.status,
          title: mangaDetails.title,
          imageUrl: mangaDetails.images.jpg.image_url,
          synopsis: mangaDetails.synopsis,
          authors: mangaDetails.authors.map(author => author.name).join(', '),
          genres: mangaDetails.genres.map(genre => genre.name).join(', '),
          chapters: mangaDetails.chapters,
          volumes: mangaDetails.volumes,
          userScore: payload.userScore,
          volumesProgress: payload.volumesProgress,
          chaptersProgress: payload.chaptersProgress,
          notes: payload.notes
        });

        if ('message' in response.data) {
          return response.data.message;
        } else {
          this.libraryEntries.push(response.data);
        }
      } catch (error) {
        console.error('Failed to add item to library', error);
        throw error;
      }
    },
    async updateLibraryEntry(payload: {
      id: number;
      status?: 'PLAN_TO_READ' | 'READING' | 'COMPLETED' | 'ON_HOLD' | 'DROPPED';
      userScore?: number;
      volumesProgress?: number;
      chaptersProgress?: number;
      notes?: string;
    }) {
      try {
        const response = await api.put<LibraryEntry>('/library', payload);
        const index = this.libraryEntries.findIndex(entry => entry.id === payload.id);
        if (index !== -1) {
          this.libraryEntries[index] = response.data;
        }
      } catch (error) {
        console.error('Failed to update library entry', error);
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
    async removeItemFromLibrary(id: number) {
      try {
        await api.delete('/library', { data: { id } });
        this.libraryEntries = this.libraryEntries.filter(entry => entry.id !== id);
      } catch (error) {
        console.error('Failed to delete the item from library', error);
      }
    },
    async fetchMangaDetails(mangaId: string): Promise<JikanManga> {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/full`)
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        const data = await response.json()
        return data.data
      } catch (error) {
        console.error('Error fetching manga details:', error)
        throw error
      }
    },
    async fetchMangaCharacters(mangaId: string): Promise<JikanCharacter[]> {
      try {
        const response = await fetch(`https://api.jikan.moe/v4/manga/${mangaId}/characters`)
        if (response.status === 429) {
          const errorData = await response.json();
          throw new Error(errorData.message);
        }
        const data = await response.json()
        return data.data
      } catch (error) {
        console.error('Error fetching manga characters:', error)
        throw error
      }
    },
    async fetchTopManga(): Promise<JikanManga> {
      try {
        const response = await fetch('https://api.jikan.moe/v4/top/manga?limit=5&filter=bypopularity')
        const data = await response.json()
        this.topManga = data.data
        return data.data
      } catch (error) {
        console.error('Error fetching manga details:', error)
        throw error
      }
    }
  },
})