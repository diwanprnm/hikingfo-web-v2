<script setup lang="ts">
/**
 * 003 — MountainPicker: type-ahead combobox over the catalogue trigram search.
 * Emits the selected mountain id ONLY (free text never binds — FR-003); region
 * + province on every row (FR-002); keyboard + touch (FR-004); error/retry and
 * no-match hints (FR-006). State machine: idle → typing → open → selected |
 * empty | error. Debounce ~200 ms, fires at ≥2 chars, default (alphabetical)
 * list when the input is empty (grill decision).
 */
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import type { MountainSummary } from '@/features/catalogue/domain/types'
import { useCatalogueStore } from '@/features/catalogue/application/store'

const model = defineModel<string>({ default: '' })

const props = withDefaults(defineProps<{
  initialLabel?: string
}>(), { initialLabel: '' })

const { t, locale } = useI18n()
const catalogue = useCatalogueStore()

const MAX_INPUT = 80
const MIN_CHARS = 2
const DEBOUNCE_MS = 200

const query = ref(props.initialLabel)
const items = ref<MountainSummary[]>([])
const open = ref(false)
const loading = ref(false)
const error = ref(false)
const activeIndex = ref(-1)
const selectedLabel = ref(props.initialLabel)

const inputEl = ref<HTMLInputElement | null>(null)
const listId = computed(() => `mp-list-${Math.random().toString(36).slice(2)}`)

function resolveName(name: { id: string; en: string }): string {
  const lang = locale.value as string
  if (lang === 'en' && name?.en) return name.en
  return name?.id || name?.en || ''
}

// Sort: exact (case-insensitive) name match first, then alphabetical by resolved name.
function sortRows(rows: MountainSummary[]): MountainSummary[] {
  const q = query.value.trim().toLowerCase()
  return [...rows].sort((a, b) => {
    const an = resolveName(a.name)
    const bn = resolveName(b.name)
    if (q) {
      const aExact = an.toLowerCase() === q || a.name.id.toLowerCase() === q || a.name.en?.toLowerCase() === q
      const bExact = bn.toLowerCase() === q || b.name.id.toLowerCase() === q || b.name.en?.toLowerCase() === q
      if (aExact !== bExact) return aExact ? -1 : 1
    }
    return an.localeCompare(bn)
  })
}

async function fetchSuggestions() {
  const q = query.value.trim()
  error.value = false
  if (q.length > 0 && q.length < MIN_CHARS) {
    items.value = []
    return
  }
  loading.value = true
  try {
    // empty query → default (alphabetical) list; the server orders by height,
    // so sortRows re-orders alphabetically when q is empty.
    items.value = sortRows(await catalogue.suggestMountains(q))
  } catch {
    items.value = []
    error.value = true
  } finally {
    loading.value = false
  }
}

let timer: ReturnType<typeof setTimeout> | null = null
function schedule() {
  if (timer) clearTimeout(timer)
  timer = setTimeout(fetchSuggestions, DEBOUNCE_MS)
}

// Reset selection whenever the typed text diverges from the chosen label.
watch(query, (v) => {
  if (model.value && v !== selectedLabel.value) {
    model.value = ''
    activeIndex.value = -1
  }
  if (!model.value || v !== selectedLabel.value) open.value = true
  schedule()
})

onBeforeUnmount(() => { if (timer) clearTimeout(timer) })

function onInput() {
  if (query.value.length > MAX_INPUT) query.value = query.value.slice(0, MAX_INPUT)
}

function pick(m: MountainSummary) {
  selectedLabel.value = resolveName(m.name)
  query.value = selectedLabel.value
  model.value = m.id
  open.value = false
  activeIndex.value = -1
}

function clear() {
  selectedLabel.value = ''
  query.value = ''
  model.value = ''
  items.value = []
  activeIndex.value = -1
  inputEl.value?.focus()
  open.value = true
}

function showList() {
  open.value = true
  if (!items.value.length && !loading.value) schedule()
}

