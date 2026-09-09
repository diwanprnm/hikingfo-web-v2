<script setup lang="ts">
/** 007 · Textarea — Hum input silhouette, multi-line. */
import { useId } from 'vue'
import { cn } from './utils/cn'

defineProps<{ invalid?: boolean; class?: string }>()
const model = defineModel<string | null>({ default: '' })
const id = useId()
</script>

<template>
  <textarea
    :id="id"
    v-model="model"
    :aria-invalid="invalid ? 'true' : undefined"
    :class="
      cn(
        'w-full min-w-0 rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 py-2.5 text-sm',
        'placeholder:text-ink-400 disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-600',
        $props.class,
      )
    "
  />
</template>
