<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import SidebarNav from '@/views/SettingsPage/components/SideBar.vue'
import Separator from '@/components/ui/separator/Separator.vue'
import ProfileForm from '@/views/SettingsPage/components/ProfileForm.vue'
import AccountForm from '@/views/SettingsPage/components/AccountForm.vue'

const route = useRoute()

const currentComponent = computed(() => {
    switch (route.name) {
        case 'settings.profile':
            return ProfileForm
        case 'settings.account':
            return AccountForm
        default:
            return ProfileForm
    }
})
</script>

<template>
    <main class="container mx-auto px-4 py-8 space-y-6">
        <div>
            <h1 class="text-2xl font-bold">Settings</h1>
            <p class="text-muted-foreground">Manage your account settings and set e-mail preferences.</p>
        </div>
        <Separator />
        <div class="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
            <aside class="-mx-4 lg:w-1/5">
                <SidebarNav />
            </aside>
            <div class="flex-1 lg:max-w-2xl">
                <div class="space-y-6">
                    <component :is="currentComponent" />
                </div>
            </div>
        </div>
    </main>
</template>