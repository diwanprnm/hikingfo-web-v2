<script setup lang="ts">
/**
 * 007 · Button — shadcn-vue shaped button themed to Hum.
 * The `default` variant IS the .btn-push physics (identity, US3); variants add
 * voice options (ghost = outline, destructive = red) without new looks.
 * 8 states: default · hover · focus-visible (global ring) · active · disabled
 * · loading (spinner) · error · success via data-state.
 */
import { cva } from 'class-variance-authority'
import { cn } from './utils/cn'

const buttonVariants = cva(
  'btn-affordance inline-flex min-h-11 items-center justify-center gap-2 rounded-full font-semibold transition-all disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'btn-push',
        secondary: 'border border-ink-900/20 bg-paper text-ink-900 hover:bg-ink-900/5 active:translate-y-px',
        ghost: 'border border-ink-900/20 bg-transparent text-ink-900 hover:bg-ink-900/5 active:translate-y-px',
        destructive: 'btn-push bg-red-600',
        link: 'text-brand-700 underline-offset-4 hover:underline',
      },
      size: {
        default: '',
        sm: 'px-3 py-1.5 text-xs',
        lg: 'px-6 py-3 text-base',
        icon: 'px-0 w-11',
      },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  },
)

withDefaults(
  defineProps<{
    variant?: 'default' | 'secondary' | 'ghost' | 'destructive' | 'link'
    size?: 'default' | 'sm' | 'lg' | 'icon'
    loading?: boolean
    state?: 'error' | 'success' | null
    as?: string
    type?: 'button' | 'submit' | 'reset'
  }>(),
  { variant: 'default', size: 'default', as: 'button', type: 'button', state: null, loading: false },
)
</script>

<template>
  <component
    :is="as"
    :class="cn(buttonVariants({ variant, size }), loading && 'pointer-events-none opacity-70')"
    :type="as === 'button' ? type : undefined"
    :disabled="as === 'button' ? loading || undefined : undefined"
    :data-state="state ?? undefined"
    v-bind="$attrs"
  >
    <svg v-if="loading" class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-opacity="0.35" stroke-width="4" />
      <path d="M12 2a10 10 0 0 1 10 10" stroke="currentColor" stroke-width="4" stroke-linecap="round" />
    </svg>
    <slot />
  </component>
</template>

<style>
/* destructive tint without touching .btn-push base (token: red-600, edge darkened) */
.btn-push.bg-red-600 {
  box-shadow:
    0 4px 0 0 oklch(42% 0.18 25),
    0 6px 12px -3px oklch(57% 0.24 27 / 0.45);
}
/* success state — mint fill (verified/confirmed press) */
button.btn-push[data-state='success'] {
  background: var(--color-mint);
  color: var(--color-ink-900);
  box-shadow:
    0 4px 0 0 oklch(60% 0.14 150),
    0 6px 12px -3px oklch(80% 0.16 150 / 0.45);
}
</style>
