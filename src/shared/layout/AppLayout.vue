<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterView } from 'vue-router'
import { useI18n } from 'vue-i18n'

import AppHeader from './AppHeader.vue'
import AppFooter from './AppFooter.vue'
import Toaster from '@/shared/ui/Toaster.vue'
import { useSessionStore } from '@/features/identity/application/session'

const { t } = useI18n()
const session = useSessionStore()

// Restore the session once so nav items reflect auth state on first paint
// (guards.ts bootstraps lazily, but only when entering an auth/admin zone).
onMounted(() => {
  if (!session.user && !session.loading) session.fetchUser()
})

const navItems = computed(() => {
  const items = [
    { label: t('nav.mountains'), to: { name: 'home' } },
    { label: t('nav.journeys'), to: { name: 'journeys' } },
  ]
  // FR-010a (003): Partners entry — auth-gated like the partner routes.
  if (session.isAuthenticated) items.push({ label: t('nav.partners'), to: { name: 'partner-search' } })
  return items
})
</script>

<template>
  <div class="flex min-h-screen flex-col">
    <AppHeader :nav-items="navItems" />
    <main class="flex-1">
      <RouterView />
    </main>
    <AppFooter />
    <!-- 007 US2: global toast outlet (R4) -->
    <Toaster />
  </div>
</template>
