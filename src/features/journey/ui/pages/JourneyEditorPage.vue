<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useJourneyStore } from '../../application/store'
import PhotoUploader from '@/shared/components/PhotoUploader.vue'
import Input from '@/shared/ui/Input.vue'
import Textarea from '@/shared/ui/Textarea.vue'
import Select from '@/shared/ui/Select.vue'
import Button from '@/shared/ui/Button.vue'
import Label from '@/shared/ui/Label.vue'
import AlertDialog from '@/shared/ui/AlertDialog.vue'
import { toast } from '@/shared/ui/toast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useJourneyStore()

const postId = ref(route.params.id as string | undefined)
const isNew = !postId.value
const readOnlyReason = ref<string | null>(null)

const title = ref('')
const narrative = ref('')
const photos = ref<File[]>([])
const existingPhotoKeys = ref<string[]>([])
const visibility = ref<'draft' | 'published'>('draft')
const submitting = ref(false)
const error = ref<string | null>(null)

onMounted(async () => {
  if (postId.value) {
    // Load existing post for editing
    try {
      await store.fetchFeedItem(postId.value)
      if (store.currentPost) {
        title.value = store.currentPost.title
        narrative.value = store.currentPost.narrative
        existingPhotoKeys.value = store.currentPost.photo_keys ?? []
        visibility.value = store.currentPost.visibility
        // 004 FR-008: published posts are delete-only — no edit path.
        if (store.currentPost.visibility === 'published') {
          readOnlyReason.value = t('journey.published_immutable')
        }
      }
    } catch {
      error.value = 'Failed to load post'
    }
  }
})

// 007 US2: in-app AlertDialog replaces window.confirm
const confirmDelete = ref(false)

async function removePost() {
  if (!postId.value) return
  submitting.value = true
  error.value = null
  try {
    await store.deletePost(postId.value)
    toast(t('journey.post_deleted'), 'success')
    router.push({ name: 'journeys' })
  } catch (e: any) {
    const msg = e.message ?? 'Failed to delete post'
    error.value = msg
    toast(msg, 'error')
  } finally {
    submitting.value = false
  }
}

async function submit() {
  if (!title.value) return
  submitting.value = true
  error.value = null
  try {
    const { journeyApi } = await import('../../infrastructure/api')
    // Upload new photos
    const newKeys: string[] = []
    for (const file of photos.value) {
      const res = await journeyApi.upload(file)
      newKeys.push(res.key)
    }
    const allPhotoKeys = [...existingPhotoKeys.value, ...newKeys]

    if (postId.value) {
      await store.updatePost(postId.value, {
        title: title.value,
        narrative: narrative.value,
        photo_keys: allPhotoKeys,
        visibility: visibility.value,
      })
    } else {
      // Get mountain_id from hike or route query
      const mountainId = route.query.mountain_id as string
      if (!mountainId) {
        error.value = 'Mountain ID required'
        return
      }
      await store.createPost({
        mountain_id: mountainId,
        title: title.value,
        narrative: narrative.value,
        photo_keys: allPhotoKeys,
        summary: {},
        visibility: visibility.value,
      })
    }
    // 007 US2: post-action toast, per visibility (save vs publish)
    toast(visibility.value === 'published' ? t('journey.post_published') : t('journey.post_saved'), 'success')
    router.push({ name: 'journeys' })
  } catch (e: any) {
    const msg = e.message ?? 'Failed to save post'
    error.value = msg
    toast(msg, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">
      {{ isNew ? t('journey.new_post') : t('journey.edit_post') }}
    </h1>

    <!-- Published posts: delete only, no edit path (004 FR-008) -->
    <div v-if="readOnlyReason" class="mt-6 space-y-4">
      <p class="rounded-[var(--radius-input)] border border-amber-500/40 bg-amber-50 px-3 py-2 text-sm text-amber-800">
        {{ readOnlyReason }}
      </p>
      <div class="flex gap-3">
        <Button variant="destructive" :disabled="submitting" @click="confirmDelete = true">
          {{ t('journey.delete_post') }}
        </Button>
        <Button variant="ghost" @click="router.back()">{{ t('common.cancel') }}</Button>
      </div>
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>
    </div>

    <form v-else class="mt-6 space-y-4" @submit.prevent="submit">
      <div>
        <Label>{{ t('journey.title') }}</Label>
        <Input v-model="title" type="text" class="mt-1" />
      </div>

      <div>
        <Label>{{ t('journey.narrative') }}</Label>
        <Textarea v-model="narrative" :rows="6" class="mt-1" />
      </div>

      <div>
        <Label>{{ t('journey.photos') }}</Label>
        <div v-if="existingPhotoKeys.length" class="mt-2 text-xs text-ink-500">
          {{ existingPhotoKeys.length }} {{ t('journey.existing_photos') }}
        </div>
        <PhotoUploader v-model="photos" :max="10" class="mt-2" />
      </div>

      <div>
        <Label>{{ t('journey.visibility') }}</Label>
        <Select
          :model-value="visibility"
          class="mt-1"
          :aria-label="t('journey.visibility')"
          :items="[
            { value: 'draft', label: t('journey.draft') },
            { value: 'published', label: t('journey.published') },
          ]"
          @update:model-value="(v: string | number) => (visibility = v as 'draft' | 'published')"
        />
      </div>

      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <div class="flex gap-3">
        <Button type="submit" :disabled="!title" :loading="submitting">
          {{ submitting ? t('common.loading') : t('common.save') }}
        </Button>
        <Button variant="ghost" @click="router.back()">{{ t('common.cancel') }}</Button>
      </div>
    </form>

    <!-- 007 US2: delete confirmation (replaces window.confirm) -->
    <AlertDialog
      v-model:open="confirmDelete"
      danger
      :title="t('journey.delete_post')"
      :description="t('journey.confirm_delete')"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      @confirm="removePost"
    />
  </section>
</template>
