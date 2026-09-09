<script setup lang="ts">
/**
 * MountainPhotoField (002 US1) — cover-photo editor for one mountain.
 * Upload → PUT photo (reason optional but prompted, Principle II), replace,
 * remove. Parent refreshes from the returned AdminMountain.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminMountainsApi, type AdminMountain } from '../infrastructure/api'

const props = defineProps<{ mountain: AdminMountain }>()
const emit = defineEmits<{ updated: [AdminMountain] }>()

const { t } = useI18n()

const fileInput = ref<HTMLInputElement | null>(null)
const reason = ref('')
const busy = ref(false)
const error = ref<string | null>(null)

async function pick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (file.size > 10 * 1024 * 1024) {
    error.value = t('photo.too_large', { name: file.name })
    return
  }
  if (!file.type.startsWith('image/')) {
    error.value = t('photo.not_image', { name: file.name })
    return
  }
  error.value = null
  busy.value = true
  try {
    const { key } = await adminMountainsApi.uploadFile(file)
    const updated = await adminMountainsApi.setPhoto(props.mountain.id, key, reason.value || undefined)
    reason.value = ''
    emit('updated', updated)
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

async function remove() {
  error.value = null
  busy.value = true
  try {
    await adminMountainsApi.removePhoto(props.mountain.id, reason.value || undefined)
    reason.value = ''
    emit('updated', { ...props.mountain, photo_url: null })
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div class="space-y-2">
    <div class="h-40 w-full max-w-xs overflow-hidden rounded border border-ink-900/10 bg-ink-900/5">
      <img
        v-if="mountain.photo_url"
        :src="mountain.photo_url"
        :alt="mountain.name.id"
        class="h-full w-full object-cover"
      />
      <p v-else class="flex h-full items-center justify-center px-2 text-center text-xs text-ink-500">
        {{ t('admin.photo_none') }}
      </p>
    </div>

    <input
      v-model="reason"
      type="text"
      :placeholder="t('admin.photo_reason_placeholder')"
      class="w-full max-w-xs rounded border border-ink-900/20 px-2 py-1 text-sm"
    />

    <div class="flex items-center gap-2">
      <label class="inline-flex cursor-pointer items-center gap-1 rounded border border-ink-900/20 px-3 py-1.5 text-xs hover:bg-ink-900/5" :class="{ 'pointer-events-none opacity-50': busy }">
        {{ mountain.photo_url ? t('admin.photo_replace') : t('photo.add') }}
        <input ref="fileInput" type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="busy" @change="pick" />
      </label>
      <button
        v-if="mountain.photo_url"
        type="button"
        class="rounded border border-red-500/40 px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 disabled:opacity-50"
        :disabled="busy"
        @click="remove"
      >
        {{ t('photo.remove') }}
      </button>
      <span v-if="busy" class="text-xs text-ink-500">{{ t('common.loading') }}</span>
    </div>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>
  </div>
</template>
