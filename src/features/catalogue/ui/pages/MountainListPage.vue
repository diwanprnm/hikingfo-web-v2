<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { RouterLink, useRouter } from 'vue-router'
import { useCatalogueStore } from '../../application/store'
import Select from '@/shared/ui/Select.vue'
import Input from '@/shared/ui/Input.vue'
import Card from '@/shared/ui/Card.vue'

const { t, locale } = useI18n()
const router = useRouter()
const store = useCatalogueStore()

const query = ref('')
const region = ref('')
const difficulty = ref(0)

// per-card accent tint — Hum color-shift grid, one accent per surface
const tints = [
  'bg-brand-50',
  'bg-sky-cyan/10',
  'bg-brand-100',
  'bg-mint/20',
  'bg-brand-200/60',
]

function tintAt(i: number): string {
  return tints[i % tints.length]
}

// glyph mast — first letter of the mountain, the card's visual anchor
function glyphAt(name: { id: string; en: string }): string {
  const n = resolveName(name)
  return (n.trim()[0] || '·').toUpperCase()
}

onMounted(() => {
  store.fetchRegions()
  store.search()
})

function doSearch() {
  store.search({
    q: query.value || undefined,
    region: region.value || undefined,
    difficulty: difficulty.value || undefined,
    page: 1,
  })
}

function goDetail(slug: string) {
  router.push({ name: 'mountain-detail', params: { slug } })
}

function resolveName(name: { id: string; en: string }): string {
  const lang = locale.value as string
  if (lang === 'en' && name.en) return name.en
  return name.id || name.en
}
</script>

