/**
 * 007 T015 — Select keyboard contract (US1 AC1/AC2):
 * Enter opens the listbox; Escape closes restoring the prior value (no emit).
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'
import Select from '@/shared/ui/Select.vue'

const items = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
]

let w: VueWrapper | null = null
function mk(): VueWrapper {
  w = mount(Select, {
    attachTo: document.body,
    props: { modelValue: 'a', items, ariaLabel: 'pick' },
  })
  return w
}
afterEach(() => {
  w?.unmount()
  w = null
  document.body.innerHTML = ''
})

describe('Select keyboard (007 US1)', () => {
  it('Enter opens the listbox and shows all options', async () => {
    const s = mk()
    await nextTick()
    const trigger = s.find('button')
    expect(trigger.attributes('role')).toBe('combobox')
    expect(trigger.attributes('aria-expanded')).toBe('false')
    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()
    expect(s.find('button').attributes('aria-expanded')).toBe('true')
    const popup = document.body.querySelector('[role="listbox"]')
    expect(popup).toBeTruthy()
    const opts = [...popup!.querySelectorAll('[role="option"]')].map((el) => el.textContent?.trim())
    expect(opts.join(' ')).toContain('Alpha')
    expect(opts.join(' ')).toContain('Beta')
    expect(s.emitted('update:modelValue')).toBeUndefined()
  })

  it('Escape closes and keeps the prior value (no update emitted, AC2)', async () => {
    const s = mk()
    await nextTick()
    await s.find('button').trigger('keydown', { key: 'Enter' })
    await nextTick()
    await nextTick()
    const popup = document.body.querySelector('[role="listbox"]')
    expect(popup).toBeTruthy()

    await s.find('button').trigger('keydown', { key: 'Escape' })
    await nextTick()
    await nextTick()
    expect(document.body.querySelector('[role="listbox"]')).toBeNull()
    // prior value restored: nothing emitted, trigger still shows Alpha
    expect(s.emitted('update:modelValue')).toBeUndefined()
    expect(s.text()).toContain('Alpha')
  })
})
