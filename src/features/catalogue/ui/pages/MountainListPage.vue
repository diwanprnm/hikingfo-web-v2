<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Placeholder scaffold (T003). Full catalogue browse/search UI lands in T038.
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">{{ t('nav.mountains') }}</h1>
    <p class="mt-1 text-ink-600">{{ t('common.loading') }}</p>
  </section>
</template>
