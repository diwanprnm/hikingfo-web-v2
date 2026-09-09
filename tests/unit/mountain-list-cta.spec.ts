// @vitest-environment happy-dom
/**
 * 006 [US1]: journey action buttons live inside the hero, before the search
 * form, and the old bottom split-CTA band is gone (FR-001..FR-004, FR-007).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

vi.mock('@/features/catalogue/infrastructure/api', () => ({
  catalogueApi: {
    search: vi.fn().mockResolvedValue({ items: [], total: 0 }),
    regions: vi.fn().mockResolvedValue({ items: [] }),
    profile: vi.fn(),
    weather: vi.fn(),
    reportField: vi.fn(),
  },
}))

import MountainListPage from '@/features/catalogue/ui/pages/MountainListPage.vue'

// RouterLink stub that records its `to` route name as a data attribute.
const LinkStub = {
  props: ['to'],
  setup(props: { to?: { name?: string } }) {
    return { routeName: () => props.to?.name ?? '' }
  },
  template: '<a :data-route="routeName()"><slot /></a>',
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

describe('home CTA placement (006 US1)', () => {
  it('renders journeys + record-hike actions before the search form, band gone', async () => {
    const wrapper = mount(MountainListPage, {
      global: { plugins: [i18n], stubs: { RouterLink: LinkStub } },
    })
    await new Promise((r) => setTimeout(r, 0))
    await wrapper.vm.$nextTick()

    const routes = wrapper.findAll('[data-route]').map((a) => a.attributes('data-route'))
    expect(routes).toEqual(expect.arrayContaining(['journeys', 'record-hike']))

    const all = wrapper.findAll('*')
    const idx = (sel: (el: (typeof all)[number]) => boolean) => all.findIndex(sel)
    const firstAction = idx((el) => el.attributes('data-route') === 'journeys')
    const searchForm = idx((el) => el.attributes('role') === 'search')
    expect(firstAction).toBeGreaterThan(-1)
    expect(searchForm).toBeGreaterThan(firstAction) // actions precede the search card

    // actions sit inside the hero band (bg-brand-100 wrapper), single-line labels
    const action = wrapper.find('[data-route="journeys"]')
    expect(action.classes()).toContain('btn-push')
    expect(action.classes()).toContain('whitespace-nowrap')

    // old split-CTA band removed: sub-copy text no longer rendered, one action pair
    expect(wrapper.text()).not.toContain('Read stories')
    expect(wrapper.text()).not.toContain('One evidence photo')
    expect(wrapper.findAll('[data-route="journeys"]').length).toBe(1)
    expect(wrapper.findAll('[data-route="record-hike"]').length).toBe(1)
  })
})
