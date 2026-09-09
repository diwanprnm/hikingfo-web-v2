<script setup lang="ts">
/**
 * MountainGalleryField (004 US3) — curated photo list for one mountain.
 * Upload via POST /uploads then POST photos{photo_key}; delete per photo.
 * Server writes admin_edit_log rows (photo_set/photo_remove), Principle II.
 */
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminMountainsApi, type AdminGalleryPhoto } from '../infrastructure/api'
import AlertDialog from '@/shared/ui/AlertDialog.vue'
import { toast } from '@/shared/ui/toast'

const props = defineProps<{ mountainId: string; photos: AdminGalleryPhoto[] }>()
const emit = defineEmits<{ refresh: [] }>()

const { t } = useI18n()

const busy = ref(false)
const error = ref<string | null>(null)
// 007 US2: in-app AlertDialog replaces window.confirm
const deleteTarget = ref<string | null>(null)

async function pick(e: Event) {
  const input = e.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return
  if (!file.type.startsWith('image/')) {
    error.value = t('photo.not_image', { name: file.name })
    return
  }
  error.value = null
  busy.value = true
  try {
    const { key } = await adminMountainsApi.uploadFile(file)
    await adminMountainsApi.addGalleryPhoto(props.mountainId, key)
    emitRefresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
  } finally {
    busy.value = false
  }
}

async function remove() {
  const photoId = deleteTarget.value
  if (!photoId) return
  deleteTarget.value = null
  error.value = null
  busy.value = true
  try {
    await adminMountainsApi.deleteGalleryPhoto(props.mountainId, photoId)
    toast(t('gallery.photo_deleted'), 'success')
    emitRefresh()
  } catch (err) {
    error.value = err instanceof Error ? err.message : String(err)
    toast(error.value, 'error')
  } finally {
    busy.value = false
  }
}

function emitRefresh() {
  emit('refresh')
}
</script>

<template>
  <div class="space-y-2">
    <p v-if="!photos.length" class="text-sm text-ink-500">{{ t('gallery.empty') }}</p>
    <ul v-else class="grid grid-cols-2 gap-2 sm:grid-cols-3">
      <li v-for="p in photos" :key="p.id" class="relative">
        <img
          v-if="p.photo_url"
          :src="p.photo_url"
          :alt="String(p.created_at).slice(0, 10)"
          class="h-28 w-full rounded border border-ink-900/10 object-cover"
        />
        <div v-else class="flex h-28 w-full items-center justify-center rounded border border-ink-900/10 bg-ink-900/5 p-2 text-center font-label text-xs text-ink-400">
          {{ t('gallery.unavailable') }}
        </div>
        <button
          type="button"
          class="absolute right-1 top-1 rounded bg-black/60 px-1.5 py-0.5 text-xs text-white hover:bg-red-600 disabled:opacity-50"
          :disabled="busy"
          :aria-label="t('gallery.delete')"
          @click="deleteTarget = p.id"
        >
          ✕
        </button>
      </li>
    </ul>

    <label class="inline-flex cursor-pointer items-center gap-1 rounded border border-ink-900/20 px-3 py-1.5 text-xs hover:bg-ink-900/5" :class="{ 'pointer-events-none opacity-50': busy }">
      {{ t('gallery.add') }}
      <input type="file" accept="image/jpeg,image/png,image/webp" class="hidden" :disabled="busy" @change="pick" />
    </label>
    <span v-if="busy" class="text-xs text-ink-500">{{ t('common.loading') }}</span>
    <p v-if="error" class="text-xs text-red-600">{{ error }}</p>

    <!-- 007 US2: photo-delete confirmation (replaces window.confirm) -->
    <AlertDialog
      :open="deleteTarget !== null"
      danger
      :title="t('gallery.delete')"
      :description="t('gallery.confirm_delete')"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      @update:open="(v: boolean) => { if (!v) deleteTarget = null }"
      @confirm="remove"
    />
  </div>
</template>
