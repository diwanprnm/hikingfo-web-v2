/**
 * T030: EN→ID fallback on curated content + "not yet available" rendering.
 * The resolve() contract lives in MountainDetailPage; here we test the same
 * rules as a pure function against the shared locale messages.
 */
import { describe, it, expect } from 'vitest'
import { i18n } from '@/shared/i18n'

type Bilingual = { id: string; en: string }

const { t } = i18n.global

function resolve(text: Bilingual | undefined | null, lang: string): string {
  if (!text) return t('catalogue.not_available')
  if (lang === 'en' && text.en) return text.en
  return text.id || text.en || t('catalogue.not_available')
}

describe('curated-content EN→ID fallback', () => {
  it('resolves EN text when locale is en', () => {
    expect(resolve({ id: 'Gunung Rinjani', en: 'Mount Rinjani' }, 'en')).toBe('Mount Rinjani')
  })

  it('resolves ID text when locale is id', () => {
    expect(resolve({ id: 'Gunung Rinjani', en: 'Mount Rinjani' }, 'id')).toBe('Gunung Rinjani')
  })

  it('EN falls back to ID when no EN rendering exists', () => {
    expect(resolve({ id: 'Jalur Sembalun', en: '' }, 'en')).toBe('Jalur Sembalun')
  })

  it('renders "not yet available" for empty and missing text', () => {
    // resolve() asks the active locale; force id so the fallback copy is the
    // Indonesian string in both locales.
    i18n.global.locale.value = 'id'
    expect(resolve({ id: '', en: '' }, 'id')).toBe('Belum tersedia')
    expect(resolve(undefined, 'en')).toBe('Belum tersedia')
    expect(resolve(null, 'id')).toBe('Belum tersedia')
  })

  it('chrome fallbackLocale is id so missing en keys never render blank', () => {
    expect(i18n.global.fallbackLocale.value).toBe('id')
  })
})
