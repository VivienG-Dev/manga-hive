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
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'

const authStore = useAuthStore()
const userStore = useUserStore()
const { toast } = useToast()

const profileFormSchema = toTypedSchema(z.object({
    avatarUrl: z.string().url().nullable().optional()
        .refine(
            (url) => !url || url.match(/\.(jpeg|jpg|png|webp)$/i),
            'Avatar must be a valid image URL (JPEG, JPG, PNG, WEBP)'
        ),
    backgroundImageUrl: z.string().url().nullable().optional()
        .refine(
            (url) => !url || url.match(/\.(jpeg|jpg|png|webp)$/i),
            'Background image must be a valid image URL (JPEG, JPG, PNG, WEBP)'
        ),
    private: z.boolean(),
}))

const { handleSubmit, values, setFieldValue } = useForm({
    validationSchema: profileFormSchema,
    initialValues: {
        avatarUrl: userStore.user?.avatarUrl || null,
        backgroundImageUrl: userStore.user?.backgroundImageUrl || null,
        private: userStore.user?.private ?? true,
    },
})

// Watch for changes in authStore.user and update form values
watch(() => userStore.user, (newData) => {
    if (newData) {
        setFieldValue('avatarUrl', newData.avatarUrl || null)
        setFieldValue('backgroundImageUrl', newData.backgroundImageUrl || null)
        setFieldValue('private', newData.private)
    }
}, { deep: true })

