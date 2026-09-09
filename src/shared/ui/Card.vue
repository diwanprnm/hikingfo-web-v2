<script setup lang="ts">
/** 007 · Card — reproduces the `.card` Hum silhouette (paper, 20px, soft shadow).
 *  `interactive` adds the lift-on-hover the grid cards used (US3: unchanged feel).
 *  `as` keeps native semantics for clickable/form cards (button/form → a11y intact, FR-004). */
import { cn } from './utils/cn'
defineProps<{ class?: string; interactive?: boolean; as?: 'div' | 'button' | 'form' }>()
</script>

<template>
  <component
    :is="as ?? 'div'"
    :class="cn('card', interactive && 'group cursor-pointer', $props.class)"
  >
    <slot />
  </component>
</template>
