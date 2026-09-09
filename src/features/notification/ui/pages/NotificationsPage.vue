<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { get, post } from '@/shared/http/client'

const { t } = useI18n()

interface Notification {
  id: string
  type: string
  payload: Record<string, any>
  read_at: string | null
  created_at: string
}

const notifications = ref<Notification[]>([])
const total = ref(0)
const loading = ref(false)

const typeLabels: Record<string, { id: string; en: string }> = {
  badge_earned: { id: 'Lencana diraih', en: 'Badge earned' },
  partner_request_received: { id: 'Permintaan partner diterima', en: 'Partner request received' },
  partner_request_accepted: { id: 'Permintaan partner diterima', en: 'Partner request accepted' },
  moderation_outcome: { id: 'Hasil moderasi', en: 'Moderation outcome' },
}

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return ''
  const lang = (useI18n().locale.value as string)
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || ''
}

onMounted(async () => {
  loading.value = true
  try {
    const res = await get<{ items: Notification[]; total: number }>('/me/notifications', { page: 1, page_size: 50 })
    notifications.value = res.items
    total.value = res.total
  } catch { /* empty */ } finally {
    loading.value = false
  }
})

async function markRead(id: string) {
  try {
    await post(`/me/notifications/${id}/read`)
    const n = notifications.value.find(n => n.id === id)
    if (n) n.read_at = new Date().toISOString()
  } catch { /* empty */ }
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">{{ t('notification.cent') }}</h1>

    <div v-if="loading" class="mt-6 text-ink-500">{{ t('common.loading') }}</div>
    <div v-else-if="notifications.length" class="mt-6 space-y-2">
      <div
        v-for="n in notifications"
        :key="n.id"
        class="flex items-start justify-between rounded-lg border p-3"
        :class="n.read_at ? 'border-ink-900/10 bg-white' : 'border-brand-200 bg-brand-50'"
      >
        <div>
          <p class="text-sm font-medium text-ink-900">
            {{ resolve(typeLabels[n.type]) || n.type }}
          </p>
          <p class="mt-0.5 text-xs text-ink-500">{{ n.created_at?.slice(0, 16).replace('T', ' ') }}</p>
        </div>
        <button
          v-if="!n.read_at"
          class="text-xs text-brand-600 hover:underline"
          @click="markRead(n.id)"
        >
          ✓
        </button>
      </div>
    </div>
    <p v-else class="mt-6 text-ink-500">{{ t('notification.empty') }}</p>
  </section>
</template>
