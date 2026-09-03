<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute } from 'vue-router'

import { useLocaleToggle } from '@/shared/i18n/useLocaleToggle'

defineProps<{
  navItems: { label: string; to: Record<string, unknown> }[]
}>()

const { t } = useI18n()
const route = useRoute()
const { locale, toggle } = useLocaleToggle()
</script>

<template>
  <header class="sticky top-0 z-30 border-b border-ink-900/10 bg-paper/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
      <RouterLink to="/" class="flex items-center gap-2 font-display text-lg font-semibold text-brand-700">
        <span class="inline-block h-5 w-5 rounded bg-brand-600" aria-hidden="true" />
        {{ t('app.name') }}
      </RouterLink>

      <nav class="ml-4 flex items-center gap-1" aria-label="Primary">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="rounded px-3 py-1.5 text-sm font-medium transition-colors"
          :class="route.name === item.to.name ? 'bg-brand-100 text-brand-800' : 'text-ink-600 hover:bg-paper-raised'"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="rounded border border-ink-900/15 px-2.5 py-1 text-xs font-semibold text-ink-600 transition-colors hover:bg-paper-raised"
          @click="toggle"
        >
          {{ locale === 'id' ? 'EN' : 'ID' }}
        </button>
        <RouterLink
          to="/auth/login"
          class="rounded bg-brand-600 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-brand-700"
        >
          {{ t('auth.login') }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
