<script setup lang="ts">
/**
 * 007 · Select — accessible listbox replacing native <select> (FR-004).
 * Keyboard: Enter/Space/arrows/type-ahead via reka Select; Escape closes
 * keeping the previous value (US1 AC1).
 */
import {
  SelectContent,
  SelectIcon,
  SelectItem,
  SelectItemIndicator,
  SelectItemText,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectViewport,
} from 'reka-ui'
import { cn } from './utils/cn'

defineProps<{
  modelValue: string | number
  items: { value: string | number; label: string }[]
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  class?: string
  contentClass?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string | number] }>()
</script>

<template>
  <SelectRoot
    :model-value="String(modelValue)"
    :disabled="disabled"
    @update:model-value="(v: string) => emit('update:modelValue', v)"
  >
    <SelectTrigger
      :aria-label="ariaLabel"
      :class="
        cn(
          'min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 py-2 text-left text-sm',
          'disabled:cursor-not-allowed disabled:opacity-50 [&>span]:truncate',
          $props.class,
        )
      "
    >
      <span class="block min-w-0 truncate">
        <slot name="value">{{ items.find((i) => String(i.value) === String(modelValue))?.label ?? placeholder }}</slot>
      </span>
      <SelectIcon class="text-ink-500">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </SelectIcon>
    </SelectTrigger>
    <SelectPortal>
      <SelectContent
        position="popper"
        :side-offset="6"
        :class="
          cn(
            'relative z-50 max-h-72 w-(reka-select-trigger-width) min-w-40 overflow-hidden rounded-(--radius-input) border border-ink-900/10 bg-paper-raised',
            'p-1 shadow-[0_16px_40px_-16px_oklch(22%_0.012_250/0.25)]',
            contentClass,
          )
        "
      >
        <SelectViewport class="p-0">
          <SelectItem
            v-for="it in items"
            :key="String(it.value)"
            :value="String(it.value)"
            class="relative flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-[8px] py-2 pr-8 pl-3 text-sm outline-none data-[highlighted]:bg-brand-100 data-[disabled]:pointer-events-none data-[disabled]:opacity-50"
          >
            <SelectItemIndicator class="absolute right-2 inline-flex">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
              </svg>
            </SelectItemIndicator>
            <SelectItemText>{{ it.label }}</SelectItemText>
          </SelectItem>
        </SelectViewport>
      </SelectContent>
    </SelectPortal>
  </SelectRoot>
</template>
