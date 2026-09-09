<script setup lang="ts">
/** 007 · Input — same silhouette as the hand-rolled search input (Hum). */
import { useId } from 'vue'
import { cn } from './utils/cn'

defineProps<{
  invalid?: boolean
  state?: 'error' | 'success' | null
  class?: string
}>()

const model = defineModel<string | number | null>()
const id = useId()
defineExpose({ id })
</script>

<template>
  <input
    :id="id"
    v-model="model"
    :aria-invalid="invalid || state === 'error' ? 'true' : undefined"
    :data-state="state ?? undefined"
    :class="
      cn(
        'min-h-11 w-full min-w-0 rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 py-2 text-sm',
        'placeholder:text-ink-400 disabled:cursor-not-allowed disabled:opacity-50',
        'aria-[invalid=true]:border-red-600',
        state === 'success' && 'border-mint',
        $props.class,
      )
    "
  />
</template>
