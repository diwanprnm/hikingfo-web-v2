/**
 * 003 T013 — notice form: same field-naming guidance as search (US3-AS2),
 * valid submit posts the {mountain_id, trip_start, trip_end, note?} shape.
 */
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

const search = vi.fn()
const createNotice = vi.fn().mockResolvedValue({ id: 'n1', status: 'open' })

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
  createNotice.mockClear()
})

async function openForm(w: ReturnType<typeof mount>) {
  const cta = w.findAll('button').find((b) => b.text().includes('Post a notice'))
  await cta!.trigger('click')
  await flushPromises()
}

describe('notice form (003 US3)', () => {
  it('submit with nothing selected names the mountain + dates fields', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await openForm(w)
    const noticeForm = w.findAll('form')[1]
    await noticeForm.trigger('submit')
    expect(createNotice).not.toHaveBeenCalled()
    expect(w.text()).toContain('Choose a mountain first.')
    expect(w.text()).toContain('Enter both start and end dates.')
  })

  it('valid submit posts the API body shape', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await openForm(w)
    // second picker instance belongs to the notice form
    const pickers = w.findAllComponents({ name: 'MountainPicker' })
    await pickers[1].find('button').trigger('click')
    const dates = w.findAll('input[type="date"]') // [searchStart, searchEnd, noticeStart, noticeEnd]
    await dates[2].setValue('2026-10-01')
    await dates[3].setValue('2026-10-05')
    await w.find('textarea').setValue('solo female hiker, porter available')
    await w.findAll('form')[1].trigger('submit')
    await flushPromises()
    expect(createNotice).toHaveBeenCalledWith({
      mountain_id: 'mountain-42',
      trip_start: '2026-10-01',
      trip_end: '2026-10-05',
      note: 'solo female hiker, porter available',
    })
    expect(w.text()).toContain('Notice posted.')
  })

  it('end before start blocks submit with a message', async () => {
    const w = mount(PartnerSearchPage, { global: { plugins: [createPinia(), i18n] } })
    await openForm(w)
    const pickers = w.findAllComponents({ name: 'MountainPicker' })
    await pickers[1].find('button').trigger('click')
    const dates = w.findAll('input[type="date"]')
    await dates[2].setValue('2026-10-05')
    await dates[3].setValue('2026-10-01')
    await w.findAll('form')[1].trigger('submit')
    expect(createNotice).not.toHaveBeenCalled()
    expect(w.text()).toContain('End date must be after the start date.')
  })
})
