<script setup lang="ts">
/**
 * 003 — Partner search: MountainPicker replaces the long <select> (T006),
 * per-field guidance replaces the silent no-op (T010), and a post-a-notice
 * form reuses the same picker (T014).
 */
import { ref, computed, nextTick } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePartnerStore } from '../../application/store'
import { partnerApi } from '../../infrastructure/api'
import MountainPicker from '../MountainPicker.vue'
import { toast } from '@/shared/ui/toast'

const { t, locale } = useI18n()
const store = usePartnerStore()

const mountainId = ref('')
const tripStart = ref('')
const tripEnd = ref('')
const sendingTo = ref<string | null>(null)
const sendError = ref<string | null>(null)

// Per-field guidance (T010): named, visible, cleared on next input.
const needMountain = ref(false)
const needStart = ref(false)
const needEnd = ref(false)

// Notice form (T014) — lives above results; shares the picker's data path.
const showNoticeForm = ref(false)
const noticeMountainId = ref('')
const noticeStart = ref('')
const noticeEnd = ref('')
const noticeNote = ref('')
const noticeBusy = ref(false)
const noticeError = ref('')
const noticeDone = ref(false)
const needNoticeMountain = ref(false)
const needNoticeDates = ref(false)
const noticeCardEl = ref<HTMLElement | null>(null)

async function openNoticeForm() {
  showNoticeForm.value = true
  noticeDone.value = false
  await nextTick()
  noticeCardEl.value?.scrollIntoView({ behavior: 'smooth', block: 'center' })
}

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return ''
  const lang = locale.value as string
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || ''
}

function doSearch() {
  needMountain.value = !mountainId.value
  needStart.value = !tripStart.value
  needEnd.value = !tripEnd.value
  if (needMountain.value || needStart.value || needEnd.value) return
  store.search({
    mountain_id: mountainId.value,
    trip_start: tripStart.value,
    trip_end: tripEnd.value,
  })
}

const noticeDateBad = computed(
  () => !!noticeStart.value && !!noticeEnd.value && noticeEnd.value < noticeStart.value,
)

async function submitNotice() {
  needNoticeMountain.value = !noticeMountainId.value
  needNoticeDates.value = !noticeStart.value || !noticeEnd.value
  noticeError.value = ''
  if (needNoticeMountain.value || needNoticeDates.value) return
  if (noticeDateBad.value) {
    noticeError.value = t('partner.notice.end_before_start')
    return
  }
  noticeBusy.value = true
  try {
    await store.createNotice({
      mountain_id: noticeMountainId.value,
      trip_start: noticeStart.value,
      trip_end: noticeEnd.value,
      note: noticeNote.value.trim() || undefined,
    })
    noticeDone.value = true
    showNoticeForm.value = false
    toast(t('partner.notice.posted'), 'success')
    noticeMountainId.value = ''
    noticeStart.value = ''
    noticeEnd.value = ''
    noticeNote.value = ''
  } catch (e: any) {
    noticeError.value = e.message ?? 'Failed'
    toast(noticeError.value, 'error')
  } finally {
    noticeBusy.value = false
  }
}

async function sendRequest(toUserId: string, noticeId: string) {
  sendingTo.value = toUserId
  sendError.value = null
  try {
    await partnerApi.sendRequest({
      to_user_id: toUserId,
      mountain_id: mountainId.value,
      trip_start: tripStart.value,
      trip_end: tripEnd.value,
      notice_id: noticeId,
    })
  } catch (e: any) {
    sendError.value = e.message
  } finally {
    sendingTo.value = null
  }
}
</script>

