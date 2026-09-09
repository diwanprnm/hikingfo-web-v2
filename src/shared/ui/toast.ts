/**
 * 007 · toast queue — one shared store the Toaster renders.
 * Component instead of a dep (research R4): auto-dismiss, bilingual by the
 * caller passing `t(...)` strings.
 */
import { reactive } from 'vue'

export interface Toast {
  id: number
  message: string
  variant: 'success' | 'error' | 'info'
}

const state = reactive<{ items: Toast[] }>({ items: [] })
let seq = 0

export function toast(message: string, variant: Toast['variant'] = 'success', ms = 3500) {
  const id = ++seq
  state.items.push({ id, message, variant })
  window.setTimeout(() => dismiss(id), ms)
}

export function dismiss(id: number) {
  const i = state.items.findIndex((t) => t.id === id)
  if (i >= 0) state.items.splice(i, 1)
}

export const toasts = state
