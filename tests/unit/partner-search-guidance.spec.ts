/**
 * 003 T008 — submit guidance: empty form must name the missing fields,
 * never silently no-op (US2-AS1–2).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

const search = vi.fn()
const createNotice = vi.fn()

vi.mock('@/features/partner/application/store', () => ({
  usePartnerStore: () => ({
    search,
    createNotice,
    candidates: [],
    searchLoading: false,
    error: null,
  }),
}))

vi.mock('@/features/partner/ui/MountainPicker.vue', () => ({
  default: {
    name: 'MountainPicker',
    props: ['modelValue'],
    emits: ['update:modelValue'],
    template: '<button @click="$emit(\'update:modelValue\', \'mountain-42\')">set-mountain</button>',
  },
}))

import PartnerSearchPage from '@/features/partner/ui/pages/PartnerSearchPage.vue'

beforeEach(() => {
  setActivePinia(createPinia())
  ;(i18n.global.locale as unknown as { value: string }).value = 'en'
  search.mockReset()
  createNotice.mockReset()
})

const form = (w: ReturnType<typeof mount>) => w.findAll('form')[0]

describe('PartnerSearchPage guidance (003 US2)', () => {
  it('submit with no mountain shows a visible message naming the mountain field', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await form(w).trigger('submit')
    expect(search).not.toHaveBeenCalled()
    expect(w.text()).toContain('Choose a mountain first.')
  })

  it('mountain set but dates missing names the date fields', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await w.findComponent({ name: 'MountainPicker' }).find('button').trigger('click')
    await form(w).trigger('submit')
    expect(search).not.toHaveBeenCalled()
    expect(w.text()).toContain('Enter a start date.')
    expect(w.text()).toContain('Enter an end date.')
  })

  it('valid form runs the search', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await w.findComponent({ name: 'MountainPicker' }).find('button').trigger('click')
    const dates = w.findAll('input[type="date"]')
    await dates[0].setValue('2026-10-01')
    await dates[1].setValue('2026-10-02')
    await form(w).trigger('submit')
    expect(search).toHaveBeenCalledTimes(1)
    expect(w.text()).not.toContain('Enter a start date.')
  })
})
