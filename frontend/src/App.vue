<script setup lang="ts">
import { RouterView, useRoute } from 'vue-router'
import { onMounted, computed } from 'vue'
import { useAuthStore } from './stores/authStore'
import { storeToRefs } from 'pinia'
import { useColorMode } from '@vueuse/core'
import NavBar from './components/MainNavbar.vue'

const route = useRoute()
const authStore = useAuthStore()
const { user, isAuthenticated } = storeToRefs(authStore)

const mode = useColorMode()

onMounted(async () => {
  await authStore.checkAuthStatus()
})

const isAuthPage = computed(() => {
  return ['sign-in', 'sign-up'].includes(route.name as string)
})
</script>

<template>
  <div :class="[isAuthPage ? 'w-full' : 'container mx-auto max-w-screen-xl my-4 md:my-8 px-4']">
    <NavBar
      v-if="!isAuthPage"
      :user="user"
      :isAuthenticated="isAuthenticated"
      :mode="{ value: mode }"
      @update:mode="mode = $event"
    />
    <RouterView />
  </div>
</template>
