<script setup lang="ts">
/**
 * 002 T013/T018/T022 — admin mountain edit page: cover photo (MountainPhotoField),
 * route editor, basecamp editor, edit-log trail. Every mutation carries an
 * optional reason (Principle II attribution; server logs it).
 */
import { onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import {
  adminMountainsApi,
  type AdminBasecamp,
  type AdminEditLogEntry,
  type AdminGalleryPhoto,
  type AdminMountain,
  type AdminRoute,
} from '../infrastructure/api'
import MountainPhotoField from './MountainPhotoField.vue'
import MountainGalleryField from './MountainGalleryField.vue'
import Input from '@/shared/ui/Input.vue'
import Checkbox from '@/shared/ui/Checkbox.vue'
import Label from '@/shared/ui/Label.vue'
import Button from '@/shared/ui/Button.vue'
import AlertDialog from '@/shared/ui/AlertDialog.vue'
import { toast } from '@/shared/ui/toast'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const id = String(route.params.id)

// 007 US2: in-app AlertDialogs replace window.confirm (route + basecamp delete)
const deleteRouteTarget = ref<AdminRoute | null>(null)
const deleteBcTarget = ref<AdminBasecamp | null>(null)

const mountain = ref<AdminMountain | null>(null)
const routes = ref<AdminRoute[]>([])
const basecamps = ref<AdminBasecamp[]>([])
const editLog = ref<AdminEditLogEntry[]>([])
const gallery = ref<AdminGalleryPhoto[]>([])
const loading = ref(true)
const error = ref('')
const busy = ref(false)

async function load() {
  loading.value = true
  error.value = ''
  try {
    const p = await adminMountainsApi.profile(id)
    mountain.value = p.mountain
    routes.value = p.routes ?? []
    basecamps.value = p.basecamps ?? []
    gallery.value = p.photos ?? []
    editLog.value = (await adminMountainsApi.editLog(id)).items ?? []
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
  } finally {
    loading.value = false
  }
}
onMounted(load)

async function refreshLog() {
  try {
    editLog.value = (await adminMountainsApi.editLog(id)).items ?? []
  } catch {
    /* non-fatal: list can go stale, reload fixes it */
  }
}

function onPhotoUpdated(m: AdminMountain) {
  mountain.value = m
  refreshLog()
}

// ---- routes (US2) ----------------------------------------------------------

const emptyRouteForm = () => ({
  id: '', name_id: '', name_en: '', distance_km: 0, duration_hours: 1,
  elevation_gain_m: 0, entry_id: '', entry_en: '', reason: '',
})
const showRouteForm = ref(false)
const routeEditing = ref(false)
const routeForm = ref(emptyRouteForm())
const routeError = ref('')

function startRouteCreate() {
  routeEditing.value = false
  routeForm.value = emptyRouteForm()
  routeError.value = ''
  showRouteForm.value = true
}

function startRouteEdit(r: AdminRoute) {
  routeEditing.value = true
  routeForm.value = {
    id: r.id,
    name_id: r.name?.id ?? '',
    name_en: r.name?.en ?? '',
    distance_km: r.distance_km,
    duration_hours: r.duration_hours,
    elevation_gain_m: r.elevation_gain_m,
    entry_id: r.entry_requirements?.id ?? '',
    entry_en: r.entry_requirements?.en ?? '',
    reason: '',
  }
  routeError.value = ''
  showRouteForm.value = true
}

// Client-side pre-validation mirrors server bounds (T017); the server remains
// the authority — its message is displayed on reject.
function validateRouteForm(f: ReturnType<typeof emptyRouteForm>): string | null {
  if (!f.name_id.trim()) return t('admin.route_name_id')
  if (f.distance_km < 0) return t('admin.route_distance')
  if (f.duration_hours <= 0) return t('admin.route_duration')
  if (f.elevation_gain_m < 0) return t('admin.route_elevation')
  return null
}

async function saveRoute() {
  const f = routeForm.value
  const bad = validateRouteForm(f)
  if (bad) {
    routeError.value = `${t('common.error')}: ${bad}`
    return
  }
  busy.value = true
  routeError.value = ''
  const body = {
    name: { id: f.name_id, en: f.name_en },
    distance_km: f.distance_km,
    duration_hours: f.duration_hours,
    elevation_gain_m: f.elevation_gain_m,
    entry_requirements: { id: f.entry_id, en: f.entry_en },
    reason: f.reason || undefined,
  }
  try {
    if (routeEditing.value && f.id) await adminMountainsApi.updateRoute(f.id, body)
    else await adminMountainsApi.addRoute(id, body)
    showRouteForm.value = false
    await load()
  } catch (e) {
    routeError.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

async function removeRoute() {
  const r = deleteRouteTarget.value
  if (!r) return
  deleteRouteTarget.value = null
  try {
    await adminMountainsApi.deleteRoute(r.id)
    toast(t('admin.record_saved'), 'success')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    toast(error.value, 'error')
  }
}

// ---- basecamps (US3) -------------------------------------------------------

const emptyBcForm = () => ({
  id: '', name_id: '', name_en: '', facilities_id: '', facilities_en: '',
  cost_id: '', cost_en: '', is_permit_point: false,
  latitude: '' as '' | number, longitude: '' as '' | number, reason: '',
})
const showBcForm = ref(false)
const bcEditing = ref(false)
const bcForm = ref(emptyBcForm())
const bcError = ref('')

function startBcCreate() {
  bcEditing.value = false
  bcForm.value = emptyBcForm()
  bcError.value = ''
  showBcForm.value = true
}

function startBcEdit(b: AdminBasecamp) {
  bcEditing.value = true
  bcForm.value = {
    id: b.id,
    name_id: b.name?.id ?? '',
    name_en: b.name?.en ?? '',
    facilities_id: b.facilities?.id ?? '',
    facilities_en: b.facilities?.en ?? '',
    cost_id: b.cost_estimate?.id ?? '',
    cost_en: b.cost_estimate?.en ?? '',
    is_permit_point: b.is_permit_point,
    latitude: b.latitude ?? '',
    longitude: b.longitude ?? '',
    reason: '',
  }
  bcError.value = ''
  showBcForm.value = true
}

// Both-or-none coords (same rule the server enforces, T021).
function validateBcForm(f: ReturnType<typeof emptyBcForm>): string | null {
  if (!f.name_id.trim()) return t('admin.basecamp_name_id')
  const hasLat = f.latitude !== '' && !Number.isNaN(Number(f.latitude))
  const hasLon = f.longitude !== '' && !Number.isNaN(Number(f.longitude))
  if (hasLat !== hasLon) return `${t('admin.basecamp_lat')} / ${t('admin.basecamp_lon')}`
  if (hasLat && (Number(f.latitude) < -90 || Number(f.latitude) > 90)) return t('admin.basecamp_lat')
  if (hasLon && (Number(f.longitude) < -180 || Number(f.longitude) > 180)) return t('admin.basecamp_lon')
  return null
}

async function saveBc() {
  const f = bcForm.value
  const bad = validateBcForm(f)
  if (bad) {
    bcError.value = `${t('common.error')}: ${bad}`
    return
  }
  busy.value = true
  bcError.value = ''
  const body: Record<string, unknown> = {
    name: { id: f.name_id, en: f.name_en },
    facilities: { id: f.facilities_id, en: f.facilities_en },
    cost_estimate: { id: f.cost_id, en: f.cost_en },
    is_permit_point: f.is_permit_point,
    reason: f.reason || undefined,
  }
  if (f.latitude !== '' && f.longitude !== '') {
    body.latitude = Number(f.latitude)
    body.longitude = Number(f.longitude)
  }
  try {
    if (bcEditing.value && f.id) await adminMountainsApi.updateBasecamp(f.id, body)
    else await adminMountainsApi.addBasecamp(id, body)
    showBcForm.value = false
    await load()
  } catch (e) {
    bcError.value = e instanceof Error ? e.message : String(e)
  } finally {
    busy.value = false
  }
}

async function removeBc() {
  const b = deleteBcTarget.value
  if (!b) return
  deleteBcTarget.value = null
  try {
    await adminMountainsApi.deleteBasecamp(b.id)
    toast(t('admin.record_saved'), 'success')
    await load()
  } catch (e) {
    error.value = e instanceof Error ? e.message : String(e)
    toast(error.value, 'error')
  }
}
</script>

<template>
  <div class="space-y-8">
    <div class="flex items-center justify-between">
      <div>
        <button class="text-sm text-ink-500 hover:underline" @click="router.back()">← {{ t('common.back') }}</button>
        <h2 class="font-display text-xl font-semibold">
          {{ mountain?.name?.id ?? '…' }}
          <span v-if="mountain" class="ml-2 align-middle text-xs font-normal text-ink-500">{{ mountain.slug }} · {{ mountain.status }}</span>
        </h2>
      </div>
      <RouterLink
        v-if="mountain?.status === 'published'"
        :to="{ name: 'mountain-detail', params: { slug: mountain.slug } }"
        class="text-sm text-brand-700 hover:underline"
      >{{ t('common.viewAll') }}</RouterLink>
    </div>

    <p v-if="error" class="rounded bg-red-50 px-3 py-2 text-sm text-red-700">{{ error }}</p>
    <p v-if="loading" class="text-sm text-ink-500">{{ t('common.loading') }}</p>

    <template v-if="mountain && !loading">
      <!-- Photo (US1) -->
      <section>
        <h3 class="mb-2 text-sm font-semibold uppercase text-ink-500">{{ t('photo.add') }}</h3>
        <MountainPhotoField :mountain="mountain" @updated="onPhotoUpdated" />
      </section>

      <!-- Gallery (004 US3) -->
      <section>
        <h3 class="mb-2 text-sm font-semibold uppercase text-ink-500">{{ t('gallery.title') }}</h3>
        <MountainGalleryField :mountain-id="id" :photos="gallery" @refresh="load" />
      </section>

      <!-- Routes (US2) -->
      <section>
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase text-ink-500">{{ t('admin.routes_title') }}</h3>
          <button class="text-sm text-brand-700 hover:underline" @click="startRouteCreate">＋ {{ t('admin.routes_title') }}</button>
        </div>
        <p v-if="!routes.length" class="text-sm text-ink-500">{{ t('common.notYetAvailable') }}</p>
        <ul v-else class="divide-y divide-ink-900/5 rounded border border-ink-900/10 text-sm">
          <li v-for="r in routes" :key="r.id" class="flex items-center justify-between px-3 py-2">
            <span>
              {{ r.name?.id }}
              <span class="text-xs text-ink-500">· {{ r.distance_km }} km · {{ r.duration_hours }} h · +{{ r.elevation_gain_m }} m</span>
            </span>
            <span class="space-x-2">
              <button class="text-brand-700 hover:underline" @click="startRouteEdit(r)">{{ t('common.edit') }}</button>
              <button class="text-red-600 hover:underline" @click="deleteRouteTarget = r">{{ t('common.delete') }}</button>
            </span>
          </li>
        </ul>

        <form v-if="showRouteForm" class="mt-3 space-y-3 rounded-lg border border-ink-900/10 bg-paper-raised p-4" @submit.prevent="saveRoute">
          <div class="grid gap-3 sm:grid-cols-2">
            <Label class="text-sm">{{ t('admin.route_name_id') }}<Input v-model="routeForm.name_id" required class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_name_en') }}<Input v-model="routeForm.name_en" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_distance') }}<Input v-model.number="routeForm.distance_km" type="number" min="0" step="0.1" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_duration') }}<Input v-model.number="routeForm.duration_hours" type="number" min="0.1" step="0.5" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_elevation') }}<Input v-model.number="routeForm.elevation_gain_m" type="number" min="0" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_entry') }} (ID)<Input v-model="routeForm.entry_id" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.route_entry') }} (EN)<Input v-model="routeForm.entry_en" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.reason') }}<Input v-model="routeForm.reason" class="mt-1 w-full" /></Label>
          </div>
          <p v-if="routeError" class="text-xs text-red-600">{{ routeError }}</p>
          <div class="flex gap-2">
            <Button type="submit" class="text-sm" :loading="busy">{{ t('common.save') }}</Button>
            <Button variant="ghost" class="text-sm" @click="showRouteForm = false">{{ t('common.cancel') }}</Button>
          </div>
        </form>
      </section>

      <!-- Basecamps (US3) -->
      <section>
        <div class="mb-2 flex items-center justify-between">
          <h3 class="text-sm font-semibold uppercase text-ink-500">{{ t('admin.basecamps_title') }}</h3>
          <button class="text-sm text-brand-700 hover:underline" @click="startBcCreate">＋ {{ t('admin.basecamps_title') }}</button>
        </div>
        <p v-if="!basecamps.length" class="text-sm text-ink-500">{{ t('common.notYetAvailable') }}</p>
        <ul v-else class="divide-y divide-ink-900/5 rounded border border-ink-900/10 text-sm">
          <li v-for="b in basecamps" :key="b.id" class="flex items-center justify-between px-3 py-2">
            <span>
              {{ b.name?.id }}
              <span v-if="b.is_permit_point" class="ml-1 rounded bg-brand-100 px-1.5 py-0.5 text-xs">{{ t('admin.basecamp_permit') }}</span>
              <span v-if="b.latitude != null" class="text-xs text-ink-500">· {{ b.latitude }}, {{ b.longitude }}</span>
            </span>
            <span class="space-x-2">
              <button class="text-brand-700 hover:underline" @click="startBcEdit(b)">{{ t('common.edit') }}</button>
              <button class="text-red-600 hover:underline" @click="deleteBcTarget = b">{{ t('common.delete') }}</button>
            </span>
          </li>
        </ul>

        <form v-if="showBcForm" class="mt-3 space-y-3 rounded-lg border border-ink-900/10 bg-paper-raised p-4" @submit.prevent="saveBc">
          <div class="grid gap-3 sm:grid-cols-2">
            <Label class="text-sm">{{ t('admin.basecamp_name_id') }}<Input v-model="bcForm.name_id" required class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_name_en') }}<Input v-model="bcForm.name_en" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_facilities') }} (ID)<Input v-model="bcForm.facilities_id" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_facilities') }} (EN)<Input v-model="bcForm.facilities_en" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_cost') }} (ID)<Input v-model="bcForm.cost_id" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_cost') }} (EN)<Input v-model="bcForm.cost_en" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_lat') }}<Input v-model="bcForm.latitude" type="number" step="any" min="-90" max="90" class="mt-1 w-full" /></Label>
            <Label class="text-sm">{{ t('admin.basecamp_lon') }}<Input v-model="bcForm.longitude" type="number" step="any" min="-180" max="180" class="mt-1 w-full" /></Label>
            <div class="flex items-center gap-2 text-sm">
              <Checkbox id="bc-permit" v-model="bcForm.is_permit_point" />
              <Label for="bc-permit">{{ t('admin.basecamp_permit') }}</Label>
            </div>
            <Label class="text-sm">{{ t('admin.reason') }}<Input v-model="bcForm.reason" class="mt-1 w-full" /></Label>
          </div>
          <p v-if="bcError" class="text-xs text-red-600">{{ bcError }}</p>
          <div class="flex gap-2">
            <Button type="submit" class="text-sm" :loading="busy">{{ t('common.save') }}</Button>
            <Button variant="ghost" class="text-sm" @click="showBcForm = false">{{ t('common.cancel') }}</Button>
          </div>
        </form>
      </section>

      <!-- Edit log (US1/2/3 provenance) -->
      <section>
        <h3 class="mb-2 text-sm font-semibold uppercase text-ink-500">{{ t('admin.edit_log') }}</h3>
        <p v-if="!editLog.length" class="text-sm text-ink-500">{{ t('common.empty') }}</p>
        <ul v-else class="space-y-1 text-sm">
          <li v-for="e in editLog" :key="e.id" class="flex items-baseline justify-between gap-2 border-b border-ink-900/5 pb-1">
            <span>
              <span class="font-mono text-xs uppercase text-ink-500">{{ e.action }}</span>
              {{ e.entity_type }}
              <span v-if="e.reason" class="text-ink-600">— {{ e.reason }}</span>
            </span>
            <span class="shrink-0 text-xs text-ink-400">{{ e.created_at }}</span>
          </li>
        </ul>
      </section>
    </template>

    <!-- 007 US2: delete confirmations (replace window.confirm) -->
    <AlertDialog
      :open="deleteRouteTarget !== null"
      danger
      :title="`${t('common.delete')} ${deleteRouteTarget?.name?.id ?? ''}`"
      :description="t('admin.delete_confirm')"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      @update:open="(v: boolean) => { if (!v) deleteRouteTarget = null }"
      @confirm="removeRoute"
    />
    <AlertDialog
      :open="deleteBcTarget !== null"
      danger
      :title="`${t('common.delete')} ${deleteBcTarget?.name?.id ?? ''}`"
      :description="t('admin.delete_confirm')"
      :confirm-label="t('common.delete')"
      :cancel-label="t('common.cancel')"
      @update:open="(v: boolean) => { if (!v) deleteBcTarget = null }"
      @confirm="removeBc"
    />
  </div>
</template>
