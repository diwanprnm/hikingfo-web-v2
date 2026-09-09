<script setup lang="ts">
/**
 * 007 · Combobox — searchable listbox for long option sets (R3: record-hike
 * mountain field). Reka Popover trigger + filtered listbox; keyboard nav via
 * arrow/Enter inside the filtered list, Escape closes keeping selection.
 */
import { ComboboxAnchor, ComboboxContent, ComboboxEmpty, ComboboxInput, ComboboxItem, ComboboxPortal, ComboboxRoot, ComboboxTrigger, ComboboxViewport } from 'reka-ui'
import { computed } from 'vue'
import { cn } from './utils/cn'

const props = defineProps<{
  modelValue: string
  items: { value: string; label: string; hint?: string }[]
  placeholder?: string
  disabled?: boolean
  ariaLabel?: string
  class?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const open = defineModel<boolean>('open', { default: false })
const search = defineModel<string>('search', { default: '' })

const filtered = computed(() => {
  const q = search.value.trim().toLowerCase()
  if (!q) return props.items
  return props.items.filter((i) => i.label.toLowerCase().includes(q) || (i.hint ?? '').toLowerCase().includes(q))
})

const selectedLabel = computed(() => props.items.find((i) => i.value === props.modelValue)?.label ?? '')
</script>

<template>
  <ComboboxRoot
    v-model:open="open"
    :model-value="modelValue || undefined"
    :disabled="disabled"
    class="relative"
    @update:model-value="(v: string) => emit('update:modelValue', v)"
    @update:search-value="(v: string) => (search = v)"
  >
    <ComboboxAnchor as-child>
      <ComboboxTrigger
        :aria-label="ariaLabel"
        :class="
          cn(
            'min-h-11 w-full min-w-0 items-center justify-between gap-2 rounded-(--radius-input) border border-ink-900/15 bg-paper px-3.5 py-2 text-left text-sm',
            'disabled:cursor-not-allowed disabled:opacity-50',
            $props.class,
          )
        "
      >
        <span class="block min-w-0 truncate" :class="!selectedLabel && 'text-ink-400'">
          {{ selectedLabel || placeholder }}
        </span>
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="text-ink-500" aria-hidden="true">
          <path d="M6 9l6 6 6-6" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
        </svg>
      </ComboboxTrigger>
    </ComboboxAnchor>
    <ComboboxPortal>
      <ComboboxContent
        class="fixed z-50 max-h-80 w-(--reka-combobox-trigger-width) min-w-40 overflow-hidden rounded-(--radius-input) border border-ink-900/10 bg-paper-raised p-1 shadow-[0_16px_40px_-16px_oklch(22%_0.012_250/0.25)]"
        :side-offset="6"
        align="start"
      >
        <ComboboxInput
          class="min-h-11 w-full rounded-[8px] border-0 bg-transparent px-3 text-sm outline-none placeholder:text-ink-400"
          :placeholder="placeholder"
        />
        <ComboboxViewport class="max-h-60 overflow-y-auto">
          <ComboboxEmpty class="px-3 py-4 text-center text-sm text-ink-500">—</ComboboxEmpty>
          <ComboboxItem
            v-for="it in filtered"
            :key="it.value"
            :value="it.value"
            class="relative flex min-h-11 w-full cursor-pointer select-none items-center gap-2 rounded-[8px] py-2 pr-8 pl-3 text-sm outline-none data-[highlighted]:bg-brand-100"
          >
            <span class="min-w-0 flex-1 truncate">{{ it.label }}</span>
            <span v-if="it.hint" class="truncate font-label text-xs text-ink-500">{{ it.hint }}</span>
          </ComboboxItem>
        </ComboboxViewport>
      </ComboboxContent>
    </ComboboxPortal>
  </ComboboxRoot>
</template>
