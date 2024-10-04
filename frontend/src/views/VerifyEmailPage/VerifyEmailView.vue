<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/authStore'
import { Button } from '@/components/ui/button'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()

const verificationStatus = ref<'verifying' | 'success' | 'error'>('verifying')
const errorMessage = ref('')

onMounted(async () => {
    const token = route.query.token as string

    if (!token) {
        verificationStatus.value = 'error'
        errorMessage.value = 'No verification token provided'
        return
    }

    try {
        await authStore.verifyEmail(token)
        verificationStatus.value = 'success'
    } catch (error) {
        verificationStatus.value = 'error'
        errorMessage.value = 'Email verification failed. Please try again or contact support.'
    }
})

const goToLogin = () => {
    router.push('/login')
}
</script>

<template>
    <div class="flex items-center justify-center min-h-screen bg-background">
        <div class="max-w-md w-full p-8 bg-card rounded-lg shadow-lg">
            <h1 class="text-2xl font-bold mb-4 text-center">Email Verification</h1>

            <div v-if="verificationStatus === 'verifying'" class="text-center">
                <p>Verifying your email... Please wait.</p>
            </div>

            <div v-else-if="verificationStatus === 'success'" class="text-center">
                <p class="mb-4 text-green-600">Your email has been successfully verified!</p>
                <Button @click="goToLogin">Go to Login</Button>
            </div>

            <div v-else class="text-center">
                <p class="mb-4 text-red-600">{{ errorMessage }}</p>
                <Button @click="goToLogin">Go to Login</Button>
            </div>
        </div>
    </div>
</template>