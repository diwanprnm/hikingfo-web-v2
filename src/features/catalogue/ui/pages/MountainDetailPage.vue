<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'
import { useCatalogueStore } from '../../application/store'
import { useJourneyStore } from '@/features/journey/application/store'
import MapMarkers from '../MapMarkers.vue'
import Select from '@/shared/ui/Select.vue'
import Textarea from '@/shared/ui/Textarea.vue'
import Button from '@/shared/ui/Button.vue'

const { t, locale } = useI18n()
const route = useRoute()
const store = useCatalogueStore()
const journey = useJourneyStore()

const slug = computed(() => route.params.slug as string)

// Gallery broken-image fallback (004 FR-002): presigned URLs can expire mid-view.
const brokenPhotos = ref<Set<string>>(new Set())
function photoFailed(id: string) {
  brokenPhotos.value = new Set(brokenPhotos.value).add(id)
}

// Report-error form state (FR-003)
const reportField = ref<string | null>(null)
const reportReason = ref('')
const reportDetail = ref('')
const reportSent = ref(false)
const reportError = ref<string | null>(null)

onMounted(() => {
  store.fetchProfile(slug.value)
  journey.fetchFeed({ mountain_id: route.query.mid as string } as any).catch(() => {})
})

onUnmounted(() => {
  store.clearProfile()
})

function fieldLabel(field: string): string {
  return t(`catalogue.fields.${field}`, field)
}

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return t('catalogue.not_available')
  const lang = (locale.value as string)
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || t('catalogue.not_available')
}

function metaFor(field: string) {
  return store.profile?.mountain.data_meta?.[field]
}

function openReport(field: string) {
  reportField.value = field
  reportReason.value = ''
  reportDetail.value = ''
  reportSent.value = false
  reportError.value = null
}

