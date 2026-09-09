<script setup lang="ts">
/**
 * Admin shell: sidebar navigation inside the main layout. Rendered above each
 * admin page's own content; route children live under /admin/*.
 */
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()
const route = useRoute()

const items = computed(() => [
  { label: t('admin.mountains'), to: { name: 'admin-mountains' } },
  { label: t('admin.moderation'), to: { name: 'admin-moderation' } },
  { label: t('admin.badges'), to: { name: 'admin-badges' } },
  { label: t('admin.users'), to: { name: 'admin-users' } },
  { label: t('admin.stats'), to: { name: 'admin-stats' } },
])

const isActive = (to: { name: string }) => route.name === to.name
</script>

<template>
  <div class="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-8 md:flex-row">
    <nav class="w-full shrink-0 md:w-48" aria-label="Admin">
      <h1 class="font-display text-lg font-semibold text-ink-900">
        {{ t('nav.admin') }}
      </h1>
      <ul class="mt-4 space-y-1">
        <li v-for="item in items" :key="item.to.name">
          <RouterLink
            :to="item.to"
            class="block rounded px-3 py-2 text-sm text-ink-700 hover:bg-ink-900/5"
            :class="isActive(item.to) ? 'bg-brand-300 text-ink-900' : ''"
          >
            {{ item.label }}
          </RouterLink>
        </li>
      </ul>
    </nav>
    <section class="min-w-0 flex-1">
      <RouterView />
    </section>
  </div>
</template>
