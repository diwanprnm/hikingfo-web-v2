<script setup lang="ts">
/** 007 · Checkbox — reka Checkbox, Hum-styled. */
import { CheckboxIndicator, CheckboxRoot } from 'reka-ui'
import { cn } from './utils/cn'

const props = defineProps<{
  modelValue?: boolean | 'indeterminate'
  disabled?: boolean
  class?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: boolean | 'indeterminate'] }>()
</script>

<template>
  <CheckboxRoot
    :model-value="props.modelValue"
    :disabled="props.disabled"
    :class="
      cn(
        'flex h-5 w-5 shrink-0 cursor-pointer items-center justify-center rounded-[5px] border border-ink-900/25 bg-paper',
        'data-[state=checked]:border-brand-600 data-[state=checked]:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-50',
        $props.class,
      )
    "
    @update:model-value="(v: boolean | 'indeterminate') => emit('update:modelValue', v)"
  >
    <CheckboxIndicator class="text-paper-raised">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 13l4 4L19 7" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </CheckboxIndicator>
  </CheckboxRoot>
</template>