<template>
  <!--
    Hallmark · macrostructure: Marquee Hero + search overlay (studied DNA) · theme: Hum
    studied: yes · DNA-source: image (user reference) — structure only, Hum voice kept.
  -->
  <section>
    <!-- Hero band — flat blue tint (photo_url not populated in v1; honest, no fake photo) -->
    <div class="bg-brand-100">
      <div class="mx-auto max-w-6xl px-4 pb-24 pt-14 sm:pb-28 sm:pt-20">
        <p class="mono-label inline-block rounded-full bg-paper-raised px-3 py-1">
          {{ t('catalogue.hero_eyebrow') }}
        </p>
        <h1
          class="mt-5 max-w-2xl font-display text-4xl font-extrabold leading-tight tracking-tight text-ink-900 sm:text-5xl"
        >
          {{ t('catalogue.hero_title_a') }}
          <span class="hl">{{ t('catalogue.hero_title_b') }}</span>
        </h1>
        <p class="mt-4 max-w-xl text-base text-ink-600">
          {{ t('catalogue.hero_sub') }}
        </p>
        <p
          v-if="store.results"
          class="mt-6 font-label text-sm tabular-nums text-ink-700"
        >
          {{ store.results.total }} {{ t('catalogue.hero_stat') }}
        </p>
        <!-- Journey actions — above the fold, before search (006) -->
        <div class="mt-6 flex flex-wrap gap-3">
          <RouterLink
            :to="{ name: 'journeys' }"
            class="btn-push min-h-11 flex-1 whitespace-nowrap text-sm sm:flex-none"
          >
            {{ t('catalogue.journeys_cta_title') }}
          </RouterLink>
          <RouterLink
            :to="{ name: 'record-hike' }"
            class="btn-push min-h-11 flex-1 whitespace-nowrap text-sm sm:flex-none"
          >
            {{ t('catalogue.record_cta_title') }}
          </RouterLink>
        </div>
      </div>
    </div>

    <!-- Search overlay — the studied DNA's signature move: raised card over the hero edge -->
    <div class="mx-auto max-w-6xl px-4">
      <form
        class="card relative z-10 -mt-12 flex flex-col gap-3 p-4 sm:-mt-14 sm:flex-row sm:items-center sm:p-5"
        role="search"
        @submit.prevent="doSearch"
      >
        <Input
          v-model="query"
          type="search"
          class="sm:flex-1"
          :placeholder="t('catalogue.search_placeholder')"
          :aria-label="t('catalogue.search_placeholder')"
        />
        <Select
          v-model="region"
          class="w-full sm:w-44"
          :aria-label="t('catalogue.all_regions')"
          :placeholder="t('catalogue.all_regions')"
          :items="[{ value: '', label: t('catalogue.all_regions') }, ...store.regions.map((r) => ({ value: r, label: r }))]"
        />
        <Select
          :model-value="difficulty"
          class="w-full sm:w-44"
          :aria-label="t('catalogue.all_difficulty')"
          :items="[0, 1, 2, 3, 4, 5].map((d) => ({ value: d, label: d === 0 ? t('catalogue.all_difficulty') : String(d) }))"
          @update:model-value="(v: string | number) => (difficulty = Number(v))"
        />
        <button type="submit" class="btn-push text-sm sm:w-auto">
          {{ t('catalogue.search') }}
        </button>
      </form>
    </div>

    <!-- Destination grid -->
    <section class="mx-auto max-w-6xl px-4 py-12">
      <div class="flex items-baseline justify-between gap-4">
        <h2 class="font-display text-2xl font-extrabold tracking-tight text-ink-900">
          {{ t('nav.mountains') }}
        </h2>
        <p v-if="store.results" class="font-label text-xs tabular-nums text-ink-500">
          {{ store.results.total }}
        </p>
      </div>

      <div v-if="store.loading" class="mt-8 text-ink-500">{{ t('common.loading') }}</div>
      <div v-else-if="store.error" class="mt-8 text-red-600">{{ store.error }}</div>
      <div
        v-else-if="store.results"
        class="mt-8 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <Card
          v-for="(m, i) in store.results.items"
          :key="m.id"
          as="button"
          class="group overflow-hidden p-0 text-left transition-shadow"
          @click="goDetail(m.slug)"
        >
          <!-- photo panel — the studied DNA's image card; glyph fallback when
               photo_url not populated (honest, no fake photo) -->
          <div
            class="relative flex h-44 items-center justify-center"
            :class="tintAt(i)"
          >
            <img
              v-if="m.photo_url"
              :src="m.photo_url"
              :alt="resolveName(m.name)"
              class="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
            <span
              v-else
              aria-hidden="true"
              class="font-display text-5xl font-extrabold text-brand-700/70"
            >
              {{ glyphAt(m.name) }}
            </span>
            <span class="absolute right-3 top-3 rounded-full bg-paper-raised/90 px-2.5 py-1 font-label text-xs tabular-nums text-ink-700">
              {{ m.peak_height_m }} {{ t('catalogue.chip_height') }}
            </span>
          </div>
          <div class="p-5">
            <div class="flex items-start justify-between gap-3">
              <div class="min-w-0">
                <h3 class="font-display text-lg font-bold text-ink-900 group-hover:text-brand-700">
                  {{ resolveName(m.name) }}
                </h3>
                <p class="mt-0.5 truncate text-sm text-ink-600">{{ m.region }} · {{ m.province }}</p>
              </div>
            </div>
            <!-- info chips (studied DNA) — real data only -->
            <div class="mt-4 flex flex-wrap items-center gap-2">
              <span class="rounded-full bg-paper-2 px-2.5 py-1 font-label text-xs tabular-nums text-ink-700">
                {{ t('catalogue.chip_difficulty') }} {{ m.difficulty }}/5
              </span>
              <span
                v-for="n in m.difficulty"
                :key="n"
                aria-hidden="true"
                class="h-1.5 w-1.5 rounded-full"
                :class="n <= m.difficulty ? 'bg-brand-500' : 'bg-brand-200'"
              />
            </div>
          </div>
        </Card>
      </div>
      <p
        v-if="store.results && store.results.total === 0"
        class="mt-8 text-ink-500"
      >
        {{ t('catalogue.no_results') }}
      </p>
    </section>
  </section>
</template>
