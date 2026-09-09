<script setup lang="ts">
/** 007 · Dialog — accessible modal, focus-trapped (reka), paper surface. */
import { DialogClose, DialogContent, DialogDescription, DialogOverlay, DialogPortal, DialogRoot, DialogTitle, DialogTrigger } from 'reka-ui'
import { cn } from './utils/cn'

defineProps<{ open?: boolean; title?: string; description?: string; class?: string }>()
const emit = defineEmits<{ 'update:open': [v: boolean] }>()
</script>

<template>
  <DialogRoot :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <DialogTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></DialogTrigger>
    <DialogPortal>
      <DialogOverlay class="fixed inset-0 z-50 bg-ink-900/40 data-[state=open]:animate-in" />
      <DialogContent
        :class="
          cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-lg -translate-x-1/2 -translate-y-1/2',
            'rounded-(--radius-card) border border-ink-900/10 bg-paper-raised p-6 shadow-[0_24px_64px_-24px_oklch(22%_0.012_250/0.35)] outline-none',
            $props.class,
          )
        "
      >
        <DialogTitle v-if="title" class="font-display text-lg font-bold text-ink-900">{{ title }}</DialogTitle>
        <DialogDescription v-if="description" class="mt-1 text-sm text-ink-600">{{ description }}</DialogDescription>
        <slot />
        <DialogClose v-if="$slots.footer" as-child>
          <slot name="footer" />
        </DialogClose>
      </DialogContent>
    </DialogPortal>
  </DialogRoot>
</template>
