<script setup lang="ts">
/**
 * 007 · AlertDialog — replaces browser window.confirm (US2, FR-005).
 * Usage: <AlertDialog v-model:open="x" title="…" @confirm="doThing">
 * body slot for extra detail. Escape / Cancel dismisses; Confirm resolves.
 */
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogOverlay,
  AlertDialogPortal,
  AlertDialogRoot,
  AlertDialogTitle,
  AlertDialogTrigger,
} from 'reka-ui'
import { cn } from './utils/cn'

defineProps<{
  open?: boolean
  title: string
  description?: string
  confirmLabel: string
  cancelLabel: string
  danger?: boolean
  class?: string
}>()
const emit = defineEmits<{ 'update:open': [v: boolean]; confirm: [] }>()
</script>

<template>
  <AlertDialogRoot :open="open" @update:open="(v: boolean) => emit('update:open', v)">
    <AlertDialogTrigger v-if="$slots.trigger" as-child><slot name="trigger" /></AlertDialogTrigger>
    <AlertDialogPortal>
      <AlertDialogOverlay class="fixed inset-0 z-50 bg-ink-900/40" />
      <AlertDialogContent
        :class="
          cn(
            'fixed left-1/2 top-1/2 z-50 w-[calc(100vw-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2',
            'rounded-(--radius-card) border border-ink-900/10 bg-paper-raised p-6 shadow-[0_24px_64px_-24px_oklch(22%_0.012_250/0.35)] outline-none',
            $props.class,
          )
        "
      >
        <AlertDialogTitle class="font-display text-lg font-bold text-ink-900">{{ title }}</AlertDialogTitle>
        <AlertDialogDescription v-if="description" class="mt-1 text-sm text-ink-600">{{ description }}</AlertDialogDescription>
        <div v-if="$slots.default" class="mt-3"><slot /></div>
        <div class="mt-5 flex flex-wrap-reverse justify-end gap-2">
          <AlertDialogCancel class="btn-affordance min-h-11 rounded-full border border-ink-900/20 px-4 text-sm font-semibold text-ink-900 hover:bg-ink-900/5">
            {{ cancelLabel }}
          </AlertDialogCancel>
          <button
            type="button"
            class="btn-affordance btn-push min-h-0 px-4 py-2 text-sm"
            :class="danger && '!bg-red-600'"
            @click="emit('update:open', false), emit('confirm')"
          >
            {{ confirmLabel }}
          </button>
        </div>
      </AlertDialogContent>
    </AlertDialogPortal>
  </AlertDialogRoot>
</template>
