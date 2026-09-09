// @vitest-environment happy-dom
/**
 * T014 [US1] (002): public mountain card binds photo_url — img when present,
 * glyph/letter fallback tile when null (FR-004, US1-AS1).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

vi.mock('@/features/catalogue/infrastructure/api', () => ({
  catalogueApi: {
    search: vi.fn(),
    regions: vi.fn().mockResolvedValue({ items: [] }),
    profile: vi.fn(),
    weather: vi.fn(),
    reportField: vi.fn(),
  },
}))

import { catalogueApi } from '@/features/catalogue/infrastructure/api'
import MountainListPage from '@/features/catalogue/ui/pages/MountainListPage.vue'

const base = {
  id: '11111111-1111-1111-1111-111111111111',
  slug: 'gunung-slamet',
  name: { id: 'Gunung Slamet', en: 'Mount Slamet' },
  region: 'Jawa',
  province: 'Jawa Tengah',
  peak_height_m: 3428,
  difficulty: 4,
}

beforeEach(() => {
  setActivePinia(createPinia())
  vi.clearAllMocks()
})

async function mountWith(items: unknown[]) {
  vi.mocked(catalogueApi.search).mockResolvedValue({ items, total: items.length } as never)
  const wrapper = mount(MountainListPage, {
    global: {
      plugins: [i18n],
      stubs: {
        RouterLink: { template: '<a><slot /></a>' },
        // 007: Reka listbox popper is heavy in happy-dom; the page's <select>
        // role is tested in shadcn-smoke.spec.ts against real reka.
        Select: true,
      },
    },
  })
  await new Promise((r) => setTimeout(r, 0)) // flush onMounted promises
  await wrapper.vm.$nextTick()
  return wrapper
}

describe('mountain card photo binding (002 US1)', () => {
  it('renders an img with the presigned url when photo_url present', async () => {
    const wrapper = await mountWith([{ ...base, photo_url: 'http://fake.local/bucket/uploads/a.png?ttl=24h' }])
    const img = wrapper.find('img')
    expect(img.exists()).toBe(true)
    expect(img.attributes('src')).toContain('uploads/a.png')
    expect(wrapper.find('[aria-hidden="true"]').text()).toBe('') // no glyph letter shown
  })

  it('renders the initial-letter fallback tile when photo_url null', async () => {
    const wrapper = await mountWith([{ ...base, photo_url: null }])
    expect(wrapper.find('img').exists()).toBe(false)
    const glyph = wrapper.find('[aria-hidden="true"]')
    expect(glyph.exists()).toBe(true)
    expect(glyph.text()).toBe('M') // default en locale → "Mount Slamet" first letter
  })
})
