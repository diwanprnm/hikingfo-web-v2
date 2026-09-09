<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useJourneyStore } from '../../application/store'
import { useCatalogueStore } from '@/features/catalogue/application/store'
import PhotoUploader from '@/shared/components/PhotoUploader.vue'
import Combobox from '@/shared/ui/Combobox.vue'
import Input from '@/shared/ui/Input.vue'
import Textarea from '@/shared/ui/Textarea.vue'
import Checkbox from '@/shared/ui/Checkbox.vue'
import Label from '@/shared/ui/Label.vue'
import Button from '@/shared/ui/Button.vue'
import { toast } from '@/shared/ui/toast'

const { t } = useI18n()
const router = useRouter()
const store = useJourneyStore()
const catalogue = useCatalogueStore()

// Form state
const mountainId = ref('')
const routeId = ref('')
const climbDate = ref('')
const evidencePhotos = ref<File[]>([])
const title = ref('')
const narrative = ref('')
const postPhotos = ref<File[]>([])
const createPost = ref(false)
const submitting = ref(false)
const error = ref<string | null>(null)

// Load mountains for selection
import { onMounted } from 'vue'
onMounted(() => {
  if (!catalogue.results) catalogue.search()
})

const canSubmit = computed(() => mountainId.value && climbDate.value)

// 007: mountain list for the combobox (long list → type-ahead, R3)
const mountainOptions = computed(() =>
  (catalogue.results?.items ?? []).map((m) => ({ value: m.id, label: m.name.en || m.name.id, hint: m.region })),
)

async function submit() {
  if (!canSubmit.value) return
  submitting.value = true
  error.value = null
  try {
    // Upload evidence photos
    const { journeyApi } = await import('../../infrastructure/api')
    const evidenceKeys: string[] = []
    for (const file of evidencePhotos.value) {
      const res = await journeyApi.upload(file)
      evidenceKeys.push(res.key)
    }

    // Record hike
    await store.recordHike({
      mountain_id: mountainId.value,
      route_id: routeId.value || undefined,
      climb_date: climbDate.value,
      evidence_photo_keys: evidenceKeys,
      ...(createPost.value ? {
        title: title.value,
        narrative: narrative.value,
        photo_keys: postPhotos.value.length > 0
          ? (await Promise.all(postPhotos.value.map(f => journeyApi.upload(f)))).map(r => r.key)
          : [],
        visibility: 'draft' as const,
      } : {}),
    })

    toast(t('journey.hike_recorded'), 'success')
    router.push({ name: 'my-hikes' })
  } catch (e: any) {
    const msg = e.message ?? 'Failed to record hike'
    error.value = msg
    toast(msg, 'error')
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <section class="mx-auto max-w-2xl px-4 py-8">
    <h1 class="font-display text-2xl font-semibold text-ink-900">
      {{ t('journey.record_title') }}
    </h1>

    <form class="mt-6 space-y-4" @submit.prevent="submit">
      <!-- Mountain (007: combobox — type-ahead over a long list, R3) -->
      <div>
        <Label>{{ t('journey.mountain') }} *</Label>
        <Combobox
          v-model="mountainId"
          class="mt-1"
          :aria-label="t('journey.mountain')"
          :placeholder="t('journey.select_mountain')"
          :items="mountainOptions"
        />
      </div>

      <!-- Climb date -->
      <div>
        <Label>{{ t('journey.climb_date') }} *</Label>
        <Input v-model="climbDate" type="date" class="mt-1" />
      </div>

      <!-- Evidence photos (optional, max 5) -->
      <div>
        <label class="block text-sm font-medium text-ink-700">{{ t('journey.evidence_photos') }}</label>
        <p class="mt-1 text-xs text-ink-500">{{ t('journey.evidence_hint') }}</p>
        <PhotoUploader v-model="evidencePhotos" :max="5" class="mt-2" />
        <p v-if="evidencePhotos.length === 0" class="mt-1 text-xs text-amber-600">
          {{ t('journey.unverified_hint') }}
        </p>
      </div>

      <!-- Create journey post toggle -->
      <div class="flex items-center gap-2">
        <Checkbox id="createPost" v-model="createPost" />
        <Label for="createPost" class="font-medium">{{ t('journey.create_post') }}</Label>
      </div>

      <!-- Post fields (conditional) -->
      <template v-if="createPost">
        <div>
          <Label>{{ t('journey.title') }}</Label>
          <Input v-model="title" type="text" class="mt-1" />
        </div>
        <div>
          <Label>{{ t('journey.narrative') }}</Label>
          <Textarea v-model="narrative" :rows="4" class="mt-1" />
        </div>
        <div>
          <Label>{{ t('journey.post_photos') }}</Label>
          <PhotoUploader v-model="postPhotos" :max="10" class="mt-2" />
        </div>
      </template>

      <!-- Error -->
      <p v-if="error" class="text-sm text-red-600">{{ error }}</p>

      <!-- Submit -->
      <Button type="submit" class="w-full" :disabled="!canSubmit" :loading="submitting">
        {{ submitting ? t('common.loading') : t('journey.submit_hike') }}
      </Button>
    </form>
  </section>
</template>
