/**
 * Partner domain types.
 */

export interface PartnerNotice {
  id: string
  user_id: string
  mountain_id: string
  mountain?: { id: string; name: { id: string; en: string }; slug: string }
  trip_start: string
  trip_end: string
  note: string
  status: 'open' | 'matched' | 'expired' | 'withdrawn'
  expires_at: string
  created_at: string
}

export interface PartnerRequest {
  id: string
  from_user_id: string
  to_user_id: string
  from_user?: LimitedProfile
  to_user?: LimitedProfile
  mountain_id: string
  mountain?: { id: string; name: { id: string; en: string }; slug: string }
  trip_start: string
  trip_end: string
  message: string
  status: 'pending' | 'accepted' | 'declined' | 'expired' | 'withdrawn'
  matched_at?: string
  created_at: string
  expires_at: string
}

export interface LimitedProfile {
  id: string
  display_name: string
  avatar_url?: string
  experience_level?: { key: string; name: { id: string; en: string } }
  home_region?: string
  bio?: { id: string; en: string }
}

export interface FullProfile extends LimitedProfile {
  email?: string
  phone?: string
  whatsapp?: string
  instagram?: string
}

export interface CandidateResult {
  user: LimitedProfile
  relevance: number
  notice_id: string
  trip_start: string
  trip_end: string
}

export interface SearchFilter {
  mountain_id?: string
  trip_start?: string
  trip_end?: string
  page?: number
  page_size?: number
}

export interface RequestFilter {
  direction?: 'sent' | 'received'
  status?: string
  page?: number
  page_size?: number
}
