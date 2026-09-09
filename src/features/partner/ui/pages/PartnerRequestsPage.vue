<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { usePartnerStore } from '../../application/store'
import { partnerApi } from '../../infrastructure/api'
import Tabs from '@/shared/ui/Tabs.vue'
import type { FullProfile } from '../../domain/types'

const { t, locale } = useI18n()
const store = usePartnerStore()

const tab = ref<'received' | 'sent' | 'notices'>('received')
// Revealed contacts per request id — populated only from the gated endpoint.
const contacts = ref<Record<string, FullProfile>>({})

onMounted(() => { store.fetchRequests({ direction: 'received' }) })

async function reveal(requestId: string) {
  try {
    const c = await partnerApi.revealRequest(requestId)
    contacts.value[requestId] = { id: requestId, display_name: '', ...c }
  } catch { /* unmatched → server returns 403; keep hidden */ }
}

function switchTab(next: 'received' | 'sent' | 'notices') {
  tab.value = next
  if (next === 'notices') store.fetchNotices()
  else store.fetchRequests({ direction: next })
}

async function withdraw(id: string) {
  try {
    await store.withdrawNotice(id)
  } catch { /* best-effort; list refreshes from server truth */ }
}

function resolve(text: { id: string; en: string } | undefined | null): string {
  if (!text) return ''
  const lang = locale.value as string
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || ''
}

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  accepted: 'bg-green-100 text-green-800',
  declined: 'bg-red-100 text-red-800',
  expired: 'bg-ink-100 text-ink-500',
  withdrawn: 'bg-ink-100 text-ink-500',
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">{{ t('partner.requests') }}</h1>

    <!-- Tabs (007 US2/T018: one roving-arrow Tabs pattern, AC3) -->
    <Tabs
      class="mt-4"
      :model-value="tab"
      :items="[
        { value: 'received', label: t('partner.received') },
        { value: 'sent', label: t('partner.sent') },
        { value: 'notices', label: t('partner.notice.notices') },
      ]"
      @update:model-value="switchTab($event as 'received' | 'sent' | 'notices')"
    >
      <template #panel>
        <!-- Notices tab (003 T015): own notices + withdraw -->
        <template v-if="tab === 'notices'">
          <div v-if="store.notices.length" class="mt-4 space-y-3">
            <div v-for="n in store.notices" :key="n.id" class="flex items-start justify-between rounded-lg border border-ink-900/10 bg-paper-raised p-4">
              <div>
                <p class="font-semibold text-ink-900">{{ resolve(n.mountain?.name) }}</p>
                <p class="text-sm text-ink-600">{{ n.trip_start }} → {{ n.trip_end }}</p>
                <p v-if="n.note" class="mt-1 text-sm text-ink-500">{{ n.note }}</p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <span class="rounded-full px-2 py-0.5 text-xs font-medium" :class="statusColors[n.status] || 'bg-ink-100 text-ink-500'">
                  {{ t(`partner.status.${n.status}`) }}
                </span>
                <button
                  v-if="n.status === 'open'"
                  class="rounded border border-ink-900/15 px-3 py-1 text-xs text-ink-700 hover:bg-ink-900/5"
                  @click="withdraw(n.id)"
                >
                  {{ t('partner.withdraw') }}
                </button>
              </div>
            </div>
          </div>
          <p v-else class="mt-8 text-ink-500">{{ t('partner.notice.no_notices_yet') }}</p>
        </template>

        <!-- Requests list -->
        <div v-else-if="store.requests.length" class="mt-4 space-y-3">
          <div
            v-for="r in store.requests"
            :key="r.id"
            class="rounded-lg border border-ink-900/10 bg-paper-raised p-4"
          >
            <div class="flex items-start justify-between">
              <div>
                <p class="font-semibold text-ink-900">
                  {{ tab === 'received' ? r.from_user?.display_name : r.to_user?.display_name }}
                </p>
                <p class="text-sm text-ink-600">
                  {{ resolve(r.mountain?.name) }} · {{ r.trip_start }} → {{ r.trip_end }}
                </p>
                <p v-if="r.message" class="mt-1 text-sm text-ink-500">{{ r.message }}</p>
              </div>
              <span
                class="rounded-full px-2 py-0.5 text-xs font-medium"
                :class="statusColors[r.status] || 'bg-ink-100 text-ink-500'"
              >
                {{ t(`partner.status.${r.status}`) }}
              </span>
            </div>

            <!-- Matched: reveal contact channels (server re-verifies the match) -->
            <div v-if="r.status === 'accepted'" class="mt-3 rounded bg-green-50 p-3">
              <p class="text-xs font-semibold text-green-700">{{ t('partner.matched') }}</p>
              <ul v-if="contacts[r.id]" class="mt-1 space-y-0.5 text-sm text-ink-700">
                <li v-if="contacts[r.id]?.whatsapp">WhatsApp: <a class="underline" :href="`https://wa.me/${contacts[r.id]!.whatsapp!.replace(/[^0-9]/g, '')}`">{{ contacts[r.id]?.whatsapp }}</a></li>
                <li v-if="contacts[r.id]?.instagram">Instagram: {{ contacts[r.id]?.instagram }}</li>
                <li v-if="contacts[r.id]?.email">Email: <a class="underline" :href="`mailto:${contacts[r.id]?.email}`">{{ contacts[r.id]?.email }}</a></li>
                <li v-if="contacts[r.id]?.phone">Telepon: {{ contacts[r.id]?.phone }}</li>
              </ul>
              <button
                v-else
                class="mt-1 rounded border border-green-700/30 px-3 py-1 text-xs font-medium text-green-700 hover:bg-green-100"
                @click="reveal(r.id)"
              >
                {{ t('partner.show_contacts') }}
              </button>
            </div>

            <!-- Actions -->
            <div v-if="r.status === 'pending'" class="mt-3 flex gap-2">
              <template v-if="tab === 'received'">
                <button
                  class="rounded bg-green-600 px-3 py-1 text-xs text-white hover:bg-green-700"
                  @click="store.acceptRequest(r.id)"
                >
                  {{ t('partner.accept') }}
                </button>
                <button
                  class="rounded border border-ink-900/15 px-3 py-1 text-xs text-ink-700 hover:bg-ink-900/5"
                  @click="store.declineRequest(r.id)"
                >
                  {{ t('partner.decline') }}
                </button>
              </template>
              <template v-else>
                <button
                  class="rounded border border-ink-900/15 px-3 py-1 text-xs text-ink-700 hover:bg-ink-900/5"
                  @click="store.withdrawRequest(r.id)"
                >
                  {{ t('partner.withdraw') }}
                </button>
              </template>
            </div>
          </div>
        </div>
        <p v-else class="mt-8 text-ink-500">{{ t('common.empty') }}</p>
      </template>
    </Tabs>
  </section>
</template>
