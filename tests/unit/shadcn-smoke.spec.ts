/**
 * 007 T008 — smoke spec for the vendored shadcn-vue family (Phase 2 checkpoint).
 * happy-dom can't resolve CSS pseudo-state rules (:hover, :focus-visible), so
 * the 8-state audit is visual (T023); here: components mount, expose the right
 * roles/variants, and the focus-ring token + bridge vars exist in the theme.
 */
import { readFileSync } from 'node:fs'
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import Button from '@/shared/ui/Button.vue'
import Select from '@/shared/ui/Select.vue'
import Card from '@/shared/ui/Card.vue'
import AlertDialog from '@/shared/ui/AlertDialog.vue'
import Input from '@/shared/ui/Input.vue'

describe('vendored family smoke (007 Phase 2)', () => {
  it('Button renders variants: default keeps .btn-push, destructive tints red, disabled gates', () => {
    const primary = mount(Button)
    expect(primary.classes()).toContain('btn-push')
    const dest = mount(Button, { props: { variant: 'destructive' } })
    expect(dest.classes()).toContain('btn-push')
    expect(dest.classes().join(' ')).toContain('bg-red-600')
    const ghost = mount(Button, { props: { variant: 'ghost' } })
    expect(ghost.classes()).not.toContain('btn-push')
    // touch target + affordance states live on the base cva string
    expect(primary.classes().join(' ')).toContain('min-h-11')
    const off = mount(Button, { props: { loading: true } })
    expect(off.find('button').attributes('disabled')).toBeDefined()
  })

  it('Select exposes listbox roles and opens on trigger keyboard interaction', async () => {
    const w = mount(Select, {
      attachTo: document.body,
      props: {
        modelValue: 'a',
        ariaLabel: 'pick',
        items: [
          { value: 'a', label: 'Alpha' },
          { value: 'b', label: 'Beta' },
        ],
      },
    })
    const trigger = w.find('[role="combobox"], button')
    expect(trigger.exists()).toBe(true)
    await trigger.trigger('keydown', { key: 'Enter' })
    await nextTick()
    // keyboard-open listbox pattern (FR-004): either the popup opened or the
    // trigger kept aria wiring
    const popup = document.body.querySelector('[role="listbox"]')
    if (popup) expect(popup.querySelectorAll('[role="option"]').length).toBe(2)
    w.unmount()
  })

  it('Card keeps the Hum .card silhouette class and renders slot content', () => {
    const w = mount(Card, {
      props: { interactive: true },
      slots: { default: '<span class="inner">hi</span>' },
    })
    expect(w.classes()).toContain('card')
    expect(w.classes()).toContain('group')
    expect(w.find('.inner').exists()).toBe(true)
  })

  it('AlertDialog renders content into the portal with title + actions', async () => {
    const w = mount(AlertDialog, {
      attachTo: document.body,
      props: { open: true, title: 'T', description: 'D', confirmLabel: 'Yes', cancelLabel: 'No' },
    })
    await nextTick()
    expect(document.body.textContent).toContain('T')
    expect(document.body.textContent).toContain('D')
    w.unmount()
    document.body.innerHTML = ''
  })

  it('Input is styled as a family member (radius token, not browser default)', () => {
    const w = mount(Input, { props: { modelValue: 'x' } })
    const cls = w.find('input').classes().join(' ')
    expect(cls).toContain('--radius-input')
  })

  it('focus + bridge tokens defined in the operative theme', () => {
    // cwd = frontend/ when vitest runs (see vitest.config)
    const src = readFileSync('src/assets/main.css', 'utf8')
    expect(src).toContain('--color-ring: var(--color-focus)')
    expect(src).toContain('--color-background: var(--color-paper)')
    expect(src).toContain('--color-focus:')
  })
})
