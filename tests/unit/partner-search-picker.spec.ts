/**
 * 003 T005 — PartnerSearchPage embeds MountainPicker and the search request
 * carries the BOUND mountain id (FR-003/FR-011: flow otherwise unchanged).
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

describe('PartnerSearchPage picker binding (003 US1)', () => {
  it('embeds MountainPicker (no more <select>)', () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    expect(w.find('select').exists()).toBe(false)
    expect(w.findComponent({ name: 'MountainPicker' }).exists()).toBe(true)
  })

  it('search request carries the bound mountain id (FR-003/FR-011)', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await w.findComponent({ name: 'MountainPicker' }).find('button').trigger('click')
    const inputs = w.findAll('input[type="date"]')
    await inputs[0].setValue('2026-10-01')
    await inputs[1].setValue('2026-10-03')
    await w.find('form').trigger('submit')
    expect(search).toHaveBeenCalledWith({
      mountain_id: 'mountain-42',
      trip_start: '2026-10-01',
      trip_end: '2026-10-03',
    })
  })
})
