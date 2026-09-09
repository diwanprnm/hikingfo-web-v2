<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useJourneyStore } from '../../application/store'
import Card from '@/shared/ui/Card.vue'
import Input from '@/shared/ui/Input.vue'
import Button from '@/shared/ui/Button.vue'

const { t } = useI18n()
const router = useRouter()
const store = useJourneyStore()

const region = ref('')
const mountainId = ref('')

onMounted(() => {
  store.fetchFeed()
})

function doFilter() {
  store.fetchFeed({
    region: region.value || undefined,
    mountain_id: mountainId.value || undefined,
    page: 1,
  })
}

function goPost(id: string) {
  router.push({ name: 'journey-detail', params: { id } })
}

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return ''
  const lang = (useI18n().locale.value as string)
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || ''
}

// summary is structured content ({blocks:[...]}) — pull the first text run
function summaryText(s: unknown): string {
  if (!s) return ''
  const blocks = (s as { blocks?: { text?: string }[] }).blocks
  if (Array.isArray(blocks)) {
    for (const b of blocks) if (b?.text) return b.text
  }
  return ''
}
</script>

<template>
  <!-- Ecosystem-index rhythm: rail-titled bands, one rail per cut of the feed -->
  <section class="mx-auto max-w-6xl px-4 py-10">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="mono-label">{{ t('journey.new_post') }}</p>
        <h1 class="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">
          {{ t('nav.journeys') }}
        </h1>
      </div>
      <router-link
        :to="{ name: 'record-hike' }"
        class="btn-push text-sm"
      >
        {{ t('journey.record_hike') }}
      </router-link>
    </div>

    <!-- Filters -->
    <form class="mt-6 flex flex-wrap gap-3" @submit.prevent="doFilter">
      <Input
        v-model="mountainId"
        type="text"
        class="w-48 max-w-full"
        :placeholder="t('journey.filter_mountain')"
        :aria-label="t('journey.filter_mountain')"
      />
      <Input
        v-model="region"
        type="text"
        class="w-48 max-w-full"
        :placeholder="t('journey.filter_region')"
        :aria-label="t('journey.filter_region')"
      />
      <Button type="submit" class="text-sm">
        {{ t('common.search') }}
      </Button>
    </form>

    <!-- Feed -->
    <div v-if="store.feedLoading" class="mt-10 text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="store.feedErrorCode === 'unauthorized'" class="mt-10 space-y-3">
      <p class="text-ink-700">{{ t('journey.sign_in_to_view') }}</p>
      <router-link :to="{ name: 'login' }" class="btn-push text-sm">
        {{ t('auth.login') }}
      </router-link>
    </div>
    <div v-else-if="store.error" class="mt-10 text-red-600">{{ store.error }}</div>
    <div v-else-if="store.feedItems.length" class="mt-10 space-y-4">
      <Card
        v-for="item in store.feedItems"
        :key="item.id"
        as="button"
        class="w-full p-5 text-left"
        @click="goPost(item.id)"
      >
        <div class="flex min-w-0 flex-wrap items-start justify-between gap-2">
          <div class="min-w-0">
            <h3 class="font-display text-lg font-bold text-ink-900">{{ item.title }}</h3>
            <p class="mt-1 text-sm text-ink-600">
              {{ resolve(item.mountain?.name) }} · {{ item.mountain?.region }}
            </p>
          </div>
          <span class="font-label text-xs tabular-nums text-ink-500">{{ item.published_at?.slice(0, 10) }}</span>
        </div>
        <p v-if="summaryText(item.summary)" class="mt-2 text-sm text-ink-500 line-clamp-2">
          {{ summaryText(item.summary).slice(0, 160) }}
        </p>
        <p class="mt-2 text-xs text-ink-400">
          {{ t('journey.by') }} {{ item.author?.display_name }}
        </p>
      </Card>
    </div>
    <p v-else class="mt-10 text-ink-500">{{ t('common.empty') }}</p>
  </section>
</template>