// ---- keyboard ---------------------------------------------------------------

function onKeydown(e: KeyboardEvent) {
  if (!open.value && ['ArrowDown', 'ArrowUp', 'Enter'].includes(e.key)) {
    showList()
    return
  }
  switch (e.key) {
    case 'ArrowDown':
      e.preventDefault()
      if (items.value.length) activeIndex.value = (activeIndex.value + 1) % items.value.length
      break
    case 'ArrowUp':
      e.preventDefault()
      if (items.value.length) activeIndex.value = (activeIndex.value - 1 + items.value.length) % items.value.length
      break
    case 'Enter':
      if (activeIndex.value >= 0 && items.value[activeIndex.value]) {
        e.preventDefault()
        pick(items.value[activeIndex.value])
      }
      break
    case 'Escape':
      open.value = false
      activeIndex.value = -1
      break
  }
}

const activeDescendant = computed(() =>
  activeIndex.value >= 0 ? `${listId.value}-${activeIndex.value}` : undefined,
)
const expanded = computed(() => open.value && (items.value.length > 0 || loading.value))
const showNoMatch = computed(
  () => open.value && !loading.value && !error.value && query.value.trim().length >= MIN_CHARS && items.value.length === 0,
)
</script>

<template>
  <div class="relative">
    <div class="relative">
      <input
        ref="inputEl"
        v-model="query"
        type="text"
        role="combobox"
        :aria-label="t('partner.picker.browse_hint')"
        :aria-expanded="expanded"
        :aria-controls="listId"
        :aria-activedescendant="activeDescendant"
        aria-autocomplete="list"
        autocomplete="off"
        :maxlength="MAX_INPUT"
        :placeholder="t('partner.picker.placeholder')"
        class="min-h-11 w-full min-w-0 rounded-(--radius-input) border border-ink-900/15 bg-paper px-3 py-2.5 text-sm focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-brand-700"
        @input="onInput"
        @focus="showList"
        @keydown="onKeydown"
      />
      <button
        v-if="model || query"
        type="button"
        :aria-label="t('partner.picker.clear')"
        class="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full text-ink-400 hover:bg-ink-900/5 hover:text-ink-700"
        @click="clear"
      >
        ×
      </button>
    </div>

    <ul
      v-if="open"
      :id="listId"
      role="listbox"
      :aria-label="t('partner.picker.browse_hint')"
      class="absolute z-20 mt-1 max-h-72 w-full overflow-y-auto rounded-(--radius-card) border border-ink-900/10 bg-paper-raised py-1 shadow-[0_12px_32px_-16px_oklch(22%_0.012_250/0.12)]"
    >
      <li v-if="loading" class="px-3 py-2 text-sm text-ink-500" aria-live="polite">{{ t('common.loading') }}</li>

      <li v-if="error" class="px-3 py-2 text-sm text-red-600" aria-live="assertive">
        {{ t('partner.picker.error') }}
        <button type="button" class="ml-1 underline" @click="fetchSuggestions">{{ t('partner.picker.retry') }}</button>
      </li>

      <li v-if="showNoMatch" class="px-3 py-2 text-sm text-ink-500" aria-live="polite">
        {{ t('partner.picker.no_match') }}
      </li>

      <li
        v-for="(m, i) in items"
        :id="`${listId}-${i}`"
        :key="m.id"
        role="option"
        :aria-selected="i === activeIndex"
        class="flex min-h-11 cursor-pointer flex-col justify-center px-3 py-2 text-sm hover:bg-brand-50"
        :class="{ 'bg-brand-50 ring-1 ring-inset ring-brand-700/30': i === activeIndex }"
        @mousedown.prevent="pick(m)"
        @mouseenter="activeIndex = i"
      >
        <span class="font-medium text-ink-900">{{ resolveName(m.name) }}</span>
        <span class="text-xs text-ink-500">{{ m.region }} · {{ m.province }}</span>
      </li>
    </ul>
  </div>
</template>
