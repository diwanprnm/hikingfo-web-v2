<script setup lang="ts">
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
</script>

<template>
  <!-- Ft5 statement footer: one warm sentence, muted meta beneath -->
  <footer class="border-t border-ink-900/10 bg-paper-2">
    <div class="mx-auto max-w-6xl px-4 py-10">
      <p class="font-display text-xl font-bold tracking-tight text-ink-900 sm:text-2xl">
        {{ t('app.tagline') }}
      </p>
      <div class="mt-4 flex flex-col gap-1 text-sm text-ink-500 sm:flex-row sm:items-center sm:justify-between">
        <p class="font-label text-xs uppercase tracking-wider">hikingfo</p>
        <p>© {{ new Date().getFullYear() }}</p>
      </div>
    </div>
  </footer>
</template>