<template>
  <section class="mx-auto max-w-6xl px-4 py-10">
    <p class="mono-label">{{ t('partner.requests') }}</p>
    <h1 class="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink-900">{{ t('partner.search.title') }}</h1>

    <!-- Search form (003 T006: picker, not <select>) -->
    <form class="card mt-8 flex flex-wrap items-start gap-3 bg-paper-2 p-5" @submit.prevent="doSearch">
      <div class="w-full min-w-52 flex-1">
        <MountainPicker v-model="mountainId" @update:model-value="needMountain = false" />
        <p v-if="needMountain" class="mt-1 text-xs text-red-600" aria-live="assertive">{{ t('partner.search.need_mountain') }}</p>
      </div>
      <div>
        <input v-model="tripStart" type="date" :aria-invalid="needStart" class="min-h-11 rounded-(--radius-input) border border-ink-900/15 bg-paper-raised px-3 py-2.5 text-sm" @input="needStart = false" />
        <p v-if="needStart" class="mt-1 text-xs text-red-600" aria-live="assertive">{{ t('partner.search.need_start') }}</p>
      </div>
      <div>
        <input v-model="tripEnd" type="date" :aria-invalid="needEnd" class="min-h-11 rounded-(--radius-input) border border-ink-900/15 bg-paper-raised px-3 py-2.5 text-sm" @input="needEnd = false" />
        <p v-if="needEnd" class="mt-1 text-xs text-red-600" aria-live="assertive">{{ t('partner.search.need_end') }}</p>
      </div>
      <button type="submit" class="btn-push min-h-11 text-sm">
        {{ t('common.search') }}
      </button>
    </form>

    <!-- Post-a-notice (003 T014) -->
    <div ref="noticeCardEl" class="card mt-6 bg-paper-2 p-5">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <p class="font-display font-bold text-ink-900">{{ t('partner.notice.post_title') }}</p>
        <span v-if="noticeDone" class="text-sm text-green-700">{{ t('partner.notice.posted') }}</span>
        <button v-if="!showNoticeForm" type="button" class="btn-push text-sm" @click="openNoticeForm">
          {{ t('partner.notice.post_cta') }}
        </button>
      </div>
      <form v-if="showNoticeForm" class="mt-4 space-y-3" @submit.prevent="submitNotice">
        <div>
          <MountainPicker v-model="noticeMountainId" @update:model-value="needNoticeMountain = false" />
          <p v-if="needNoticeMountain" class="mt-1 text-xs text-red-600" aria-live="assertive">{{ t('partner.search.need_mountain') }}</p>
        </div>
        <div class="flex flex-wrap items-start gap-3">
          <div>
            <label class="mono-label text-xs text-ink-500">{{ t('partner.notice.trip_dates') }}</label>
            <input v-model="noticeStart" type="date" class="mt-1 block min-h-11 rounded-(--radius-input) border border-ink-900/15 bg-paper-raised px-3 py-2.5 text-sm" @input="needNoticeDates = false" />
          </div>
          <div>
            <label class="mono-label text-xs text-ink-500">—</label>
            <input v-model="noticeEnd" type="date" class="mt-1 block min-h-11 rounded-(--radius-input) border border-ink-900/15 bg-paper-raised px-3 py-2.5 text-sm" @input="needNoticeDates = false" />
          </div>
        </div>
        <p v-if="needNoticeDates" class="text-xs text-red-600" aria-live="assertive">{{ t('partner.search.need_dates') }}</p>
        <p v-if="noticeDateBad" class="text-xs text-red-600">{{ t('partner.notice.end_before_start') }}</p>
        <textarea
          v-model="noticeNote"
          maxlength="280"
          rows="2"
          :placeholder="t('partner.notice.note')"
          class="w-full rounded-(--radius-input) border border-ink-900/15 bg-paper-raised px-3 py-2 text-sm"
        />
        <p v-if="noticeError" class="text-xs text-red-600">{{ noticeError }}</p>
        <div class="flex gap-2">
          <button type="submit" class="btn-push text-sm" :disabled="noticeBusy">{{ t('partner.notice.submit') }}</button>
          <button type="button" class="min-h-11 rounded-(--radius-input) border border-ink-900/15 px-4 text-sm" @click="showNoticeForm = false">{{ t('common.cancel') }}</button>
        </div>
      </form>
    </div>

    <!-- Results -->
    <div v-if="store.searchLoading" class="mt-10 text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="store.error" class="mt-10 text-red-600">{{ store.error }}</div>
    <div
      v-else-if="store.candidates.length"
      class="mt-10 grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
    >
      <div
        v-for="c in store.candidates"
        :key="c.user.id"
        class="card p-5"
      >
        <div class="flex items-center gap-3">
          <div class="h-11 w-11 shrink-0 rounded-full bg-sky-cyan/20" />
          <div class="min-w-0">
            <p class="font-display font-bold text-ink-900">{{ c.user.display_name }}</p>
            <p class="text-xs text-ink-500">
              {{ resolve(c.user.experience_level?.name) }}
              <span v-if="c.user.home_region"> · {{ c.user.home_region }}</span>
            </p>
          </div>
        </div>
        <p v-if="c.user.bio" class="mt-3 text-sm text-ink-600 line-clamp-2">{{ resolve(c.user.bio) }}</p>
        <button
          class="btn-push mt-4 w-full min-h-11 px-3 py-2 text-xs"
          :disabled="sendingTo === c.user.id"
          @click="sendRequest(c.user.id, c.notice_id)"
        >
          {{ sendingTo === c.user.id ? '...' : t('partner.request') }}
        </button>
      </div>
    </div>
    <!-- Empty state links to the notice form (003 T014 / FR-009) -->
    <div v-else-if="mountainId && tripStart" class="mt-10 text-ink-500">
      <p>{{ t('partner.notice.find_none') }}</p>
      <button class="mt-2 text-sm text-brand-700 hover:underline" @click="openNoticeForm">
        {{ t('partner.notice.post_cta') }}
      </button>
    </div>
    <p v-if="sendError" class="mt-2 text-sm text-red-600">{{ sendError }}</p>
  </section>
</template>
