<script setup lang="ts">
/** 007 · Badge — mono-label chip voice (Hum), variant tints. */
import { cva } from 'class-variance-authority'
import { cn } from './utils/cn'

const badgeVariants = cva(
  'inline-flex items-center rounded-full px-2.5 py-1 font-label text-xs tabular-nums',
  {
    variants: {
      variant: {
        default: 'bg-paper-2 text-ink-700',
        brand: 'bg-brand-100 text-brand-800',
        mint: 'bg-mint/25 text-ink-900',
        coral: 'bg-coral/20 text-ink-900',
        outline: 'border border-ink-900/20 text-ink-700',
      },
    },
    defaultVariants: { variant: 'default' },
  },
)
defineProps<{ variant?: 'default' | 'brand' | 'mint' | 'coral' | 'outline'; class?: string }>()
</script>

<template>
  <span :class="cn(badgeVariants({ variant }), $props.class)">
    <slot />
  </span>
</template>
