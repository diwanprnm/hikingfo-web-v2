<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Placeholder scaffold (T003). Full mountain profile UI lands in T039.
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold">{{ t('common.loading') }}</h1>
  </section>
</template>
