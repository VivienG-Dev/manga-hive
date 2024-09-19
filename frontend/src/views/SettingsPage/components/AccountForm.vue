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
import type { UserData } from '@/stores/userStore'

const authStore = useAuthStore()
const userStore = useUserStore()
const { toast } = useToast()

// Update the schema
const profileFormSchema = toTypedSchema(z.object({
    oldPassword: z.string(),
    newPassword: z.string().min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .max(20, 'Password must not exceed 20 characters')
        .refine((val) => /[A-Za-z]/.test(val), 'Password must contain at least one letter')
        .refine((val) => /\d/.test(val), 'Password must contain at least one number')
        .refine(
            (val) => /[@$!%*#?&]/.test(val),
            'Password must contain at least one special character (@$!%*#?&)'
        ),
    confirmPassword: z.string().min(1, 'Password is required')
        .min(8, 'Password must be at least 8 characters long')
        .max(20, 'Password must not exceed 20 characters')
        .refine((val) => /[A-Za-z]/.test(val), 'Password must contain at least one letter')
        .refine((val) => /\d/.test(val), 'Password must contain at least one number')
        .refine(
            (val) => /[@$!%*#?&]/.test(val),
            'Password must contain at least one special character (@$!%*#?&)'
        )
}))

const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: profileFormSchema
})

// Update the computed property
const hasChanges = computed(() => {
    return values.oldPassword !== '' && values.newPassword !== '' && values.confirmPassword !== ''
})

const onSubmit = handleSubmit(async (values) => {
    if (!hasChanges.value) {
        toast({
            title: 'No changes detected',
            description: 'Please fill all password fields to update your password.',
        })
        return
    }

    if (values.newPassword !== values.confirmPassword) {
        toast({
            title: 'Error',
            description: 'New password and confirmation do not match.',
            variant: 'destructive',
        })
        return
    }

    try {
        await userStore.updateProfile({
            oldPassword: values.oldPassword,
            newPassword: values.newPassword,
        } as Partial<UserData>)

        // Reset the password fields after successful update
        setFieldValue('oldPassword', '')
        setFieldValue('newPassword', '')
        setFieldValue('confirmPassword', '')

        toast({
            title: 'Profile updated',
            description: 'Your password has been successfully updated.',
        })
    } catch (error: any) {
        toast({
            title: 'Error',
            description: error.response.data.message || 'Failed to update password. Please try again.',
            variant: 'destructive',
        })
    }
})
</script>

<template>
    <div>
        <Toaster />
        <h3 class="text-lg font-medium">
            Account
        </h3>
        <p class="text-sm text-muted-foreground">
            This page allows you to manage your account settings.
        </p>
    </div>
    <Separator />
    <form class="space-y-8" @submit="onSubmit">
        <FormField v-slot="{ componentField }" name="oldPassword">
            <FormItem>
                <FormLabel>Old Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="Old password" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                    Leave blank if you don't want to change your password.
                </FormDescription>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="newPassword">
            <FormItem>
                <FormLabel>New Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="New password" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                    Leave blank if you don't want to change your password.
                </FormDescription>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField v-slot="{ componentField }" name="confirmPassword">
            <FormItem>
                <FormLabel>Confirm new Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="Confirm new password" v-bind="componentField" />
                </FormControl>
                <FormDescription>
                    Leave blank if you don't want to change your password.
                </FormDescription>
                <FormMessage />
            </FormItem>
        </FormField>

        <div class="flex gap-2 justify-start">
            <Button type="submit">
                Update profile
            </Button>
        </div>
    </form>
</template>