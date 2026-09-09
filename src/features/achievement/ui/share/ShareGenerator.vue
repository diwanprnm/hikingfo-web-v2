<script setup lang="ts">
/**
 * Share generator flow: pick hike + template + size → PNG download + caption.
 * T072: ShareGenerator.vue, T073: empty state
 */
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAchievementStore } from '../../application/store'
import { useJourneyStore } from '@/features/journey/application/store'
import { EXPORT_SIZES } from '@/shared/lib/canvasExport'
import { exportSvgToPng } from '@/shared/lib/canvasExport'
import { generateCaption } from './caption'
import TemplateOne from './TemplateOne.vue'
import TemplateTwo from './TemplateTwo.vue'
import TemplateThree from './TemplateThree.vue'

const { t } = useI18n()
const achievementStore = useAchievementStore()
const journeyStore = useJourneyStore()

const selectedHike = ref<any>(null)
const selectedTemplate = ref(1)
const selectedSize = ref(0)
const generating = ref(false)
const caption = ref('')
const showCaption = ref(false)

onMounted(() => {
  achievementStore.fetchBadges()
  journeyStore.fetchMyHikes()
})

const templates = [
  { id: 1, label: 'Hero Card' },
  { id: 2, label: 'Gradient Story' },
  { id: 3, label: 'Landscape' },
]

const hasHikes = computed(() => (journeyStore.myHikes?.length ?? 0) > 0)

function selectHike(hike: any) {
  selectedHike.value = hike
  caption.value = generateCaption({
    mountainName: hike.mountain?.name?.en || hike.mountain?.name?.id || 'Mountain',
    distinctCount: achievementStore.badges?.distinct_mountains ?? 0,
    badgeName: achievementStore.badges?.badges?.find(b => b.earned)?.name?.id,
    hikeDate: hike.climb_date,
  })
}

async function download() {
  const svgEl = document.querySelector('#share-preview svg') as SVGElement | null
  if (!svgEl) return
  const size = EXPORT_SIZES[selectedSize.value]
  generating.value = true
  try {
    await exportSvgToPng(svgEl, size.width, size.height, `hikingfo-${selectedHike.value?.mountain?.slug || 'share'}.png`)
  } finally {
    generating.value = false
  }
}

function copyCaption() {
  navigator.clipboard.writeText(caption.value)
}
</script>

<template>
  <section class="mx-auto max-w-4xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">{{ t('share.generator') }}</h1>

    <!-- Empty state (T073) -->
    <div v-if="!achievementStore.loading && !hasHikes" class="mt-8 rounded-lg border border-ink-900/10 bg-paper-raised p-8 text-center">
      <p class="text-lg text-ink-700">{{ t('share.empty_title') }}</p>
      <p class="mt-2 text-sm text-ink-500">{{ t('share.empty_hint') }}</p>
      <router-link
        :to="{ name: 'record-hike' }"
        class="mt-4 inline-block btn-push text-sm"
      >
        {{ t('share.log_hike') }}
      </router-link>
    </div>

    <template v-else>
      <!-- Step 1: Pick hike -->
      <div class="mt-6">
        <h2 class="text-sm font-semibold text-ink-500">{{ t('share.pick_hike') }}</h2>
        <div class="mt-2 flex flex-wrap gap-2">
          <button
            v-for="hike in journeyStore.myHikes"
            :key="hike.id"
            class="rounded border px-3 py-1.5 text-sm"
            :class="selectedHike?.id === hike.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-900/15 text-ink-700'"
            @click="selectHike(hike)"
          >
            {{ hike.mountain?.name?.en || hike.mountain?.name?.id || '—' }}
            <span class="text-xs text-ink-400 ml-1">{{ hike.climb_date }}</span>
          </button>
        </div>
      </div>

      <!-- Step 2: Pick template -->
      <div class="mt-4">
        <h2 class="text-sm font-semibold text-ink-500">{{ t('share.pick_template') }}</h2>
        <div class="mt-2 flex gap-2">
          <button
            v-for="tpl in templates"
            :key="tpl.id"
            class="rounded border px-3 py-1.5 text-sm"
            :class="selectedTemplate === tpl.id ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-900/15 text-ink-700'"
            @click="selectedTemplate = tpl.id"
          >
            {{ tpl.label }}
          </button>
        </div>
      </div>

      <!-- Step 3: Pick size -->
      <div class="mt-4">
        <h2 class="text-sm font-semibold text-ink-500">{{ t('share.pick_size') }}</h2>
        <div class="mt-2 flex gap-2">
          <button
            v-for="(size, i) in EXPORT_SIZES"
            :key="i"
            class="rounded border px-3 py-1.5 text-sm"
            :class="selectedSize === i ? 'border-brand-600 bg-brand-50 text-brand-700' : 'border-ink-900/15 text-ink-700'"
            @click="selectedSize = i"
          >
            {{ size.label }} ({{ size.width }}×{{ size.height }})
          </button>
        </div>
      </div>

      <!-- Preview -->
      <div v-if="selectedHike" id="share-preview" class="mt-6 flex justify-center">
        <div class="w-80 overflow-hidden rounded-lg border border-ink-900/10">
          <TemplateOne
            v-if="selectedTemplate === 1"
            :mountain-name="selectedHike.mountain?.name?.en || selectedHike.mountain?.name?.id || ''"
            :badge-name="achievementStore.badges?.badges?.find(b => b.earned)?.name?.id"
            :distinct-count="achievementStore.badges?.distinct_mountains ?? 0"
            :hike-date="selectedHike.climb_date"
          />
          <TemplateTwo
            v-else-if="selectedTemplate === 2"
            :mountain-name="selectedHike.mountain?.name?.en || selectedHike.mountain?.name?.id || ''"
            :badge-name="achievementStore.badges?.badges?.find(b => b.earned)?.name?.id"
            :distinct-count="achievementStore.badges?.distinct_mountains ?? 0"
            :hike-date="selectedHike.climb_date"
          />
          <TemplateThree
            v-else
            :mountain-name="selectedHike.mountain?.name?.en || selectedHike.mountain?.name?.id || ''"
            :badge-name="achievementStore.badges?.badges?.find(b => b.earned)?.name?.id"
            :distinct-count="achievementStore.badges?.distinct_mountains ?? 0"
            :hike-date="selectedHike.climb_date"
          />
        </div>
      </div>

      <!-- Actions -->
      <div v-if="selectedHike" class="mt-4 flex gap-3">
        <button
          :disabled="generating"
          class="btn-push text-sm disabled:opacity-50"
          @click="download"
        >
          {{ generating ? t('common.loading') : t('share.download_png') }}
        </button>
        <button
          class="rounded border border-ink-900/15 px-4 py-2 text-sm text-ink-700 hover:bg-ink-900/5"
          @click="showCaption = !showCaption"
        >
          {{ t('share.show_caption') }}
        </button>
      </div>

      <!-- Caption -->
      <div v-if="showCaption && caption" class="mt-4 rounded-lg border border-ink-900/10 bg-paper-raised p-4">
        <div class="flex items-start justify-between">
          <pre class="whitespace-pre-wrap text-sm text-ink-700">{{ caption }}</pre>
          <button class="ml-2 text-xs text-brand-600 hover:underline" @click="copyCaption">
            {{ t('share.copy') }}
          </button>
        </div>
      </div>
    </template>
  </section>
</template>
