<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Placeholder scaffold (T003). Profile page implementation lands in T025.
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <h1 class="font-display text-2xl font-semibold">{{ t('nav.mountains') }}</h1>
    <p class="mt-1 text-ink-600">{{ t('common.loading') }}</p>
  </section>
</template>
