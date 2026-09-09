/**
 * Achievement domain types.
 */

export interface ExperienceLevel {
  key: string
  name: { id: string; en: string }
  range: string
}

export interface BadgeAward {
  key: string
  name: { id: string; en: string }
  description: { id: string; en: string }
  icon_key: string
  threshold: number
  earned: boolean
}

export interface UserBadgesView {
  distinct_mountains: number
  experience_level: ExperienceLevel
  badges: BadgeAward[]
}

// Experience level thresholds (matches backend)
export const EXPERIENCE_LEVELS = [
  { key: 'pemula', min: 0, max: 4, name: { id: 'Pemula', en: 'Beginner' }, range: '1–4' },
  { key: 'menengah', min: 5, max: 14, name: { id: 'Menengah', en: 'Intermediate' }, range: '5–14' },
  { key: 'lanjut', min: 15, max: 34, name: { id: 'Lanjut', en: 'Advanced' }, range: '15–34' },
  { key: 'ahli', min: 35, max: Infinity, name: { id: 'Ahli', en: 'Expert' }, range: '35+' },
]

export function deriveExperienceLevel(count: number) {
  return EXPERIENCE_LEVELS.find(l => count >= l.min && count <= l.max) ?? EXPERIENCE_LEVELS[0]
}

export function nextBadgeThreshold(current: number): number | null {
  const thresholds = [1, 5, 10, 25, 50, 100]
  return thresholds.find(t => t > current) ?? null
}
