<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { RouterLink, useRoute, useRouter } from 'vue-router'

import { useLocaleToggle } from '@/shared/i18n/useLocaleToggle'
import { useSessionStore } from '@/features/identity/application/session'

defineProps<{
  navItems: { label: string; to: Record<string, unknown> }[]
}>()

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { locale, toggle } = useLocaleToggle()
const session = useSessionStore()

// ponytail: initials-only avatar — MeView has no served avatar URL yet.
// Upgrade path: presigned avatar_url on /me, then <img :src> with this as fallback.
function initials(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')
}

async function onLogout() {
  await session.logout()
  router.push({ name: 'home' })
}
</script>

<template>
  <!-- N1b three-section nav: left links · wordmark · right cluster -->
  <header class="sticky top-0 z-30 border-b border-ink-900/10 bg-paper/90 backdrop-blur">
    <div class="mx-auto flex h-14 max-w-6xl items-center gap-4 px-4">
      <nav class="flex items-center gap-1" aria-label="Primary">
        <RouterLink
          v-for="item in navItems"
          :key="item.label"
          :to="item.to"
          class="rounded-full px-3 py-1.5 text-sm font-medium transition-colors"
          :class="route.name === item.to.name ? 'bg-paper-2 text-ink-900' : 'text-ink-600 hover:bg-paper-raised hover:text-ink-900'"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <RouterLink to="/" class="flex items-center gap-2 font-display text-lg font-extrabold tracking-tight text-ink-900">
        <span class="inline-block h-5 w-5 rounded-full bg-brand-500 shadow-[0_2px_0_0_var(--color-brand-800)]" aria-hidden="true" />
        {{ t('app.name') }}
      </RouterLink>

      <div class="ml-auto flex items-center gap-2">
        <button
          type="button"
          class="rounded-full border border-ink-900/15 px-2.5 py-1 font-label text-xs font-medium text-ink-600 transition-colors hover:bg-paper-raised hover:text-ink-900"
          @click="toggle"
        >
          {{ locale === 'id' ? 'EN' : 'ID' }}
        </button>

        <!-- 004 US4: signed-in → avatar → profile + logout; signed-out → Sign In -->
        <template v-if="session.isAuthenticated && session.user">
          <RouterLink
            :to="{ name: 'my-profile' }"
            class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 font-label text-xs font-bold text-white shadow-[0_2px_0_0_var(--color-brand-800)] transition-transform hover:scale-105"
            :title="session.user.display_name"
            :aria-label="t('header.open_profile')"
          >
            {{ initials(session.user.display_name) }}
          </RouterLink>
          <button
            type="button"
            class="rounded-full border border-ink-900/15 px-3.5 py-1.5 text-sm text-ink-700 transition-colors hover:bg-paper-raised hover:text-ink-900"
            @click="onLogout"
          >
            {{ t('header.logout') }}
          </button>
        </template>
        <RouterLink
          v-else
          to="/auth/login"
          class="btn-push px-3.5 py-1.5 text-sm"
        >
          {{ t('auth.login') }}
        </RouterLink>
      </div>
    </div>
  </header>
</template>