async function submitReport() {
  if (!reportField.value || !reportReason.value || !store.profile) return
  reportError.value = null
  try {
    await store.reportField(store.profile.mountain.id, reportField.value, reportReason.value, reportDetail.value)
    reportSent.value = true
  } catch (e: any) {
    reportError.value = e.message ?? 'Failed'
  }
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10">
    <div v-if="store.profileLoading" class="text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="store.error" class="text-red-600">{{ store.error }}</div>
    <template v-else-if="store.profile">
      <!-- Cover photo (002 FR-004): presigned photo_url, absent when null -->
      <img
        v-if="store.profile.mountain.photo_url"
        :src="store.profile.mountain.photo_url"
        :alt="resolve(store.profile.mountain.name)"
        class="mb-6 h-56 w-full rounded-lg object-cover md:h-72"
      />
      <!-- Header: name + stat strip (mono labels, tabular figures) -->
      <h1 class="font-display text-4xl font-extrabold tracking-tight text-ink-900">
        {{ resolve(store.profile.mountain.name) }}
      </h1>
      <p class="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-600">
        <span><span class="font-label text-xs tabular-nums">{{ store.profile.mountain.peak_height_m }}m</span></span>
        <span class="text-ink-300">·</span>
        <span>{{ store.profile.mountain.region }}</span>
        <span class="text-ink-300">·</span>
        <span>{{ store.profile.mountain.province }}</span>
        <span class="text-ink-300">·</span>
        <span>
          <span class="hl font-semibold">{{ t('catalogue.difficulty') }} {{ store.profile.mountain.difficulty }}/5</span>
        </span>
      </p>

      <!-- 004 Gallery (FR-001/FR-002/FR-003): all curated photos, placeholder
           when empty, per-image broken fallback when a presigned URL dies -->
      <div class="mt-8">
        <h2 class="font-display text-xl font-bold text-ink-900">{{ t('catalogue.gallery_title') }}</h2>
        <p v-if="!store.profile.photos?.length" class="mt-2 text-sm text-ink-500">
          {{ t('catalogue.gallery_empty') }}
        </p>
        <div v-else class="mt-4 grid grid-cols-2 gap-3 md:grid-cols-3">
          <template v-for="p in store.profile.photos" :key="p.id">
            <img
              v-if="p.photo_url && !brokenPhotos.has(p.id)"
              :src="p.photo_url"
              :alt="resolve(store.profile.mountain.name)"
              loading="lazy"
              class="card h-40 w-full rounded-lg object-cover"
              @error="photoFailed(p.id)"
            />
            <div v-else class="card flex h-40 w-full items-center justify-center p-2 text-center font-label text-xs text-ink-400">
              {{ t('catalogue.gallery_unavailable') }}
            </div>
          </template>
        </div>
      </div>

      <!-- Map: peak + basecamp markers (T039) -->
      <div class="mt-8">
        <MapMarkers :mountain="store.profile.mountain" :basecamps="store.profile.basecamps" />
      </div>

      <!-- Field cards: peak + location, each with provenance + report-error (FR-002/FR-003) -->
      <div class="mt-8 grid min-w-0 grid-cols-1 gap-4 md:grid-cols-2">
        <div
          v-for="field in (['peak_name', 'location'] as const)"
          :key="field"
          class="card p-5"
          :class="field === 'peak_name' ? 'bg-brand-50' : 'bg-sky-cyan/10'"
        >
          <div class="flex items-center justify-between gap-2">
            <h2 class="mono-label">{{ fieldLabel(field) }}</h2>
            <button
              class="text-xs text-ink-400 hover:text-coral"
              @click="openReport(field)"
            >
              {{ t('catalogue.report_error') }}
            </button>
          </div>
          <p class="mt-2 text-lg font-semibold text-ink-900">{{ resolve(store.profile.mountain[field]) }}</p>
          <!-- Per-field provenance: source + reliability + last updated -->
          <p v-if="metaFor(field)" class="mt-2 font-label text-xs text-ink-500">
            {{ t('common.source') }}: {{ metaFor(field)!.source }} · {{ metaFor(field)!.reliability }}
            <template v-if="metaFor(field)!.updated_at">
              · {{ t('common.lastUpdated') }}: {{ metaFor(field)!.updated_at!.slice(0, 10) }}
            </template>
          </p>
        </div>
      </div>

      <!-- Report-error form (FR-003) -->
      <div v-if="reportField" class="card mt-4 border border-amber-300 bg-amber-50 p-5">
        <p v-if="reportSent" class="text-sm font-medium text-green-700">{{ t('catalogue.report_thanks') }}</p>
        <template v-else>
          <h3 class="font-display font-bold text-ink-900">
            {{ t('catalogue.report_error') }} — {{ fieldLabel(reportField) }}
          </h3>
          <Select
            v-model="reportReason"
            class="mt-3 w-full max-w-sm"
            :placeholder="t('catalogue.report_reason')"
            :aria-label="t('catalogue.report_reason')"
            :items="[
              { value: '', label: t('catalogue.report_reason') },
              { value: 'false_info', label: t('catalogue.reason_false_info') },
              { value: 'other', label: t('catalogue.reason_other') },
            ]"
          />
          <Textarea v-model="reportDetail" :rows="3" class="mt-2 w-full bg-paper-raised" :placeholder="t('catalogue.report_detail')" />
          <p v-if="reportError" class="mt-1 text-sm text-red-600">{{ reportError }}</p>
          <div class="mt-3 flex gap-2">
            <Button size="sm" :disabled="!reportReason" @click="submitReport">
              {{ t('catalogue.report_submit') }}
            </Button>
            <Button size="sm" variant="ghost" @click="reportField = null">
              {{ t('common.cancel') }}
            </Button>
          </div>
        </template>
      </div>

      <!-- Routes (002 T019: always shown; empty state per FR-015/SC-003) -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-bold text-ink-900">{{ t('catalogue.routes') }}</h2>
        <p v-if="!store.profile.routes.length" class="mt-2 text-sm text-ink-500">{{ t('common.notYetAvailable') }}</p>
        <div v-else class="mt-4 space-y-3">
          <div
            v-for="r in store.profile.routes"
            :key="r.id"
            class="card p-5"
          >
            <p class="font-display font-bold text-ink-900">{{ resolve(r.name) }}</p>
            <p class="mt-1.5 font-label text-xs tabular-nums text-ink-600">
              {{ r.distance_km }}km · {{ r.duration_hours }}h · +{{ r.elevation_gain_m }}m
            </p>
            <p
              v-if="r.entry_requirements?.id"
              class="mt-2 text-sm text-ink-500"
            >
              {{ resolve(r.entry_requirements) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Basecamps (002 T023: coordless basecamp renders without map pin) -->
      <div class="mt-10">
        <h2 class="font-display text-xl font-bold text-ink-900">{{ t('catalogue.basecamps') }}</h2>
        <p v-if="!store.profile.basecamps.length" class="mt-2 text-sm text-ink-500">{{ t('common.notYetAvailable') }}</p>
        <div v-else class="mt-4 space-y-3">
          <div
            v-for="b in store.profile.basecamps"
            :key="b.id"
            class="card bg-mint/10 p-5"
          >
            <p class="font-display font-bold text-ink-900">{{ resolve(b.name) }}</p>
            <p v-if="b.facilities?.id" class="mt-1.5 text-sm text-ink-600">
              {{ resolve(b.facilities) }}
            </p>
            <p v-if="b.cost_estimate?.id" class="mt-1.5 font-label text-xs text-ink-500">
              {{ resolve(b.cost_estimate) }}
            </p>
          </div>
        </div>
      </div>

      <!-- Weather -->
      <div class="card mt-10 p-5">
        <h2 class="mono-label">{{ t('catalogue.weather') }}</h2>
        <div v-if="store.weatherLoading" class="mt-2 text-ink-400">{{ t('common.loading') }}</div>
        <div v-else-if="store.weather" class="mt-2">
          <p class="font-label text-xs text-ink-500">
            {{ t('catalogue.captured_at') }}: {{ store.weather.captured_at }}
            <span v-if="!store.weather.is_live" class="ml-2 text-coral">
              · {{ t('catalogue.not_live') }}
            </span>
          </p>
          <p class="mt-2 font-display text-2xl font-bold tabular-nums text-ink-900">
            {{ store.weather.data?.daily?.temperature_2m_max?.[0] }}°C /
            {{ store.weather.data?.daily?.temperature_2m_min?.[0] }}°C
          </p>
        </div>
        <p v-else class="mt-2 text-ink-400">{{ t('catalogue.not_available') }}</p>
      </div>
    </template>
  </section>
</template>
