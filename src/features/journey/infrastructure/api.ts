/**
 * Journey API adapter.
 */
import { get, post, patch, del, csrfToken } from '@/shared/http/client'
import type {
  CreatePostPayload,
  FeedFilter,
  FeedResult,
  FeedItem,
  HikeLogEntry,
  RecordHikePayload,
  UploadResult,
} from '../domain/types'

export const journeyApi = {
  // Hike log
  recordHike: (p: RecordHikePayload) =>
    post<{ id: string; status: string }>('/hikes', p),

  myHikes: (page = 1, pageSize = 20) =>
    get<{ items: HikeLogEntry[]; total: number }>('/me/hikes', { page, page_size: pageSize }),

  myHike: (id: string) => get<HikeLogEntry>(`/me/hikes/${id}`),

  deleteHike: (id: string) => del(`/me/hikes/${id}`),

  // Journey posts
  createPost: (p: CreatePostPayload) =>
    post<{ id: string }>('/me/journeys', p),

  updatePost: (id: string, p: Partial<CreatePostPayload>) =>
    patch<{ id: string }>(`/me/journeys/${id}`, p),

  publishPost: (id: string) =>
    post<{ ok: boolean }>(`/me/journeys/${id}/publish`),

  deletePost: (id: string) => del(`/me/journeys/${id}`),

  // Feed
  feed: (f: FeedFilter = {}) =>
    get<FeedResult>('/journeys', f as Record<string, string | number>),

  feedItem: (id: string) => get<FeedItem>(`/journeys/${id}`),

  reportPost: (id: string, reason: string, detail: string) =>
    post(`/journeys/${id}/reports`, { reason, detail }),

  // Upload
  upload: async (file: File): Promise<UploadResult> => {
    const form = new FormData()
    form.append('file', file)
    const headers: Record<string, string> = {}
    const token = csrfToken()
    if (token) headers['X-CSRF-Token'] = token
    const res = await fetch('/api/v1/uploads', {
      method: 'POST',
      credentials: 'include',
      headers,
      body: form,
    })
    if (!res.ok) throw new Error(`Upload failed: ${res.status}`)
    return res.json()
  },
}
