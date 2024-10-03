<script setup lang="ts">
const date = new Date()
</script>

<template>
    <footer class="bg-gray-800 text-white py-4 mt-16">
        <div class="container mx-auto px-4">
            <p class="text-center">© {{ date.getFullYear() }} VivienG.</p>
        </div>
    </footer>
</template>
