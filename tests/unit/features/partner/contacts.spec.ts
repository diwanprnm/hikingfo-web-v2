/**
 * T077: contact channels rendered only when match state present.
 * Mirrors the partner UI rule: FullProfile contact fields are rendered only
 * when a mutual match exists (status accepted / matched).
 */
import { describe, it, expect } from 'vitest'

import type { FullProfile, PartnerRequest } from '@/features/partner/domain/types'

const baseProfile: FullProfile = {
  id: 'u-1',
  display_name: 'Alice',
}

const matchedProfile: FullProfile = {
  ...baseProfile,
  email: 'alice@test.local',
  phone: '+62-811',
  whatsapp: '+62-812',
  instagram: '@alice.hikes',
}

/** UI rule under test: contacts render only for an accepted request. */
function canShowContacts(req: Pick<PartnerRequest, 'status'>): boolean {
  return req.status === 'accepted'
}

/** Renders contact channels for a profile given match permission. */
function renderContacts(profile: FullProfile, req: Pick<PartnerRequest, 'status'>): string[] {
  if (!canShowContacts(req)) return []
  const out: string[] = []
  if (profile.whatsapp) out.push(profile.whatsapp)
  if (profile.instagram) out.push(profile.instagram)
  if (profile.email) out.push(profile.email)
  if (profile.phone) out.push(profile.phone)
  return out
}

describe('contact reveal gating (T077)', () => {
  it('no contacts rendered for pending request', () => {
    expect(renderContacts(matchedProfile, { status: 'pending' })).toEqual([])
  })

  it('no contacts rendered for declined/expired request', () => {
    expect(renderContacts(matchedProfile, { status: 'declined' })).toEqual([])
    expect(renderContacts(matchedProfile, { status: 'expired' })).toEqual([])
  })

  it('all channels rendered only when accepted (mutual match)', () => {
    const shown = renderContacts(matchedProfile, { status: 'accepted' })
    expect(shown).toEqual(['+62-812', '@alice.hikes', 'alice@test.local', '+62-811'])
  })

  it('accepted match with sparse profile renders only present channels', () => {
    const shown = renderContacts(baseProfile, { status: 'accepted' })
    expect(shown).toEqual([])
  })
})
