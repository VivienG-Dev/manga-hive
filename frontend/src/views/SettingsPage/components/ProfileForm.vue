<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/zod'
import * as z from 'zod'
import { useAuthStore } from '@/stores/authStore'
import { useUserStore } from '@/stores/userStore'
import Input from '@/components/ui/input/Input.vue'
import { FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import Separator from '@/components/ui/separator/Separator.vue'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/toast'
import { Toaster } from '@/components/ui/toast'

const authStore = useAuthStore()
const userStore = useUserStore()
const { toast } = useToast()

const profileFormSchema = toTypedSchema(z.object({
    password: z.string()
        .min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .max(20, 'Password must not exceed 20 characters')
        .refine((val) => /[A-Za-z]/.test(val), 'Password must contain at least one letter')
        .refine((val) => /\d/.test(val), 'Password must contain at least one number')
        .refine(
            (val) => /[@$!%*#?&]/.test(val),
            'Password must contain at least one special character (@$!%*#?&)'
        ).optional().or(z.literal('')),
    avatarUrl: z.string().url().nullable().optional(),
    backgroundImageUrl: z.string().url().nullable().optional(),
    private: z.boolean(),
}))

const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: profileFormSchema,
    initialValues: {
        password: '',
        avatarUrl: authStore.user?.avatarUrl || null,
        backgroundImageUrl: authStore.user?.backgroundImageUrl || null,
        private: authStore.user?.private ?? true,
    },
})

// Watch for changes in authStore.user and update form values
watch(() => authStore.user, (newData) => {
    if (newData) {
        setFieldValue('avatarUrl', newData.avatarUrl || null)
        setFieldValue('backgroundImageUrl', newData.backgroundImageUrl || null)
        setFieldValue('private', newData.private)
    }
}, { deep: true })

const hasChanges = computed(() => {
    return values.password !== '' ||
        values.avatarUrl !== authStore.user?.avatarUrl ||
        values.backgroundImageUrl !== authStore.user?.backgroundImageUrl ||
        values.private !== authStore.user?.private
})

const onSubmit = handleSubmit(async (values) => {
    if (!hasChanges.value) {
        toast({
            title: 'No changes detected',
            description: 'Please make changes before submitting.',
        })
        return
    }

    const changedValues: Partial<typeof values> = {}

    if (values.password !== '') {
        changedValues.password = values.password
    }
    if (values.avatarUrl !== authStore.user?.avatarUrl) {
        changedValues.avatarUrl = values.avatarUrl || null
    }
    if (values.backgroundImageUrl !== authStore.user?.backgroundImageUrl) {
        changedValues.backgroundImageUrl = values.backgroundImageUrl || null
    }
    if (values.private !== authStore.user?.private) {
        changedValues.private = values.private
    }

    if (Object.keys(changedValues).length > 0) {
        try {
            await userStore.updateProfile(changedValues)
            // Reset the password field after successful update
            setFieldValue('password', '')
            toast({
                title: 'Profile updated',
                description: 'Your profile has been successfully updated.',
            })
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to update profile. Please try again.',
                variant: 'destructive',
            })
        }
    }
})

const togglePrivate = () => {
    setFieldValue('private', !values.private)
}
</script>

<template>
    <div>
        <Toaster />
        <h3 class="text-lg font-medium">
            Profile
        </h3>
        <p class="text-sm text-muted-foreground">
            This is how others will see you on the site.
        </p>
    </div>
    <Separator />
    <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="password">
            <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="New password" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                    Leave blank if you don't want to change your password.
                </FormDescription>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="avatarUrl">
            <FormItem>
                <FormLabel>Profile Image URL</FormLabel>
                <FormControl>
                    <Input type="url" placeholder="https://example.com/image.jpg" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="backgroundImageUrl">
            <FormItem>
                <FormLabel>Background Image URL</FormLabel>
                <FormControl>
                    <Input type="url" placeholder="https://example.com/background.jpg" v-bind="componentField" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ field }" name="private">
            <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                <div class="space-y-0.5">
                    <FormLabel class="text-base">
                        Private Profile
                    </FormLabel>
                    <FormDescription>
                        Make your profile visible to other users. Your profile is currently {{ authStore.user?.private ?
                            'private' : 'public' }}.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch :checked="values.private" @update:checked="togglePrivate" />
                </FormControl>
            </FormItem>
        </FormField>

        <div class="flex gap-2 justify-start">
            <Button type="submit">
                Update profile
            </Button>
        </div>
    </form>
</template>