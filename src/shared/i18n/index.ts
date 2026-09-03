import { createI18n } from 'vue-i18n'

import id from './locales/id'
import en from './locales/en'

/**
 * vue-i18n instance. UI chrome is bilingual; `fallbackLocale: 'id'` gives the
 * EN→ID fallback for chrome keys (research.md §9, spec Decisions → i18n).
 * Curated-content translated strings come from the API, distinct from chrome keys.
 *
 * Default `locale` is detected from the browser but the app defaults to `id`
 * (the platform's home language); the header toggle swaps it (T023).
 */
export const i18n = createI18n({
  legacy: false,
  globalInjection: true,
  locale: detectLocale(),
  fallbackLocale: 'id',
  messages: { id, en },
})

function detectLocale(): 'id' | 'en' {
  const stored = safeGet('hikingfo.locale')
  if (stored === 'id' || stored === 'en') return stored
  return navigator.language?.toLowerCase().startsWith('en') ? 'en' : 'id'
}

function safeGet(key: string): string | null {
  try {
    return localStorage.getItem(key)
  } catch {
    return null
  }
}
