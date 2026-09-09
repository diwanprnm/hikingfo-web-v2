<script setup lang="ts">
/** 007 · Separator — hairline ink rule. */
import { cn } from './utils/cn'
defineProps<{ orientation?: 'horizontal' | 'vertical'; class?: string }>()
</script>

<template>
  <div
    role="separator"
    :aria-orientation="orientation ?? 'horizontal'"
    :class="cn('bg-ink-900/10', orientation === 'vertical' ? 'h-full w-px' : 'h-px w-full', $props.class)"
  />
</template>
