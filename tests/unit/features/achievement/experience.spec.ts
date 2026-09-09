/**
 * T059: experience-level buckets + progress-to-next derived correctly.
 */
import { describe, it, expect } from 'vitest'

import {
  deriveExperienceLevel,
  nextBadgeThreshold,
  EXPERIENCE_LEVELS,
} from '@/features/achievement/domain/types'

describe('experience level buckets', () => {
  const cases: Array<[number, string]> = [
    [0, 'pemula'],
    [4, 'pemula'],
    [5, 'menengah'],
    [14, 'menengah'],
    [15, 'lanjut'],
    [34, 'lanjut'],
    [35, 'ahli'],
    [100, 'ahli'],
  ]
  for (const [count, key] of cases) {
    it(`count=${count} → ${key}`, () => {
      expect(deriveExperienceLevel(count).key).toBe(key)
    })
  }

  it('buckets tile 0..∞ without gaps', () => {
    expect(EXPERIENCE_LEVELS[0].min).toBe(0)
    for (let i = 1; i < EXPERIENCE_LEVELS.length; i++) {
      expect(EXPERIENCE_LEVELS[i].min).toBe(EXPERIENCE_LEVELS[i - 1].max + 1)
    }
  })
})

describe('progress to next badge', () => {
  it('returns the next threshold above current', () => {
    expect(nextBadgeThreshold(0)).toBe(1)
    expect(nextBadgeThreshold(1)).toBe(5)
    expect(nextBadgeThreshold(5)).toBe(10)
    expect(nextBadgeThreshold(24)).toBe(25)
  })

  it('returns null when all badges earned', () => {
    expect(nextBadgeThreshold(100)).toBeNull()
    expect(nextBadgeThreshold(150)).toBeNull()
  })
})
