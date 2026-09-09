<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useJourneyStore } from '../../application/store'
import { useCatalogueStore } from '@/features/catalogue/application/store'
import Card from '@/shared/ui/Card.vue'

const { t, locale } = useI18n()
const store = useJourneyStore()
const catalogue = useCatalogueStore()

// Mountain names resolve through the catalogue search cache (same source the
// record form uses) — the /me/hikes payload only carries ids.
onMounted(async () => {
  store.fetchMyHikes()
  if (!catalogue.results) await catalogue.search({ page: 1, page_size: 100 })
})

const names = computed(() => {
  const map: Record<string, string> = {}
  for (const m of catalogue.results?.items ?? []) {
    map[m.id] = locale.value === 'en' && m.name.en ? m.name.en : m.name.id || m.name.en
  }
  return map
})
</script>

<template>
  <section class="mx-auto max-w-3xl px-4 py-10">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <h1 class="font-display text-3xl font-extrabold tracking-tight text-ink-900">
        {{ t('journey.my_hikes') }}
      </h1>
      <router-link :to="{ name: 'record-hike' }" class="btn-push text-sm">
        {{ t('journey.record_hike') }}
      </router-link>
    </div>

    <div v-if="store.myHikesLoading" class="mt-10 text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="store.error && !store.myHikes.length" class="mt-10 text-red-600">{{ store.error }}</div>
    <div v-else-if="!store.myHikes.length" class="mt-10 space-y-3">
      <p class="text-ink-500">{{ t('journey.hikes_empty') }}</p>
      <router-link :to="{ name: 'record-hike' }" class="btn-push inline-block text-sm">
        {{ t('journey.record_hike') }}
      </router-link>
    </div>
    <div v-else class="mt-10 space-y-4">
      <Card v-for="h in store.myHikes" :key="h.id" class="p-5">
        <div class="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <h2 class="font-display text-lg font-bold text-ink-900">
              {{ names[h.mountain_id] || t('journey.mountain') }}
            </h2>
            <p class="mt-1 text-sm tabular-nums text-ink-500">{{ h.climb_date.slice(0, 10) }}</p>
          </div>
          <span
            class="rounded-full px-3 py-1 text-xs font-semibold"
            :class="h.status === 'verified' ? 'bg-brand-100 text-brand-800' : 'bg-ink-100 text-ink-600'"
          >
            {{ h.status === 'verified' ? t('journey.hike_verified') : t('journey.hike_unverified') }}
          </span>
        </div>
        <p v-if="h.status !== 'verified'" class="mt-2 text-xs text-ink-400">
          {{ t('journey.unverified_hint') }}
        </p>
      </Card>
    </div>
  </section>
</template>
