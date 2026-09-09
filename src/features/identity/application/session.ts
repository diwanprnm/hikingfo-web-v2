/**
 * Session store (Pinia). Holds the authenticated user's profile and exposes
 * auth actions. The router guard reads `isAuthenticated` to gate routes.
 */
import { defineStore } from 'pinia'
import { ref, computed } from 'vue'

import { identityApi } from '../infrastructure/api'
import type { MeView } from '../domain/types'

export const useSessionStore = defineStore('session', () => {
  const user = ref<MeView | null>(null)
  const loading = ref(false)
  const error = ref<string | null>(null)

  const isAuthenticated = computed(() => user.value !== null)
  const isAdmin = computed(() => user.value?.role === 'admin')

  /** Fetch the current user from the API. Returns true if authenticated. */
  async function fetchUser(): Promise<boolean> {
    loading.value = true
    error.value = null
    try {
      user.value = await identityApi.me()
      return true
    } catch {
      user.value = null
      return false
    } finally {
      loading.value = false
    }
  }

  async function login(payload: { email: string; password: string }) {
    loading.value = true
    error.value = null
    try {
      await identityApi.login(payload)
      await fetchUser()
    } catch (e: any) {
      error.value = e.message ?? 'Login failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function register(payload: {
    email: string
    password: string
    display_name: string
  }) {
    loading.value = true
    error.value = null
    try {
      await identityApi.register(payload)
    } catch (e: any) {
      error.value = e.message ?? 'Registration failed'
      throw e
    } finally {
      loading.value = false
    }
  }

  async function logout() {
    try {
      await identityApi.logout()
    } finally {
      user.value = null
    }
  }

  function $reset() {
    user.value = null
    loading.value = false
    error.value = null
  }

  return {
    user,
    loading,
    error,
    isAuthenticated,
    isAdmin,
    fetchUser,
    login,
    register,
    logout,
    $reset,
  }
})
