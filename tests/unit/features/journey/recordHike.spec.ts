/**
 * T045/T009: record-my-hike form validation + publish flow state.
 * 004 rule: evidence optional (0..5); status derived — ≥1 photo → verified,
 * 0 photos → unverified (hint shown, submit allowed).
 */
import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'

import { useJourneyStore } from '@/features/journey/application/store'
import { journeyApi } from '@/features/journey/infrastructure/api'
import type { RecordHikePayload } from '@/features/journey/domain/types'

vi.mock('@/features/journey/infrastructure/api', () => ({
  journeyApi: {
    recordHike: vi.fn(),
    feed: vi.fn(),
    myHikes: vi.fn(),
    publishPost: vi.fn(),
    deletePost: vi.fn(),
    deleteHike: vi.fn(),
  },
}))

const mockedApi = vi.mocked(journeyApi)

/** Client-side mirror of the backend rule (004): evidence 0..5, status derived. */
function validateRecordHike(p: Partial<RecordHikePayload>): string | null {
  if (!p.mountain_id) return 'mountain required'
  if (!p.climb_date) return 'climb date required'
  if ((p.evidence_photo_keys?.length ?? 0) > 5) return 'too_many_photos'
  return null
}

/** Mirrors RecordHikePage's status hint: empty evidence → unverified notice. */
function expectedStatus(p: Partial<RecordHikePayload>): 'verified' | 'unverified' {
  return (p.evidence_photo_keys?.length ?? 0) >= 1 ? 'verified' : 'unverified'
}

const base: RecordHikePayload = {
  mountain_id: 'm-1',
  climb_date: '2026-08-01',
  evidence_photo_keys: ['evidence/photo-1.jpg'],
}

describe('record-my-hike validation', () => {
  it('accepts a complete payload', () => {
    expect(validateRecordHike(base)).toBeNull()
  })

  it('accepts zero evidence photos (004: optional, unverified)', () => {
    expect(validateRecordHike({ ...base, evidence_photo_keys: [] })).toBeNull()
    expect(expectedStatus({ ...base, evidence_photo_keys: [] })).toBe('unverified')
  })

  it('rejects more than 5 evidence photos', () => {
    const six = ['a', 'b', 'c', 'd', 'e', 'f']
    expect(validateRecordHike({ ...base, evidence_photo_keys: six })).toBe('too_many_photos')
  })

  it('accepts exactly 5 evidence photos, status verified', () => {
    const five = ['a', 'b', 'c', 'd', 'e']
    expect(validateRecordHike({ ...base, evidence_photo_keys: five })).toBeNull()
    expect(expectedStatus({ ...base, evidence_photo_keys: five })).toBe('verified')
  })

  it('rejects missing mountain', () => {
    expect(validateRecordHike({ ...base, mountain_id: '' })).toBe('mountain required')
  })

  it('rejects missing climb date', () => {
    expect(validateRecordHike({ ...base, climb_date: '' })).toBe('climb date required')
  })
})

describe('publish flow state', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    vi.clearAllMocks()
  })

  it('recordHike returns verified result and refreshes my hikes', async () => {
    mockedApi.recordHike.mockResolvedValue({ id: 'h-1', status: 'verified' })
    mockedApi.myHikes.mockResolvedValue({
      items: [],
      total: 1,
    })
    const store = useJourneyStore()
    const res = await store.recordHike(base)
    expect(res.status).toBe('verified')
    await store.fetchMyHikes()
    expect(store.myHikesTotal).toBe(1)
  })

  it('publishPost transitions a post and deletePost removes it from feed state', async () => {
    mockedApi.feed.mockResolvedValue({
      items: [
        {
          id: 'p-1',
          title: 'T',
          summary: {},
          mountain: { id: 'm-1', name: { id: 'G', en: 'M' }, slug: 'g', region: 'Jawa' },
          author: { id: 'u-1', display_name: 'A' },
          published_at: '2026-08-02T00:00:00Z',
          updated_at: '2026-08-02T00:00:00Z',
        },
      ],
      total: 1,
    })
    const store = useJourneyStore()
    await store.fetchFeed()
    expect(store.feedTotal).toBe(1)

    mockedApi.publishPost.mockResolvedValue({ ok: true })
    await store.publishPost('p-1')
    expect(mockedApi.publishPost).toHaveBeenCalledWith('p-1')

    mockedApi.deletePost.mockResolvedValue(undefined)
    await store.deletePost('p-1')
    expect(store.feedItems).toHaveLength(0)
  })
})
