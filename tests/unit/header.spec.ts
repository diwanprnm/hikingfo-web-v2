// @vitest-environment happy-dom
/**
 * T027 (004 US4): header auth indicator — signed-out shows Sign In;
 * signed-in shows avatar (initials) → profile + logout; logout restores Sign In.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

vi.mock('@/features/identity/infrastructure/api', () => ({
  identityApi: {
    me: vi.fn(),
    login: vi.fn(),
    logout: vi.fn().mockResolvedValue(undefined),
    register: vi.fn(),
  },
}))

const pushMock = vi.fn()
vi.mock('vue-router', async (importOriginal) => {
  const actual = await importOriginal<typeof import('vue-router')>()
  return { ...actual, useRoute: () => ({ name: 'home' }), useRouter: () => ({ push: pushMock }) }
})

import { identityApi } from '@/features/identity/infrastructure/api'
import AppHeader from '@/shared/layout/AppHeader.vue'
import { useSessionStore } from '@/features/identity/application/session'
import type { MeView } from '@/features/identity/domain/types'

const me = (over: Partial<MeView> = {}): MeView => ({
  id: 'u-1',
  email: 'sari@test.local',
  email_verified: true,
  display_name: 'Sari Wulandari',
  avatar_key: '',
  home_region: 'Jawa',
  bio: null,
  role: 'member',
  status: 'active',
  joined_at: '2026-01-01T00:00:00Z',
  distinct_count: 0,
  experience_level: 'Pemula',
  ...over,
})

const navItems = [{ label: 'Mountains', to: { name: 'home' } }]

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

function mountHeader() {
  return mount(AppHeader, {
    props: { navItems },
    global: { plugins: [i18n], stubs: { RouterLink: { template: '<a><slot /></a>' } } },
  })
}

describe('header auth indicator (004 US4)', () => {
  it('signed-out: shows the Sign In button', async () => {
    vi.mocked(identityApi.me).mockRejectedValue(new Error('401'))
    const session = useSessionStore()
    await session.fetchUser()
    const wrapper = mountHeader()
    expect(wrapper.text()).toContain(i18n.global.t('auth.login'))
    expect(wrapper.find('button').text()).not.toContain(i18n.global.t('header.logout'))
  })

  it('signed-in: avatar with initials + logout replaces Sign In', async () => {
    vi.mocked(identityApi.me).mockResolvedValue(me())
    const session = useSessionStore()
    await session.fetchUser()
    const wrapper = mountHeader()
    expect(wrapper.text()).not.toContain(i18n.global.t('auth.login'))
    expect(wrapper.text()).toContain(i18n.global.t('header.logout'))
    const avatar = wrapper.find(`[aria-label="${i18n.global.t('header.open_profile')}"]`)
    expect(avatar.text()).toBe('SW') // initials fallback
  })

  it('logout ends the session and restores the Sign In button (FR-011)', async () => {
    vi.mocked(identityApi.me).mockResolvedValue(me({ display_name: 'Sari' }))
    const session = useSessionStore()
    await session.fetchUser()
    const wrapper = mountHeader()

    const logoutBtn = wrapper
      .findAll('button')
      .find((b) => b.text() === i18n.global.t('header.logout'))
    expect(logoutBtn).toBeTruthy()
    await logoutBtn!.trigger('click')
    await new Promise((r) => setTimeout(r, 0))

    expect(identityApi.logout).toHaveBeenCalled()
    expect(session.user).toBeNull()
    expect(wrapper.text()).toContain(i18n.global.t('auth.login'))
  })
})
