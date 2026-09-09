/**
 * Achievement store (Pinia).
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { achievementApi } from '../infrastructure/api'
import type { UserBadgesView } from '../domain/types'

export const useAchievementStore = defineStore('achievement', () => {
  const badges = ref<UserBadgesView | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  async function fetchBadges() {
    loading.value = true
    error.value = null
    try {
      badges.value = await achievementApi.myBadges()
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load badges'
    } finally {
      loading.value = false
    }
  }

  return { badges, loading, error, fetchBadges }
})
