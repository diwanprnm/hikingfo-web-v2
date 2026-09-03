<script setup lang="ts">
import { useI18n } from 'vue-i18n'
</script>

<template>
  <footer class="border-t border-ink-900/10 bg-paper-raised">
    <div class="mx-auto flex max-w-6xl flex-col gap-1 px-4 py-6 text-sm text-ink-400 sm:flex-row sm:items-center sm:justify-between">
      <p class="font-display font-semibold text-ink-600">{{ $t('app.name') }} · {{ $t('app.tagline') }}</p>
      <p>© {{ new Date().getFullYear() }}</p>
    </div>
  </footer>
</template>
