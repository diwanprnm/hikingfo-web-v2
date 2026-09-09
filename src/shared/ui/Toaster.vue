<script setup lang="ts">
/** 007 · Toaster — mounted once in AppLayout; renders the shared toast queue. */
import { cn } from './utils/cn'
import { dismiss, toasts } from './toast'

function variantClasses(v: string) {
  if (v === 'error') return 'border-red-600/40 bg-red-50 text-red-900'
  if (v === 'info') return 'border-ink-900/15 bg-paper-raised text-ink-900'
  return 'border-mint/60 bg-paper-raised text-ink-900'
}
</script>

<template>
  <div
    class="pointer-events-none fixed bottom-4 right-4 z-[60] flex w-[calc(100vw-2rem)] max-w-sm flex-col items-stretch gap-2"
    aria-live="polite"
    aria-atomic="false"
  >
    <TransitionGroup name="toast">
      <button
        v-for="t in toasts.items"
        :key="t.id"
        type="button"
        :class="cn('pointer-events-auto rounded-(--radius-input) border p-3 text-left text-sm shadow-lg', variantClasses(t.variant))"
        @click="dismiss(t.id)"
      >
        {{ t.message }}
      </button>
    </TransitionGroup>
  </div>
</template>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(8px);
}
@media (prefers-reduced-motion: reduce) {
  .toast-enter-active,
  .toast-leave-active {
    transition-duration: 0.01ms;
  }
}
</style>
