/**
 * T025 (Principle IV release gate): id and en locale trees must have exactly
 * the same key sets, and the 002 additions must exist in both.
 */
import { describe, it, expect } from 'vitest'
import id from '@/shared/i18n/locales/id'
import en from '@/shared/i18n/locales/en'

function flatten(obj: Record<string, unknown>, prefix = ''): string[] {
  const out: string[] = []
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k
    if (v && typeof v === 'object' && !Array.isArray(v)) out.push(...flatten(v as Record<string, unknown>, key))
    else out.push(key)
  }
  return out
}

const idKeys = flatten(id as unknown as Record<string, unknown>).sort()
const enKeys = flatten(en as unknown as Record<string, unknown>).sort()

describe('i18n parity (id ⇄ en)', () => {
  it('locale trees expose identical key sets', () => {
    const missingInEn = idKeys.filter((k) => !enKeys.includes(k))
    const missingInId = enKeys.filter((k) => !idKeys.includes(k))
    expect({ missingInEn, missingInId }).toEqual({ missingInEn: [], missingInId: [] })
  })

  it('002 keys exist in both locales', () => {
    for (const key of [
      'admin.photo_none',
      'admin.photo_replace',
      'admin.photo_reason_placeholder',
      'admin.edit_log',
      'admin.routes_title',
      'admin.basecamps_title',
      'photo.too_large',
      'photo.not_image',
    ]) {
      expect(idKeys).toContain(key)
      expect(enKeys).toContain(key)
    }
  })
})
