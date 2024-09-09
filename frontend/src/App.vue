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
    <NavBar v-if="!isAuthPage" :user="user" :isAuthenticated="isAuthenticated" :mode="{ value: mode }"
      @update:mode="mode = $event" />
    <RouterView />
  </div>
</template>

<style>
@keyframes fade-out {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}

@keyframes fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

/* ::view-transition-old(root) {
  animation: fade-out 350ms cubic-bezier(0, 0, 0.2, 1),
}

::view-transition-new(root) {
  animation: fade-in 350ms cubic-bezier(0, 0, 0.2, 1);
  mix-blend-mode: normal;
} */

::view-transition-old(root),
::view-transition-new(root) {
  mix-blend-mode: normal;
}

/* ::view-transition-old(card-*),
::view-transition-new(card-*) {
  mix-blend-mode: normal;
} */
</style>
