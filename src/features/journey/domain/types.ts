/**
 * Journey domain types. Pure TS — no Vue imports.
 */

export interface HikeLogEntry {
  id: string
  mountain_id: string
  mountain?: { id: string; name: { id: string; en: string }; slug: string }
  route_id?: string
  climb_date: string
  evidence_photo_keys: string[]
  status: 'verified' | 'unverified' | 'disputed' | 'removed'
  published_post_id?: string
  created_at: string
  updated_at: string
}

export interface JourneyPost {
  id: string
  user_id: string
  author?: { id: string; display_name: string; avatar_url?: string }
  mountain_id: string
  mountain?: { id: string; name: { id: string; en: string }; slug: string; region: string }
  route_id?: string
  title: string
  summary: Record<string, any>
  narrative: string
  photo_keys: string[]
  visibility: 'published' | 'draft'
  moderation_status: 'visible' | 'under_review' | 'hidden'
  published_at?: string
  updated_at: string
}

export interface FeedFilter {
  mountain_id?: string
  region?: string
  page?: number
  page_size?: number
}

export interface FeedResult {
  items: FeedItem[]
  total: number
}

export interface FeedItem {
  id: string
  title: string
  summary: Record<string, any>
  mountain: { id: string; name: { id: string; en: string }; slug: string; region: string }
  author: { id: string; display_name: string; avatar_url?: string }
  published_at: string
  updated_at: string
}

export interface RecordHikePayload {
  mountain_id: string
  route_id?: string
  climb_date: string
  evidence_photo_keys: string[]
  title?: string
  summary?: Record<string, any>
  narrative?: string
  photo_keys?: string[]
  visibility?: 'published' | 'draft'
}

export interface CreatePostPayload {
  mountain_id: string
  route_id?: string
  title: string
  summary: Record<string, any>
  narrative: string
  photo_keys: string[]
  visibility: 'published' | 'draft'
}

export interface UploadResult {
  key: string
  url: string
}
