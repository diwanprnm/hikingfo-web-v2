<script setup lang="ts">
import { onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAchievementStore } from '../../application/store'
import { nextBadgeThreshold } from '../../domain/types'

const { t, locale } = useI18n()
const store = useAchievementStore()

onMounted(() => { store.fetchBadges() })

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return ''
  const lang = locale.value as string
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || ''
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">{{ t('achievement.badges') }}</h1>

    <div v-if="store.loading" class="mt-6 text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="store.badges" class="mt-6">
      <!-- Experience level -->
      <div class="rounded-lg border border-ink-900/10 bg-paper-raised p-4">
        <h2 class="text-sm font-semibold text-ink-500">{{ t('achievement.experience_level') }}</h2>
        <p class="mt-1 text-lg font-bold text-ink-900">
          {{ resolve(store.badges.experience_level.name) }}
        </p>
        <p class="text-sm text-ink-500">
          {{ store.badges.distinct_mountains }} {{ t('achievement.mountains_hiked') }}
          <span v-if="nextBadgeThreshold(store.badges.distinct_mountains)">
            · {{ t('achievement.next_at') }} {{ nextBadgeThreshold(store.badges.distinct_mountains) }}
          </span>
        </p>
      </div>

      <!-- Badge grid -->
      <div class="mt-6 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div
          v-for="badge in store.badges.badges"
          :key="badge.key"
          class="rounded-lg border p-4 text-center"
          :class="badge.earned
            ? 'border-brand-300 bg-brand-50'
            : 'border-ink-900/10 bg-ink-900/5 opacity-60'"
        >
          <div class="text-3xl">{{ badge.icon_key || '🏅' }}</div>
          <p class="mt-2 font-semibold text-ink-900">{{ resolve(badge.name) }}</p>
          <p class="mt-1 text-xs text-ink-500">{{ resolve(badge.description) }}</p>
          <p class="mt-1 text-xs text-ink-400">≥ {{ badge.threshold }}</p>
          <span
            v-if="badge.earned"
            class="mt-2 inline-block rounded-full bg-coral px-2.5 py-0.5 text-xs font-semibold text-ink-900"
          >
            {{ t('achievement.earned') }}
          </span>
        </div>
      </div>
    </div>
  </section>
</template>
