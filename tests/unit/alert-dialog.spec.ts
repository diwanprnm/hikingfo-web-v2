/**
 * 007 T020 — AlertDialog: Escape dismisses without confirming (US2 AC1),
 * replacing the browser confirm() that used to guard destructive actions.
 * Reka portals the content into document.body — query the live DOM, not the
 * wrapper.
 */
import { describe, it, expect, afterEach } from 'vitest'
import { mount } from '@vue/test-utils'
import { nextTick } from 'vue'
import AlertDialog from '@/shared/ui/AlertDialog.vue'

function mk() {
  return mount(AlertDialog, {
    attachTo: document.body,
    props: {
      open: true,
      title: 'Delete?',
      description: 'Cannot be undone.',
      confirmLabel: 'Delete',
      cancelLabel: 'Cancel',
    },
  })
}

function bodyButton(label: string) {
  return [...document.body.querySelectorAll('button')].find((b) => b.textContent?.trim() === label)
}

// Reka portals leave DOM behind after unmount — clean between tests.
let current: ReturnType<typeof mk> | null = null
function open() {
  current = mk()
  return current
}
afterEach(() => {
  current?.unmount()
  current = null
  document.body.innerHTML = ''
})

describe('AlertDialog (007 US2)', () => {
  it('renders title, description and both actions when open', async () => {
    open()
    await nextTick()
    expect(document.body.textContent).toContain('Delete?')
    expect(document.body.textContent).toContain('Cannot be undone.')
    expect(bodyButton('Delete')).toBeTruthy()
    expect(bodyButton('Cancel')).toBeTruthy()
  })

  it('Escape closes (update:open=false) and never fires confirm (AC1)', async () => {
    const w = open()
    await nextTick()
    document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }))
    await nextTick()
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
    expect(w.emitted('confirm')).toBeUndefined()
  })

  it('Confirm button fires confirm and closes', async () => {
    const w = open()
    await nextTick()
    bodyButton('Delete')!.click()
    expect(w.emitted('confirm')).toHaveLength(1)
    expect(w.emitted('update:open')?.at(-1)).toEqual([false])
  })
})
