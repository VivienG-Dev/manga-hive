<script setup lang="ts">
import { Button } from '@/components/ui/button'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RouterLink, useRouter } from 'vue-router'
import { ref, watch } from 'vue'
import { useAuthStore } from '@/stores/authStore'
import { storeToRefs } from 'pinia'
import { z } from 'zod'

const router = useRouter()
const authStore = useAuthStore()
// const { user } = storeToRefs(authStore)

// Define the schema for our form
const schema = z.object({
  email: z.string().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
})

type FormData = z.infer<typeof schema>

const email = ref('')
const password = ref('')
const emailError = ref<string | null>(null)
const passwordError = ref<string | null>(null)
const generalError = ref<string | null>(null)

watch(email, () => {
  emailError.value = null
  generalError.value = null
})

watch(password, () => {
  passwordError.value = null
  generalError.value = null
})

async function login() {
  emailError.value = null
  passwordError.value = null
  generalError.value = null

  try {
    // Validate the form data
    const formData: FormData = { email: email.value, password: password.value }
    schema.parse(formData)

    // If validation passes, attempt to log in
    await authStore.login(email.value, password.value)
    email.value = ''
    password.value = ''
    router.push('/profile')
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Handle Zod validation errors
      error.errors.forEach((err) => {
        if (err.path[0] === 'email') {
          emailError.value = err.message
        } else if (err.path[0] === 'password') {
          passwordError.value = err.message
        }
      })
    } else {
      // Handle other errors (e.g., from the auth store)
      console.error('Login failed', error)
      generalError.value = 'Login failed. Please check your credentials.'
    }
  }
}
</script>

<template>
  <Card class="w-full max-w-md bg-background dark:bg-background border-none shadow-none">
    <CardHeader class="space-y-1">
      <CardTitle class="text-2xl"> Log in to your account </CardTitle>
      <CardDescription> Enter your email below to log in </CardDescription>
    </CardHeader>
    <CardContent class="grid gap-4">
      <div class="grid grid-cols-2 gap-6">
        <Button class="bg-white dark:text-background" variant="outline">
          <GitHubIcon class="mr-2 h-4 w-4" />
          GitHub
        </Button>
        <Button class="bg-white dark:text-background" variant="outline">
          <svg role="img" viewBox="0 0 24 24" class="mr-2 h-4 w-4">
            <path fill="currentColor"
              d="M12.48 10.92v3.28h7.84c-.24 1.84-.853 3.187-1.787 4.133-1.147 1.147-2.933 2.4-6.053 2.4-4.827 0-8.6-3.893-8.6-8.72s3.773-8.72 8.6-8.72c2.6 0 4.507 1.027 5.907 2.347l2.307-2.307C18.747 1.44 16.133 0 12.48 0 5.867 0 .307 5.387.307 12s5.56 12 12.173 12c3.573 0 6.267-1.173 8.373-3.36 2.16-2.16 2.84-5.213 2.84-7.667 0-.76-.053-1.467-.173-2.053H12.48z" />
          </svg>
          Google
        </Button>
      </div>
      <div class="relative">
        <div class="absolute inset-0 flex items-center">
          <span class="w-full border-t border-muted-foreground" />
        </div>
        <div class="relative flex justify-center text-xs uppercase">
          <span class="bg-background px-2 text-muted-foreground"> Or continue with </span>
        </div>
      </div>
      <!-- Email input -->
      <div class="grid gap-2">
        <Label for="email">Email <span class="text-red-500">*</span></Label>
        <Input class="bg-white text-foreground dark:text-background" :class="{ 'border-red-500': emailError }"
          id="email" type="email" v-model="email" placeholder="m@example.com" />
        <div v-if="emailError" class="text-red-500 text-sm">{{ emailError }}</div>
      </div>
      <!-- Password input -->
      <div class="grid gap-2">
        <Label for="password">Password <span class="text-red-500">*</span></Label>
        <Input class="bg-white text-foreground dark:text-background" :class="{ 'border-red-500': passwordError }"
          id="password" type="password" v-model="password" />
        <div v-if="passwordError" class="text-red-500 text-sm">{{ passwordError }}</div>
      </div>
      <!-- General error message -->
      <div v-if="generalError" class="text-center text-red-500 text-sm">{{ generalError }}</div>
      <!-- Forgot password link -->
      <div class="text-right">
        <RouterLink to="/forgot-password">
          <Button variant="link"> Forgot password</Button>
        </RouterLink>
      </div>
      <!-- Login button -->
      <div>
        <Button class="w-full" @click.prevent="login()"> Log in </Button>
      </div>
    </CardContent>
    <CardFooter class="flex justify-center">
      <p class="text-muted-foreground text-sm">Don't have an account?</p>
      <RouterLink to="/sign-up"><Button variant="link">Sign up</Button></RouterLink>
    </CardFooter>
  </Card>
</template>
