<script setup lang="ts">
/**
 * T096 — admin user status editor + platform stats (GET /admin/stats).
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminStatsApi, adminUsersApi, type AdminUser } from '../infrastructure/api'

const { t } = useI18n()

const user = ref<AdminUser | null>(null)
const userId = ref('')
const error = ref('')
const message = ref('')
const busy = ref(false)

const stats = ref<{ mountains: { total: number; complete: number }; reports: Record<string, number> } | null>(null)

async function loadStats() {
  try {
    stats.value = await adminStatsApi.get()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}
onMounted(loadStats)

async function loadUser() {
  error.value = ''
  message.value = ''
  user.value = null
  try {
    user.value = await adminUsersApi.get(userId.value.trim())
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function setStatus(status: string) {
  if (!user.value) return
  busy.value = true
  error.value = ''
  message.value = ''
  try {
    user.value = await adminUsersApi.setStatus(user.value.id, status)
    message.value = status
    await loadStats()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="font-display text-xl font-semibold">{{ t('admin.users') }} · {{ t('admin.stats') }}</h2>

    <p v-if="error" class="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>

    <!-- Stats -->
    <div v-if="stats" class="mt-4 grid gap-3 sm:grid-cols-2">
      <div class="rounded border border-ink-900/10 bg-paper-raised p-3">
        <h3 class="text-xs font-semibold uppercase text-ink-500">{{ t('admin.mountains') }}</h3>
        <p class="mt-1 text-2xl font-semibold">{{ stats.mountains.total }}</p>
        <p class="text-xs text-ink-500">{{ t('admin.complete') }}: {{ stats.mountains.complete }}</p>
      </div>
      <div class="rounded border border-ink-900/10 bg-paper-raised p-3">
        <h3 class="text-xs font-semibold uppercase text-ink-500">{{ t('admin.moderation') }}</h3>
        <p v-for="(n, s) in stats.reports" :key="s" class="text-sm">
          {{ s }}: <span class="font-semibold">{{ n }}</span>
        </p>
      </div>
    </div>

    <!-- User status -->
    <form class="mt-6 flex gap-2" @submit.prevent="loadUser">
      <input v-model="userId" placeholder="user id (uuid)" class="w-72 min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5 font-mono text-sm" />
      <button type="submit" class="btn-push text-sm">
        {{ t('common.search') }}
      </button>
    </form>

    <div v-if="user" class="mt-4 rounded border border-ink-900/10 bg-paper-raised p-4 text-sm">
      <p class="font-semibold">{{ user.display_name }}</p>
      <p class="text-ink-600">{{ user.email }}</p>
      <p class="mt-1 text-xs uppercase text-ink-400">{{ user.role }} · {{ user.status }}</p>
      <p v-if="message" class="mt-2 text-xs text-green-700">{{ t('admin.status_set') }}: {{ message }}</p>

      <div v-if="user.role !== 'admin'" class="mt-3 flex gap-2">
        <button :disabled="busy || user.status === 'active'" class="min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2.5 py-1 text-xs disabled:opacity-40" @click="setStatus('active')">active</button>
        <button :disabled="busy || user.status === 'suspended'" class="rounded border border-orange-300 px-2.5 py-1 text-xs text-orange-700 disabled:opacity-40" @click="setStatus('suspended')">suspend</button>
        <button :disabled="busy || user.status === 'banned'" class="rounded border border-red-300 px-2.5 py-1 text-xs text-red-700 disabled:opacity-40" @click="setStatus('banned')">ban</button>
      </div>
      <p v-else class="mt-2 text-xs text-ink-400">{{ t('admin.admin_protected') }}</p>
    </div>
  </div>
</template>
