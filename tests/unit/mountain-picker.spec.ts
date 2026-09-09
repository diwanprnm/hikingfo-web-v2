/**
 * 003 T004 + T009 — MountainPicker component tests: debounce + 2-char
 * threshold, default list on empty input, alias query, no-match hint,
 * selection emits id (never text), clear drops selection, keyboard nav.
 */
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import { createPinia, setActivePinia } from 'pinia'
import { i18n } from '@/shared/i18n'

const suggestMountains = vi.fn()

vi.mock('@/features/catalogue/application/store', () => ({
  useCatalogueStore: () => ({ suggestMountains }),
}))

import MountainPicker from '@/features/partner/ui/MountainPicker.vue'

const semeru = {
  id: 'id-semeru',
  slug: 'semeru',
  name: { id: 'Gunung Semeru', en: 'Mount Semeru' },
  region: 'Jawa',
  province: 'Jawa Timur',
  peak_height_m: 3676,
  difficulty: 4,
}
const slamet = {
  id: 'id-slamet',
  slug: 'gunung-slamet',
  name: { id: 'Gunung Slamet', en: 'Mount Slamet' },
  region: 'Jawa',
  province: 'Jawa Tengah',
  peak_height_m: 3428,
  difficulty: 4,
}

function mk() {
  return mount(MountainPicker, {
    global: { plugins: [createPinia(), i18n] },
    props: { modelValue: '' },
  })
}

beforeEach(() => {
  setActivePinia(createPinia())
  ;(i18n.global.locale as unknown as { value: string }).value = 'en'
  vi.useFakeTimers()
  suggestMountains.mockReset()
})
afterEach(() => {
  vi.useRealTimers()
})

async function typeAndFlush(wrapper: ReturnType<typeof mk>, text: string) {
  await wrapper.find('input').setValue(text)
  await vi.advanceTimersByTimeAsync(250)
  await nextTick()
}

describe('MountainPicker (003)', () => {
  it('does not query below 2 chars (threshold)', async () => {
    const w = mk()
    await typeAndFlush(w, 's')
    expect(suggestMountains).not.toHaveBeenCalled()
  })

  it('debounces ~200ms before querying', async () => {
    const w = mk()
    await w.find('input').setValue('sem')
    await vi.advanceTimersByTimeAsync(100)
    expect(suggestMountains).not.toHaveBeenCalled()
    await vi.advanceTimersByTimeAsync(150)
    expect(suggestMountains).toHaveBeenCalledWith('sem')
  })

  it('shows default list when the input is empty', async () => {
    suggestMountains.mockResolvedValue([slamet, semeru])
    const w = mk()
    await w.find('input').trigger('focus')
    await vi.advanceTimersByTimeAsync(250)
    await nextTick()
    expect(suggestMountains).toHaveBeenCalledWith('')
    const rows = w.findAll('[role="option"]')
    expect(rows.length).toBe(2)
    // alphabetical default ordering ("Semeru" < "Slamet")
    expect(rows[0].text()).toContain('Mount Semeru')
  })

  it('renders suggestions with region · province (FR-002)', async () => {
    suggestMountains.mockResolvedValue([semeru])
    const w = mk()
    await typeAndFlush(w, 'sem')
    expect(w.find('[role="option"]').text()).toContain('Jawa')
    expect(w.find('[role="option"]').text()).toContain('Jawa Timur')
  })

  it('alias query from the server surfaces the match (FR-001)', async () => {
    // the trigram server matches "mahameru" → Semeru; client just renders it
    suggestMountains.mockResolvedValue([semeru])
    const w = mk()
    await typeAndFlush(w, 'mahameru')
    expect(suggestMountains).toHaveBeenCalledWith('mahameru')
    expect(w.find('[role="option"]').text()).toContain('Mount Semeru')
  })

  it('zero matches renders the no_match hint, not a blank list (FR-006)', async () => {
    suggestMountains.mockResolvedValue([])
    const w = mk()
    await typeAndFlush(w, 'zzzz')
    const list = w.find('[role="listbox"]')
    expect(list.text()).toContain('No mountain found')
    expect(w.findAll('[role="option"]').length).toBe(0)
  })

  it('server failure renders error + retry (FR-006)', async () => {
    suggestMountains.mockRejectedValue(new Error('down'))
    const w = mk()
    await typeAndFlush(w, 'sem')
    expect(w.text()).toContain('Could not load mountains')
    suggestMountains.mockResolvedValue([semeru])
    const retry = w.findAll('button').find((b) => b.text() === 'Retry')
    expect(retry).toBeTruthy()
    await retry!.trigger('click')
    await vi.advanceTimersByTimeAsync(250)
    await nextTick()
    expect(w.findAll('[role="option"]').length).toBe(1)
  })

  it('picking emits the id only, never the free text (FR-003)', async () => {
    suggestMountains.mockResolvedValue([semeru])
    const w = mk()
    await typeAndFlush(w, 'sem')
    await w.find('[role="option"]').trigger('mousedown')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['id-semeru'])
  })

  it('editing text after selecting drops the selection (US1-AS5)', async () => {
    suggestMountains.mockResolvedValue([semeru])
    const w = mk()
    await typeAndFlush(w, 'sem')
    await w.find('[role="option"]').trigger('mousedown')
    await w.find('input').setValue('semee') // diverges from selected label
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([''])
  })

  it('clear button drops selection', async () => {
    suggestMountains.mockResolvedValue([semeru])
    const w = mk()
    await typeAndFlush(w, 'sem')
    await w.find('[role="option"]').trigger('mousedown')
    const clearBtn = w.findAll('button').find((b) => b.attributes('aria-label'))
    await clearBtn!.trigger('click')
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual([''])
    expect(w.find('input').element.value).toBe('')
  })

  it('exact-name match sorts first (edge case)', async () => {
    suggestMountains.mockResolvedValue([slamet, semeru])
    const w = mk()
    await typeAndFlush(w, 'Mount Slamet')
    const rows = w.findAll('[role="option"]')
    expect(rows[0].text()).toContain('Mount Slamet')
  })

  // ---- T009 keyboard ---------------------------------------------------------

  it('ArrowDown/ArrowUp move the highlight, Enter selects, Escape closes', async () => {
    suggestMountains.mockResolvedValue([semeru, slamet])
    const w = mk()
    await w.find('input').trigger('focus')
    await vi.advanceTimersByTimeAsync(250)
    await nextTick()

    await w.find('input').trigger('keydown', { key: 'ArrowDown' })
    expect(w.find('[role="option"]').attributes('aria-selected')).toBe('true')
    expect(w.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('false')

    await w.find('input').trigger('keydown', { key: 'ArrowDown' })
    expect(w.findAll('[role="option"]')[1].attributes('aria-selected')).toBe('true')

    await w.find('input').trigger('keydown', { key: 'ArrowUp' })
    expect(w.find('[role="option"]').attributes('aria-selected')).toBe('true')

    await w.find('input').trigger('keydown', { key: 'Enter' })
    expect(w.emitted('update:modelValue')?.at(-1)).toEqual(['id-semeru'])

    await typeAndFlush(w, 'semeru extra')
    await w.find('input').trigger('keydown', { key: 'Escape' })
    expect(w.find('[role="listbox"]').exists()).toBe(false)
  })

  it('input is capped at a sane length', async () => {
    const w = mk()
    await w.find('input').setValue('a'.repeat(200))
    expect((w.find('input').element as HTMLInputElement).maxLength).toBe(80)
  })
})
