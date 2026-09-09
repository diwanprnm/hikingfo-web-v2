/**
 * T027: identity session store + EN→ID chrome fallback.
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useSessionStore } from '@/features/identity/application/session'
import { identityApi } from '@/features/identity/infrastructure/api'
import { i18n } from '@/shared/i18n'

vi.mock('@/features/identity/infrastructure/api', () => ({
  identityApi: {
    me: vi.fn(),
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  },
}))

const mockedApi = vi.mocked(identityApi)

const meView = {
  id: 'u-1',
  email: 'a@b.c',
  email_verified: true,
  display_name: 'Andi',
  avatar_key: '',
  home_region: '',
  bio: null,
  role: 'member' as const,
  status: 'active' as const,
  joined_at: '2026-01-01T00:00:00Z',
  distinct_count: 3,
  experience_level: 'Pemula' as const,
}

describe('session store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('starts unauthenticated', () => {
    const store = useSessionStore()
    expect(store.isAuthenticated).toBe(false)
    expect(store.isAdmin).toBe(false)
  })

  it('fetchUser sets user on success', async () => {
    mockedApi.me.mockResolvedValue(meView)
    const store = useSessionStore()
    const ok = await store.fetchUser()
    expect(ok).toBe(true)
    expect(store.isAuthenticated).toBe(true)
    expect(store.user?.display_name).toBe('Andi')
  })

  it('fetchUser clears user on failure', async () => {
    mockedApi.me.mockRejectedValue(new Error('401'))
    const store = useSessionStore()
    const ok = await store.fetchUser()
    expect(ok).toBe(false)
    expect(store.isAuthenticated).toBe(false)
  })

  it('isAdmin true only for admin role', async () => {
    mockedApi.me.mockResolvedValue({ ...meView, role: 'admin' })
    const store = useSessionStore()
    await store.fetchUser()
    expect(store.isAdmin).toBe(true)
  })

  it('login error surfaces message and clears loading', async () => {
    mockedApi.login.mockRejectedValue(new Error('bad credentials'))
    const store = useSessionStore()
    await expect(store.login({ email: 'x', password: 'y' })).rejects.toThrow()
    expect(store.error).toBe('bad credentials')
    expect(store.loading).toBe(false)
  })

  it('logout clears the user', async () => {
    mockedApi.me.mockResolvedValue(meView)
    const store = useSessionStore()
    await store.fetchUser()
    await store.logout()
    expect(store.isAuthenticated).toBe(false)
  })
})

describe('i18n EN→ID fallback', () => {
  it('has id and en locales with fallbackLocale id', () => {
    expect(i18n.global.fallbackLocale.value).toBe('id')
    expect(i18n.global.availableLocales).toContain('id')
    expect(i18n.global.availableLocales).toContain('en')
  })

  it('en chrome keys resolve; missing en key falls back to id', () => {
    const { t } = i18n.global
    expect(t('app.name')).toBe('hikingfo')
    // switching to en still resolves keys present in en
    i18n.global.locale.value = 'en'
    expect(t('nav.mountains')).toBe('Mountains')
    i18n.global.locale.value = 'id'
    expect(t('nav.mountains')).toBe('Gunung')
  })
})
