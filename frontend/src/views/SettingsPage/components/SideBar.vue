<script setup lang="ts">
import { useRoute } from 'vue-router'
import { computed } from 'vue'

interface Item {
    title: string
    href: string
}

const route = useRoute()

const sidebarNavItems: Item[] = [
    {
        title: 'Profile',
        href: '/settings',
    },
    {
        title: 'Account',
        href: '/settings/account',
    }
]

const isActive = computed(() => (href: string) => {
    if (href === '/settings') {
        return route.path === href
    }
    return route.path === href
})
</script>

<template>
    <nav class="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
        <router-link v-for="item in sidebarNavItems" :key="item.title" :to="item.href" custom v-slot="{ navigate }">
            <button @click="navigate" class="w-full text-left justify-start px-3 py-2 rounded-md" :class="[
                isActive(item.href)
                    ? 'bg-muted text-primary'
                    : 'text-muted-foreground hover:bg-muted hover:text-primary'
            ]">
                {{ item.title }}
            </button>
        </router-link>
    </nav>
</template>