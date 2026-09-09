<script setup lang="ts">
/** 007 · Popover — reka Popover, paper-raised surface, 12px radius. */
import { PopoverAnchor, PopoverContent, PopoverPortal, PopoverRoot, PopoverTrigger } from 'reka-ui'
import { cn } from './utils/cn'

defineProps<{ open?: boolean; class?: string; align?: 'start' | 'center' | 'end' }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()
</script>

<template>
  <PopoverRoot :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <PopoverAnchor v-if="$slots.anchor"><slot name="anchor" /></PopoverAnchor>
    <PopoverTrigger v-else as-child><slot name="trigger" /></PopoverTrigger>
    <PopoverPortal>
      <PopoverContent
        :align="align ?? 'start'"
        :class="
          cn(
            'z-50 min-w-56 rounded-(--radius-input) border border-ink-900/10 bg-paper-raised p-2 shadow-[0_16px_40px_-16px_oklch(22%_0.012_250/0.25)] outline-none',
            $props.class,
          )
        "
        :side-offset="6"
      >
        <slot />
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
