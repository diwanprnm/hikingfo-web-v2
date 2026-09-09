<script setup lang="ts">
/**
 * T091 — admin mountain management: list, create, edit with per-field
 * provenance, revisions + rollback, delete.
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import {
  adminMountainsApi,
  type AdminMountain,
} from '../infrastructure/api'
import Select from '@/shared/ui/Select.vue'
import Button from '@/shared/ui/Button.vue'
import AlertDialog from '@/shared/ui/AlertDialog.vue'
import { toast } from '@/shared/ui/toast'

const { t } = useI18n()

// 007 US2: delete confirm via in-app AlertDialog (was window.confirm)
const deleteTarget = ref<AdminMountain | null>(null)

const items = ref<AdminMountain[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<AdminMountain | null>(null)
const creating = ref(false)
const busy = ref(false)

// Draft form model — editing works on a copy so cancel is trivial.
const form = ref({
  slug: '',
  name_id: '',
  name_en: '',
  location_id: '',
  location_en: '',
  region: 'Jawa',
  province: '',
  peak_height_m: 0,
  difficulty: 1,
  status: 'draft',
  loc_source: '',
  loc_reliability: 'official',
  reason: '',
})

async function load() {
  loading.value = true
  error.value = ''
  try {
    items.value = (await adminMountainsApi.list()).items ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

function startCreate() {
  editing.value = null
  creating.value = true
  form.value = {
    slug: '', name_id: '', name_en: '', location_id: '', location_en: '',
    region: 'Jawa', province: '', peak_height_m: 0, difficulty: 1,
    status: 'draft', loc_source: '', loc_reliability: 'official', reason: '',
  }
}

function startEdit(m: AdminMountain) {
  creating.value = false
  editing.value = m
  form.value = {
    slug: m.slug,
    name_id: m.name?.id ?? '',
    name_en: m.name?.en ?? '',
    location_id: m.location?.id ?? '',
    location_en: m.location?.en ?? '',
    region: m.region,
    province: m.province ?? '',
    peak_height_m: m.peak_height_m,
    difficulty: m.difficulty,
    status: m.status,
    loc_source: m.data_meta?.location?.source ?? '',
    loc_reliability: m.data_meta?.location?.reliability ?? 'official',
    reason: '',
  }
}

function cancel() {
  creating.value = false
  editing.value = null
}

async function save() {
  busy.value = true
  error.value = ''
  const body: Record<string, unknown> = {
    slug: form.value.slug,
    name: { id: form.value.name_id, en: form.value.name_en },
    location: { id: form.value.location_id, en: form.value.location_en },
    region: form.value.region,
    province: form.value.province,
    peak_height_m: form.value.peak_height_m,
    difficulty: form.value.difficulty,
    status: form.value.status,
    data_meta: {
      location: {
        source: form.value.loc_source,
        reliability: form.value.loc_reliability,
      },
    },
  }
  try {
    if (editing.value) {
      body.reason = form.value.reason
      await adminMountainsApi.update(editing.value.id, body)
    } else {
      await adminMountainsApi.create(body)
    }
    cancel()
    toast(t('admin.record_saved'), 'success')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

const revisions = ref<Array<{ ID: string; reason: string; created_at: string }>>([])
async function showRevisions(m: AdminMountain) {
  error.value = ''
  try {
    revisions.value = (await adminMountainsApi.revisions(m.id)).items ?? []
    editing.value = m
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  }
}

async function rollback(rev: string) {
  if (!editing.value) return
  busy.value = true
  try {
    await adminMountainsApi.rollback(editing.value.id, rev)
    revisions.value = []
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

async function doRemove() {
  const m = deleteTarget.value
  if (!m) return
  deleteTarget.value = null
  error.value = ''
  try {
    await adminMountainsApi.remove(m.id)
    toast(t('admin.mountain_deleted'), 'success')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    toast(error.value, 'error')
  }
}
</script>

<template>
  <div>
    <div class="flex items-center justify-between">
      <h2 class="font-display text-xl font-semibold">{{ t('admin.mountains') }}</h2>
      <Button class="text-sm" @click="startCreate">+ {{ t('admin.add_mountain') }}</Button>
    </div>

    <p v-if="error" class="mt-4 rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    <p v-if="loading" class="mt-4 text-sm text-ink-500">{{ t('common.loading') }}</p>

    <!-- Editor form -->
    <form v-if="creating || editing" class="mt-6 space-y-3 rounded-lg border border-ink-900/10 bg-paper-raised p-4" @submit.prevent="save">
      <div class="grid gap-3 sm:grid-cols-2">
        <label class="text-sm">
          Slug
          <input v-model="form.slug" required class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.status') }}
          <Select
            v-model="form.status"
            :aria-label="t('admin.status')"
            :items="[
              { value: 'draft', label: 'draft' },
              { value: 'published', label: 'published' },
              { value: 'hidden', label: 'hidden' },
            ]"
          />
        </label>
        <label class="text-sm">
          {{ t('admin.name_id') }}
          <input v-model="form.name_id" required class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.name_en') }}
          <input v-model="form.name_en" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.location_id') }}
          <input v-model="form.location_id" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.location_en') }}
          <input v-model="form.location_en" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.region') }}
          <Select
            v-model="form.region"
            :aria-label="t('admin.region')"
            :items="['Jawa', 'Sumatra', 'Bali & Nusa Tenggara', 'Kalimantan', 'Sulawesi', 'Maluku', 'Papua'].map((r) => ({ value: r, label: r }))"
          />
        </label>
        <label class="text-sm">
          {{ t('admin.province') }}
          <input v-model="form.province" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('admin.height') }}
          <input v-model.number="form.peak_height_m" type="number" min="0" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
        </label>
        <label class="text-sm">
          {{ t('catalogue.difficulty') }}
          <Select
            :model-value="form.difficulty"
            :aria-label="t('catalogue.difficulty')"
            :items="[1, 2, 3, 4, 5].map((d) => ({ value: d, label: `${d}/5` }))"
            @update:model-value="(v: string | number) => (form.difficulty = Number(v))"
          />
        </label>
      </div>

      <!-- Per-field provenance (location) -->
      <fieldset class="rounded border border-ink-900/10 p-3">
        <legend class="px-1 text-xs font-semibold uppercase text-ink-500">
          {{ t('admin.provenance') }} — {{ t('admin.location_id') }}
        </legend>
        <div class="grid gap-3 sm:grid-cols-2">
          <label class="text-sm">
            {{ t('common.source') }}
            <input v-model="form.loc_source" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
          </label>
          <label class="text-sm">
            {{ t('admin.reliability') }}
            <Select
              v-model="form.loc_reliability"
              :aria-label="t('admin.reliability')"
              :items="[
                { value: 'official', label: 'official' },
                { value: 'community', label: 'community' },
                { value: 'reported', label: 'reported' },
              ]"
            />
          </label>
        </div>
      </fieldset>

      <label v-if="editing" class="block text-sm">
        {{ t('admin.reason') }}
        <input v-model="form.reason" class="mt-1 w-full min-h-[44px] rounded-[var(--radius-input)] border border-ink-900/15 px-2 py-1.5" />
      </label>

      <div class="flex gap-2">
        <Button type="submit" class="text-sm" :loading="busy">{{ t('common.save') }}</Button>
        <Button variant="ghost" class="text-sm" @click="cancel">{{ t('common.cancel') }}</Button>
      </div>
    </form>

    <!-- List -->
    <div v-else class="mt-6 overflow-x-auto">
      <table class="w-full text-left text-sm">
        <thead class="border-b border-ink-900/10 text-xs uppercase text-ink-500">
          <tr>
            <th class="py-2 pr-4">Slug</th>
            <th class="py-2 pr-4">{{ t('admin.name_id') }}</th>
            <th class="py-2 pr-4">{{ t('admin.region') }}</th>
            <th class="py-2 pr-4">{{ t('admin.height') }}</th>
            <th class="py-2 pr-4">{{ t('admin.status') }}</th>
            <th class="py-2" />
          </tr>
        </thead>
        <tbody>
          <tr v-for="m in items" :key="m.id" class="border-b border-ink-900/5">
            <td class="py-2 pr-4 font-mono text-xs">{{ m.slug }}</td>
            <td class="py-2 pr-4">{{ m.name?.id }}</td>
            <td class="py-2 pr-4">{{ m.region }}</td>
            <td class="py-2 pr-4">{{ m.peak_height_m }}m</td>
            <td class="py-2 pr-4">
              <span class="rounded px-1.5 py-0.5 text-xs" :class="m.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-ink-900/10 text-ink-600'">
                {{ m.status }}
              </span>
            </td>
            <td class="py-2 text-right">
              <RouterLink :to="{ name: 'admin-mountain-edit', params: { id: m.id } }" class="text-brand-700 hover:underline">{{ t('admin.edit') }}</RouterLink>
              <span class="mx-1 text-ink-300">·</span>
              <button class="text-ink-600 hover:underline" @click="startEdit(m)">{{ t('common.edit') }}</button>
              <span class="mx-1 text-ink-300">·</span>
              <button class="text-ink-600 hover:underline" @click="showRevisions(m)">{{ t('admin.revisions') }}</button>
              <span class="mx-1 text-ink-300">·</span>
              <button class="text-red-600 hover:underline" @click="deleteTarget = m">{{ t('common.delete') }}</button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Revisions -->
    <div v-if="editing && revisions.length" class="mt-4 rounded border border-ink-900/10 p-3">
      <h3 class="text-sm font-semibold">{{ t('admin.revisions') }}</h3>
      <ul class="mt-2 space-y-1 text-sm">
        <li v-for="r in revisions" :key="r.ID" class="flex items-center justify-between">
          <span>{{ r.reason || '—' }} <span class="text-xs text-ink-400">{{ r.created_at }}</span></span>
          <button class="text-brand-700 hover:underline" @click="rollback(r.ID)">{{ t('admin.rollback') }}</button>
        </li>
      </ul>
    </div>

    <!-- 007 US2: delete confirmation (replaces window.confirm) -->
    <AlertDialog
      :open="deleteTarget !== null"
      danger
      :title="`${t('common.delete')} ${deleteTarget?.slug ?? ''}`"
      :description="t('admin.delete_mountain')"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      @update:open="(v: boolean) => { if (!v) deleteTarget = null }"
      @confirm="doRemove"
    />
  </div>
</template>
