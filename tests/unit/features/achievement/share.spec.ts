/**
 * T068/T069: share-card serialization sizes + verified-only output + empty state.
 * The canvas path is jsdom-unsafe (no real canvas), so we assert EXPORT_SIZES,
 * buildSvgString dimensions, and the caption/empty-state contract.
 */
import { describe, it, expect } from 'vitest'

import { EXPORT_SIZES, buildSvgString } from '@/shared/lib/canvasExport'
import { generateCaption } from '@/features/achievement/ui/share/caption'

describe('share-card export sizes (T068)', () => {
  it('covers IG feed 1080², IG story 1080×1920, landscape 1200×630', () => {
    const sizes = EXPORT_SIZES.map(s => [s.width, s.height])
    expect(sizes).toContainEqual([1080, 1080])
    expect(sizes).toContainEqual([1080, 1920])
    expect(sizes).toContainEqual([1200, 630])
    expect(EXPORT_SIZES).toHaveLength(3)
  })

  it('buildSvgString serializes with exact dimensions and viewBox', () => {
    const svg = buildSvgString('<rect/>', 1080, 1920)
    expect(svg).toContain('width="1080"')
    expect(svg).toContain('height="1920"')
    expect(svg).toContain('viewBox="0 0 1080 1920"')
    expect(svg).toContain('xmlns="http://www.w3.org/2000/svg"')
  })
})

describe('verified-data-only output (T069)', () => {
  it('caption contains verified stats and hashtags', () => {
    const c = generateCaption({
      mountainName: 'Gunung Rinjani',
      badgeName: '5 Gunung',
      distinctCount: 5,
      hikeDate: '2026-08-01',
    })
    expect(c).toContain('Gunung Rinjani')
    expect(c).toContain('5 gunung ditaklukkan')
    expect(c).toContain('#hikingfo')
  })

  it('adds milestone hashtags at thresholds', () => {
    const c5 = generateCaption({ mountainName: 'X', distinctCount: 5 })
    expect(c5).toContain('#explorer')
    const c25 = generateCaption({ mountainName: 'X', distinctCount: 25 })
    expect(c25).toContain('#mountainchampion')
  })

  it('zero verified hikes → empty state guidance (no stats line)', () => {
    const c = generateCaption({ mountainName: 'X', distinctCount: 0 })
    expect(c).not.toContain('ditaklukkan')
    expect(c).not.toContain('#explorer')
  })
})
