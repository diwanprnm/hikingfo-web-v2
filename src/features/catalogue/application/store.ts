/**
 * Catalogue store (Pinia). Manages search state, detail fetch, and weather.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { catalogueApi } from '../infrastructure/api'
import type {
  MountainProfile,
  Region,
  SearchFilter,
  SearchResult,
  WeatherSnapshot,
} from '../domain/types'

export const useCatalogueStore = defineStore('catalogue', () => {
  const results = ref<SearchResult | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const profile = ref<MountainProfile | null>(null)
  const profileLoading = ref(false)

  const regions = ref<Region[]>([])

  const weather = ref<WeatherSnapshot | null>(null)
  const weatherLoading = ref(false)

  async function search(filter: SearchFilter = {}) {
    loading.value = true
    error.value = null
    try {
      results.value = await catalogueApi.search(filter)
    } catch (e: any) {
      error.value = e.message ?? 'Search failed'
    } finally {
      loading.value = false
    }
  }

  async function fetchProfile(slug: string) {
    profileLoading.value = true
    error.value = null
    try {
      profile.value = await catalogueApi.profile(slug)
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load mountain'
    } finally {
      profileLoading.value = false
    }
  }

  async function fetchRegions() {
    try {
      const res = await catalogueApi.regions()
      regions.value = res.items
    } catch {
      // non-critical
    }
  }

  async function fetchWeather(slug: string) {
    weatherLoading.value = true
    try {
      weather.value = await catalogueApi.weather(slug)
    } catch {
      weather.value = null
    } finally {
      weatherLoading.value = false
    }
  }

  /** FR-003: report an error on a mountain field → moderation queue. */
  async function reportField(mountainId: string, field: string, reason: string, detail: string) {
    await catalogueApi.reportField(mountainId, field, reason, detail)
  }

  /** 003 T002: type-ahead suggestions for MountainPicker (stateless passthrough). */
  function suggestMountains(q: string) {
    return catalogueApi.suggestMountains(q)
  }

  function clearProfile() {
    profile.value = null
    weather.value = null
  }

  return {
    results,
    loading,
    error,
    profile,
    profileLoading,
    regions,
    weather,
    weatherLoading,
    search,
    fetchProfile,
    fetchRegions,
    fetchWeather,
    reportField,
    suggestMountains,
    clearProfile,
  }
})
