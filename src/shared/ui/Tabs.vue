<script setup lang="ts">
/**
 * 007 · Tabs — one accessible tab pattern for the whole app (US2 AC3).
 * items: [{ value, label }] — labels come from i18n at the call site.
 * Panels via the #panel slot receiving the active value, so page content
 * never moves into child components.
 */
import { TabsContent, TabsList, TabsRoot, TabsTrigger } from 'reka-ui'
import { useId } from 'vue'
import { cn } from './utils/cn'

defineProps<{
  modelValue: string
  items: { value: string; label: string }[]
  class?: string
}>()
const emit = defineEmits<{ 'update:modelValue': [v: string] }>()

const id = useId()
</script>

<template>
  <TabsRoot
    :model-value="modelValue"
    :default-value="modelValue"
    :class="cn('', $props.class)"
    @update:model-value="(v: string) => emit('update:modelValue', v)"
  >
    <TabsList class="inline-flex min-w-0 flex-wrap items-center gap-1 rounded-full bg-paper-2 p-1">
      <TabsTrigger
        v-for="it in items"
        :key="it.value"
        :value="it.value"
        :id="`${id}-${it.value}`"
        class="btn-affordance min-h-11 rounded-full px-4 py-2 font-label text-xs tabular-nums text-ink-600 outline-none data-[state=active]:bg-paper-raised data-[state=active]:text-ink-900 data-[state=active]:shadow-[0_2px_8px_-4px_oklch(22%_0.012_250/0.25)]"
      >
        {{ it.label }}
      </TabsTrigger>
    </TabsList>
    <TabsContent
      v-for="it in items"
      :key="it.value"
      :value="it.value"
      class="outline-none"
    >
      <slot name="panel" :value="it.value" />
    </TabsContent>
  </TabsRoot>
</template>
