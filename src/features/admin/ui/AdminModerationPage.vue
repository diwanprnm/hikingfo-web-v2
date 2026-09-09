<script setup lang="ts">
/**
 * T093 — moderation queue: list reports (status filter) and resolve them with
 * the action appropriate to the target type (contracts §9).
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { adminReportsApi, type AdminReport } from '../infrastructure/api'
import Select from '@/shared/ui/Select.vue'
import Button from '@/shared/ui/Button.vue'

const { t } = useI18n()

const items = ref<AdminReport[]>([])
const status = ref('open')
const loading = ref(false)
const error = ref('')
const busyId = ref('')

const actionsByTarget: Record<string, Array<{ value: string; label: string }>> = {
  journey_post: [
    { value: 'hide_content', label: 'hide_content' },
    { value: 'dismiss', label: 'dismiss' },
  ],
  hike_evidence: [
    { value: 'remove_evidence', label: 'remove_evidence' },
    { value: 'dismiss', label: 'dismiss' },
  ],
  mountain_field: [
    { value: 'edit_field', label: 'edit_field' },
    { value: 'dismiss', label: 'dismiss' },
  ],
  user_profile: [
    { value: 'dismiss', label: 'dismiss' },
  ],
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await adminReportsApi.list(status.value)).items ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function resolve(r: AdminReport, action: string) {
  busyId.value = r.id
  error.value = ''
  try {
    await adminReportsApi.resolve(r.id, action, action)
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busyId.value = ''
  }
}
</script>

<template>
  <div>
    <h2 class="font-display text-xl font-semibold">{{ t('admin.moderation') }}</h2>

    <div class="mt-4 flex gap-2">
      <Select
        v-model="status"
        class="text-sm"
        :aria-label="t('admin.status')"
        :items="[
          { value: 'open', label: 'open' },
          { value: 'under_review', label: 'under_review' },
          { value: 'resolved', label: 'resolved' },
          { value: 'dismissed', label: 'dismissed' },
          { value: 'all', label: 'all' },
        ]"
        @update:model-value="load"
      />
    </div>

    <p v-if="error" class="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    <p v-if="loading" class="mt-4 text-sm text-ink-500">{{ t('common.loading') }}</p>

    <ul v-if="items.length" class="mt-4 space-y-3">
      <li v-for="r in items" :key="r.id" class="rounded border border-ink-900/10 bg-paper-raised p-3 text-sm">
        <div class="flex flex-wrap items-center gap-2">
          <span class="rounded bg-ink-900/10 px-1.5 py-0.5 text-xs font-mono">{{ r.target_type }}</span>
          <span class="rounded bg-orange-100 px-1.5 py-0.5 text-xs text-orange-800">{{ r.reason }}</span>
          <span v-if="r.field_ref" class="font-mono text-xs text-ink-500">{{ r.field_ref }}</span>
          <span class="ml-auto text-xs text-ink-400">{{ r.created_at }}</span>
        </div>
        <p v-if="r.detail" class="mt-2 text-ink-700">{{ r.detail }}</p>
        <p class="mt-1 font-mono text-xs text-ink-400">{{ r.target_id }}</p>

        <div v-if="r.status === 'open'" class="mt-3 flex flex-wrap gap-2">
          <Button
            v-for="a in actionsByTarget[r.target_type] ?? []"
            :key="a.value"
            variant="ghost"
            size="sm"
            class="text-xs"
            :disabled="busyId === r.id"
            @click="resolve(r, a.value)"
          >
            {{ a.label }}
          </Button>
        </div>
        <p v-else class="mt-2 text-xs uppercase text-ink-400">{{ r.status }}</p>
      </li>
    </ul>
    <p v-else-if="!loading" class="mt-4 text-sm text-ink-500">{{ t('common.empty') }}</p>
  </div>
</template>
