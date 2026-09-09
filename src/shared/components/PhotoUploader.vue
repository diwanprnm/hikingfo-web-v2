<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const props = withDefaults(defineProps<{
  max?: number
}>(), { max: 10 })

const modelValue = defineModel<File[]>({ default: () => [] })

const previews = ref<string[]>([])
const error = ref<string | null>(null)

function onFileChange(e: Event) {
  const input = e.target as HTMLInputElement
  if (!input.files) return
  error.value = null

  const files = Array.from(input.files)
  const remaining = props.max - modelValue.value.length
  const toAdd = files.slice(0, remaining)

  if (files.length > remaining) {
    error.value = t('photo.max_reached', { max: props.max })
  }

  // Validate each file
  for (const file of toAdd) {
    if (file.size > 10 * 1024 * 1024) {
      error.value = t('photo.too_large', { name: file.name })
      continue
    }
    if (!file.type.startsWith('image/')) {
      error.value = t('photo.not_image', { name: file.name })
      continue
    }
    modelValue.value = [...modelValue.value, file]
    previews.value.push(URL.createObjectURL(file))
  }

  input.value = ''
}

function remove(index: number) {
  URL.revokeObjectURL(previews.value[index])
  previews.value.splice(index, 1)
  const files = [...modelValue.value]
  files.splice(index, 1)
  modelValue.value = files
}
</script>

<template>
  <div>
    <div class="flex flex-wrap gap-2">
      <div v-for="(preview, i) in previews" :key="i" class="relative h-20 w-20">
        <img :src="preview" :alt="t('photo.preview_n', { n: i + 1 })" class="h-full w-full rounded object-cover" />
        <button
          type="button"
          :aria-label="t('photo.remove')"
          class="absolute -top-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-red-500 text-xs text-white"
          @click="remove(i)"
        >
          ×
        </button>
      </div>
    </div>
    <label
      v-if="modelValue.length < max"
      class="mt-2 inline-flex cursor-pointer items-center gap-1 rounded border border-dashed border-ink-900/20 px-3 py-2 text-xs text-ink-500 hover:bg-ink-900/5"
    >
      📷 {{ t('photo.add') }} ({{ modelValue.length }}/{{ max }})
      <input type="file" accept="image/*" multiple class="hidden" @change="onFileChange" />
    </label>
    <p v-if="error" class="mt-1 text-xs text-red-600">{{ error }}</p>
  </div>
</template>