const hasChanges = computed(() => {
    return values.avatarUrl !== userStore.user?.avatarUrl ||
        values.backgroundImageUrl !== userStore.user?.backgroundImageUrl ||
        values.private !== userStore.user?.private
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

    if (values.avatarUrl !== userStore.user?.avatarUrl) {
        changedValues.avatarUrl = values.avatarUrl || null
    }
    if (values.backgroundImageUrl !== userStore.user?.backgroundImageUrl) {
        changedValues.backgroundImageUrl = values.backgroundImageUrl || null
    }
    if (values.private !== userStore.user?.private) {
        changedValues.private = values.private
    }

    if (Object.keys(changedValues).length > 0) {
        try {
            await userStore.updateProfile(changedValues)
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

const avatarInputRef = ref<HTMLInputElement | null>(null)
const backgroundInputRef = ref<HTMLInputElement | null>(null)

const showAvatarCropper = ref(false)
const showBackgroundCropper = ref(false)
const avatarImage = ref('')
const backgroundImage = ref('')

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FORMATS = ['image/jpeg', 'image/png', 'image/webp'];

const handleFileChange = (event: Event, fieldName: 'avatarUrl' | 'backgroundImageUrl') => {
    const file = (event.target as HTMLInputElement).files?.[0]
    if (file) {
        if (file.size > MAX_FILE_SIZE) {
            toast({
                title: 'File too large',
                description: 'Please select an image smaller than 10MB.',
                variant: 'destructive',
            })
            return
        }
        if (!ALLOWED_FORMATS.includes(file.type)) {
            toast({
                title: 'Invalid file type',
                description: 'Please select a JPEG, PNG, or WEBP image.',
                variant: 'destructive',
            })
            return
        }
        const reader = new FileReader()
        reader.onload = (e) => {
            if (fieldName === 'avatarUrl') {
                avatarImage.value = e.target?.result as string
                showAvatarCropper.value = true
            } else {
                backgroundImage.value = e.target?.result as string
                showBackgroundCropper.value = true
            }
        }
        reader.readAsDataURL(file)
    }
}

const cropImage = async (fieldName: 'avatarUrl' | 'backgroundImageUrl') => {
    const cropper = fieldName === 'avatarUrl' ? avatarCropperRef.value : backgroundCropperRef.value
    // @ts-ignore
    const { canvas } = cropper.getResult()
    canvas.toBlob(async (blob: Blob) => {
        if (blob) {
            try {
                const file = new File([blob], `${fieldName}.jpg`, { type: 'image/jpeg' })
                const url = await userStore.uploadFile(file, fieldName)
                setFieldValue(fieldName, url)
                toast({
                    title: 'File uploaded',
                    description: 'Your image has been uploaded successfully.',
                })
                closeCropper(fieldName)
            } catch (error) {
                console.error('Error uploading file:', error)
                toast({
                    title: 'Upload failed',
                    description: 'Failed to upload the file. Please try again.',
                    variant: 'destructive',
                })
            }
        }
    }, 'image/jpeg')
}

const avatarCropperRef = ref(null)
const backgroundCropperRef = ref(null)

const closeCropper = (fieldName: 'avatarUrl' | 'backgroundImageUrl') => {
    if (fieldName === 'avatarUrl') {
        showAvatarCropper.value = false
        avatarImage.value = ''
        if (avatarInputRef.value) {
            avatarInputRef.value.value = ''
        }
    } else {
        showBackgroundCropper.value = false
        backgroundImage.value = ''
        if (backgroundInputRef.value) {
            backgroundInputRef.value.value = ''
        }
    }
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
        <FormField name="avatarUrl">
            <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                    <img :src="values.avatarUrl ? values.avatarUrl : '/default-avatar.webp'" alt="User avatar"
                        class="rounded-md w-32 h-32">
                    <Input ref="avatarInputRef" type="file" class="cursor-pointer"
                        @change="(e: Event) => handleFileChange(e, 'avatarUrl')" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="backgroundImageUrl">
            <FormItem>
                <FormLabel>Background Image</FormLabel>
                <FormControl>
                    <div v-if="!values.backgroundImageUrl" class="rounded-md w-full h-32 bg-gray-200"
                        :style="{ backgroundColor: '#e5e5e5' }">
                    </div>
                    <img v-else :src="values.backgroundImageUrl" alt="User background"
                        class="rounded-md w-full h-32 object-cover">
                    <Input ref="backgroundInputRef" type="file" class="cursor-pointer mt-2"
                        @change="(e: Event) => handleFileChange(e, 'backgroundImageUrl')" />
                </FormControl>
                <FormMessage />
            </FormItem>
        </FormField>

        <FormField name="private">
            <FormItem class="flex flex-row items-center justify-between rounded-lg border p-4 bg-white">
                <div class="space-y-0.5">
                    <FormLabel class="text-base">
                        Private Profile
                    </FormLabel>
                    <FormDescription>
                        Make your profile visible to other users. Your profile is currently {{ userStore.user?.private ?
                            'private' : 'public' }}.
                    </FormDescription>
                </div>
                <FormControl>
                    <Switch :checked="values.private" @update:checked="togglePrivate" />
                </FormControl>
            </FormItem>
        </FormField>

        <!-- Avatar Cropper -->
        <div v-if="showAvatarCropper"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-4 rounded-md max-w-[90vw] md:max-w-[70vw] max-h-[90vh] flex flex-col">
                <div class="overflow-auto flex-grow">
                    <Cropper ref="avatarCropperRef" :src="avatarImage" :stencil-props="{
                        aspectRatio: 1
                    }" :auto-zoom="true" class="max-h-[70vh]" />
                </div>
                <div class="mt-4 flex justify-end space-x-2">
                    <Button @click="cropImage('avatarUrl')">Crop and Upload</Button>
                    <Button @click="closeCropper('avatarUrl')" variant="outline">Cancel</Button>
                </div>
            </div>
        </div>

        <!-- Background Cropper -->
        <div v-if="showBackgroundCropper"
            class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div class="bg-white p-4 rounded-md max-w-[70vw] max-h-[90vh] flex flex-col">
                <div class="overflow-auto flex-grow">
                    <Cropper ref="backgroundCropperRef" :src="backgroundImage" :stencil-props="{
                        aspectRatio: 16 / 9
                    }" :auto-zoom="true" class="max-h-[70vh]" />
                </div>
                <div class="mt-4 flex justify-end space-x-2">
                    <Button @click="cropImage('backgroundImageUrl')">Crop and Upload</Button>
                    <Button @click="closeCropper('backgroundImageUrl')" variant="outline">Cancel</Button>
                </div>
            </div>
        </div>

        <div class="flex gap-2 justify-start">
            <Button type="submit">
                Update profile
            </Button>
        </div>
    </form>
</template>

<style scoped>
.cropper-container {
    max-width: 70vw;
    max-height: 40vh;
}
</style>