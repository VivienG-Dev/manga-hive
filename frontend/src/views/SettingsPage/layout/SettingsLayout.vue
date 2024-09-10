<script setup lang="ts">
import SidebarNav from '@/views/SettingsPage/components/SideBar.vue'
import Separator from '@/components/ui/separator/Separator.vue';
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
                    <slot />
                </div>
            </div>
        </div>
    </main>
</template>