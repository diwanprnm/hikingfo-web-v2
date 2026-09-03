<script setup lang="ts">
import { computed } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'

const { t } = useI18n()

const navItems = computed(() => [
  { label: t('nav.mountains'), to: { name: 'home' } },
  { label: t('nav.journeys'), to: { name: 'journeys' } },
])
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :nav-items="navItems" />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
  </div>
</template>
