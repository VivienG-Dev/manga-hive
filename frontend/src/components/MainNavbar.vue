<script setup lang="ts">
import { RouterLink, useRouter } from 'vue-router'
import { Button } from '@/components/ui/button'
import { Icon } from '@iconify/vue'
import { Menu } from 'lucide-vue-next'
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
import { useAuthStore } from '@/stores/authStore'

const router = useRouter()

const props = defineProps<{
  user: { username: string } | null
  isAuthenticated: boolean
}>()

const authStore = useAuthStore()

const logout = async () => {
  await authStore.logout()
  router.push('/')
}
</script>

<template>
  <nav
    class="sticky top-0 z-50 flex justify-between items-center p-2 rounded-lg shadow dark:shadow-none bg-white dark:bg-background">
    <RouterLink to="/" class="text-3xl font-bold">
      <h1 class="text-xl font-bold">Manga Hive</h1>
    </RouterLink>
    <div class="hidden md:flex items-center gap-4">
      <RouterLink v-if="isAuthenticated" to="/profile">Profile</RouterLink>
      <RouterLink v-else to="/sign-in"><Button>Login</Button></RouterLink>
      <div class="flex items-center gap-4" v-if="isAuthenticated">
        <p>Welcome, {{ user?.username || 'Guest' }}!</p>
        <Button @click.prevent="logout">Logout</Button>
      </div>
      <div class="border-l border-slate-800 dark:border-slate-500 ml-2 pl-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              <Icon icon="radix-icons:moon"
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icon icon="radix-icons:sun"
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
    <div class="flex md:hidden items-center gap-4">
      <DropdownMenu v-if="isAuthenticated">
        <DropdownMenuTrigger as-child>
          <Button variant="ghost">
            <Menu :size="24" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent class="w-56">
          <DropdownMenuLabel>Welcome, {{ user?.username || 'Guest' }}!</DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuGroup>
            <RouterLink v-if="isAuthenticated" to="/profile">
              <DropdownMenuItem class="cursor-pointer"> Profile </DropdownMenuItem>
            </RouterLink>
            <DropdownMenuItem>
              <span>Settings</span>
              <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
            </DropdownMenuItem>
          </DropdownMenuGroup>
          <DropdownMenuSeparator />
          <DropdownMenuItem disabled>
            <span>API</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem class="cursor-pointer" @click.prevent="logout">
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
      <RouterLink v-else to="/sign-in"><Button>Login</Button></RouterLink>

      <div class="border-l border-slate-800 dark:border-slate-500 ml-2 pl-2">
        <DropdownMenu>
          <DropdownMenuTrigger as-child>
            <Button variant="ghost">
              <Icon icon="radix-icons:moon"
                class="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Icon icon="radix-icons:sun"
                class="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
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
