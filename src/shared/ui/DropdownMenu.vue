<script setup lang="ts">
/** 007 · DropdownMenu — reka menu, paper surface (admin actions, user menu). */
import {
  DropdownMenuContent,
  DropdownMenuPortal,
  DropdownMenuRoot,
  DropdownMenuTrigger,
} from 'reka-ui'
import { cn } from './utils/cn'

defineProps<{ open?: boolean; align?: 'start' | 'center' | 'end'; class?: string }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()
</script>

<template>
  <DropdownMenuRoot :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <DropdownMenuTrigger as-child><slot name="trigger" /></DropdownMenuTrigger>
    <DropdownMenuPortal>
      <DropdownMenuContent
        :align="align ?? 'end'"
        :side-offset="6"
        :class="
          cn(
            'z-50 min-w-44 rounded-(--radius-input) border border-ink-900/10 bg-paper-raised p-1 outline-none',
            'shadow-[0_16px_40px_-16px_oklch(22%_0.012_250/0.25)]',
            $props.class,
          )
        "
      >
        <slot />
      </DropdownMenuContent>
    </DropdownMenuPortal>
  </DropdownMenuRoot>
</template>
