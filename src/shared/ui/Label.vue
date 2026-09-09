<script setup lang="ts">
/** 007 · Label — pairs with Input/Textarea ids. */
import { cn } from './utils/cn'
defineProps<{ for?: string; class?: string }>()
</script>

<template>
  <label :for="$props.for" :class="cn('block text-sm font-semibold text-ink-700', $props.class)">
    <slot />
  </label>
</template>
