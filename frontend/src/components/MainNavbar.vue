<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { useAuthStore } from '@/stores/authStore'

const props = defineProps<{
  user: { username: string } | null
  isAuthenticated: boolean
}>()

const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
}
</script>

<template>
  <nav
    class="sticky top-0 flex justify-between items-center p-2 rounded-lg shadow dark:shadow-none bg-white dark:bg-background"
  >
    <RouterLink to="/" class="text-3xl font-bold">
      <h1 class="text-xl font-bold">My Manga Library</h1>
    </RouterLink>
    <div class="flex items-center gap-4">
      <RouterLink to="/about"><Button variant="ghost">About</Button></RouterLink>
      <RouterLink v-if="isAuthenticated" :to="`/users/${user?.username}`">Profile</RouterLink>
      <RouterLink v-else to="/sign-in"><Button>Login</Button></RouterLink>
      <div class="flex items-center gap-4" v-if="isAuthenticated">
        <p>Welcome, {{ user?.username || 'Guest' }}!</p>
        <Button @click.prevent="logout">Logout</Button>
      </div>
      <div class="border-l border-slate-800 dark:border-slate-500 ml-2 pl-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              <Icon
                icon="radix-icons:moon"
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"
              />
              <Icon
                icon="radix-icons:sun"
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
              />
              <span class="sr-only">Toggle theme</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem @click="$emit('update:mode', 'light')"> Light </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('update:mode', 'dark')"> Dark </DropdownMenuItem>
            <DropdownMenuItem @click="$emit('update:mode', 'auto')"> System </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  </nav>
</template>
