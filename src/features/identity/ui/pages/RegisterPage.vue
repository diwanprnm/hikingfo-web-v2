<script setup lang="ts">
import { useI18n } from 'vue-i18n'

// Placeholder scaffold (T003). Register page implementation lands in T025.
const { t } = useI18n()
</script>

<template>
  <section class="mx-auto max-w-md px-4 py-10">
    <h1 class="font-display text-2xl font-semibold">{{ t('auth.register') }}</h1>
  </section>
</template>
