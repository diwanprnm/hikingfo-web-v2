<script setup lang="ts">
/**
 * T095 — badge config editor: list all configs, upsert threshold/name.
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminBadgesApi, type AdminBadgeConfig } from '../infrastructure/api'

const { t } = useI18n()

const items = ref<AdminBadgeConfig[]>([])
const loading = ref(false)
const error = ref('')
const busy = ref(false)
const editing = ref<AdminBadgeConfig | null>(null)

const form = ref({
  key: '',
  threshold: 1,
  name_id: '',
  name_en: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await adminBadgesApi.list()).items ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

function startEdit(b: AdminBadgeConfig) {
  editing.value = b
  form.value = { key: b.key, threshold: b.threshold, name_id: b.name?.id ?? '', name_en: b.name?.en ?? '' }
}

function startCreate() {
  editing.value = null
  form.value = { key: '', threshold: 1, name_id: '', name_en: '' }
}

async function save() {
  busy.value = true
  error.value = ''
  try {
    await adminBadgesApi.upsert({
      key: form.value.key,
      threshold: form.value.threshold,
      name_id: form.value.name_id,
      name_en: form.value.name_en,
    })
    editing.value = null
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h2 class="font-display text-xl font-semibold">{{ t('admin.badges') }}</h2>
      <button class="btn-push text-sm" @click="startCreate">
        + {{ t('admin.badge_add') }}
      </button>
    </div>

    <p v-if="error" class="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    <p v-if="loading" class="mt-4 text-sm text-ink-500">{{ t('common.loading') }}</p>

    <form v-if="editing !== null || form.key !== ''" class="mt-6 space-y-3 rounded-lg border border-ink-900/10 bg-paper-raised p-4" @submit.prevent="save">
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="text-sm">
          Key
          <input v-model="form.key" required :disabled="editing !== null" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5 disabled:bg-ink-900/5" />
        </label>
        <label class="text-sm">
          {{ t('admin.threshold') }}
          <input v-model.number="form.threshold" type="number" min="1" required class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.name_id') }}
          <input v-model="form.name_id" required class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.name_en') }}
          <input v-model="form.name_en" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
      </div>
      <div class="flex gap-2">
        <button type="submit" :disabled="busy" class="btn-push text-sm disabled:opacity-50">
          {{ t('common.save') }}
        </button>
        <button type="button" class="min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-4 py-2 text-sm" @click="editing = null; form.key = ''">
          {{ t('common.cancel') }}
        </button>
      </div>
    </form>

    <div v-else class="mt-6 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-ink-900/10 text-xs uppercase text-ink-500">
          <tr>
            <th class="py-2 pr-4">Key</th>
            <th class="py-2 pr-4">{{ t('admin.threshold') }}</th>
            <th class="py-2 pr-4">{{ t('admin.name_id') }}</th>
            <th class="py-2 pr-4">{{ t('admin.name_en') }}</th>
            <th class="py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="b in items" :key="b.id ?? b.key" class="border-b border-ink-900/5">
            <td class="py-2 pr-4 font-mono text-xs">{{ b.key }}</td>
            <td class="py-2 pr-4">{{ b.threshold }}</td>
            <td class="py-2 pr-4">{{ b.name?.id }}</td>
            <td class="py-2 pr-4">{{ b.name?.en }}</td>
            <td class="py-2 text-right">
              <button class="text-brand-700 hover:underline" @click="startEdit(b)">{{ t('common.edit') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>
