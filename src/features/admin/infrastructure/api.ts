/**
 * Admin API adapter — one file covering every admin endpoint (contracts §9).
 * All routes are role-guarded server-side; the router also enforces zone:admin.
 */
import { get, patch, post, put, del } from '@/shared/http/client'

// ---- shapes (loose — admin UI renders whatever the API returns) ------------

export interface AdminMountain {
  id: string
  slug: string
  name: { id: string; en: string }
  aliases: string[] | null
  region: string
  province: string
  location: { id: string; en: string }
  latitude: number
  longitude: number
  peak_name: { id: string; en: string }
  peak_height_m: number
  difficulty: number
  status: string
  data_meta: Record<string, { source: string; reliability: string }>
  photo_url?: string | null
}

export interface AdminRoute {
  id: string
  mountain_id: string
  name: { id: string; en: string }
  distance_km: number
  duration_hours: number
  elevation_gain_m: number
  entry_requirements: { id: string; en: string }
}

export interface AdminBasecamp {
  id: string
  mountain_id: string
  name: { id: string; en: string }
  facilities: { id: string; en: string }
  cost_estimate: { id: string; en: string }
  is_permit_point: boolean
  latitude?: number | null
  longitude?: number | null
}

export interface AdminEditLogEntry {
  id: string
  admin_id: string
  entity_type: string // mountain | route | basecamp
  entity_id: string
  mountain_id: string
  action: string // create | update | delete | photo_set | photo_remove
  reason: string
  detail: Record<string, unknown> | null
  created_at: string
}

export interface AdminGalleryPhoto {
  id: string
  photo_url?: string
  created_at: string
}

export interface AdminProfileView {
  mountain: AdminMountain
  photos?: AdminGalleryPhoto[] | null
  routes: AdminRoute[] | null
  basecamps: AdminBasecamp[] | null
}

export interface AdminReport {
  id: string
  target_type: string
  target_id: string
  field_ref?: string
  reason: string
  detail?: string
  status: string
  resolution?: string
  created_at: string
}

export interface AdminBadgeConfig {
  id: string
  key: string
  threshold: number
  name: { id: string; en: string }
  description: { id: string; en: string }
  icon_key: string
  sort_order: number
  active: boolean
}

export interface AdminUser {
  id: string
  email: string
  display_name: string
  role: string
  status: string
  joined_at: string
}

// ---- mountains -------------------------------------------------------------

export const adminMountainsApi = {
  list: () => get<{ items: AdminMountain[] }>('/admin/mountains'),
  get: (id: string) => get<AdminMountain>(`/admin/mountains/${id}`),
  profile: (id: string) => get<AdminProfileView>(`/admin/mountains/${id}/profile`),
  create: (body: Record<string, unknown>) => post<AdminMountain>('/admin/mountains', body),
  update: (id: string, body: Record<string, unknown>) => patch<AdminMountain>(`/admin/mountains/${id}`, body),
  remove: (id: string) => del(`/admin/mountains/${id}`),
  revisions: (id: string) => get<{ items: Array<{ ID: string; reason: string; created_at: string }>; }>(`/admin/mountains/${id}/revisions`),
  rollback: (id: string, rev: string) => post(`/admin/mountains/${id}/revisions/${rev}/rollback`),
  addRoute: (id: string, body: Record<string, unknown>) => post(`/admin/mountains/${id}/routes`, body),
  updateRoute: (rid: string, body: Record<string, unknown>) => patch<AdminRoute>(`/admin-routes/${rid}`, body),
  deleteRoute: (rid: string, reason?: string) => del(`/admin-routes/${rid}`, { reason }),
  addBasecamp: (id: string, body: Record<string, unknown>) => post(`/admin/mountains/${id}/basecamps`, body),
  updateBasecamp: (bid: string, body: Record<string, unknown>) => patch<AdminBasecamp>(`/admin-basecamps/${bid}`, body),
  deleteBasecamp: (bid: string, reason?: string) => del(`/admin-basecamps/${bid}`, { reason }),

  // 002 — cover photo + attribution trail
  setPhoto: (id: string, key: string, reason?: string) =>
    put<AdminMountain>(`/admin/mountains/${id}/photo`, { key, reason }),
  removePhoto: (id: string, reason?: string) =>
    del<{ ok: boolean }>(`/admin/mountains/${id}/photo`, { reason }),
  editLog: (id: string) => get<{ items: AdminEditLogEntry[] }>(`/admin/mountains/${id}/edit-log`),

  // 004 US3 — curated gallery (add/delete per mountain, server logs both)
  addGalleryPhoto: (id: string, key: string) =>
    post<{ id: string }>(`/admin/mountains/${id}/photos`, { photo_key: key }),
  deleteGalleryPhoto: (id: string, photoId: string) =>
    del(`/admin/mountains/${id}/photos/${photoId}`),

  // Multipart upload → {key, url} (same endpoint journey uses; raw fetch,
  // no Content-Type so the browser sets the multipart boundary).
  uploadFile: async (file: File): Promise<{ key: string; url: string }> => {
    const form = new FormData()
    form.append('file', file)
    const m = document.cookie.match(/(?:^|;\s*)hikingfo_csrf=([^;]*)/)
    const res = await fetch('/api/v1/uploads', {
      method: 'POST',
      credentials: 'include',
      headers: m ? { 'X-CSRF-Token': decodeURIComponent(m[1]) } : undefined,
      body: form,
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      throw new Error(data?.error?.message ?? `Upload failed: ${res.status}`)
    }
    return res.json()
  },
}

// ---- moderation queue ------------------------------------------------------

export const adminReportsApi = {
  list: (status = 'open') =>
    get<{ items: AdminReport[] }>('/admin/queue/reports', { status }),
  resolve: (id: string, action: string, resolution: string) =>
    patch<AdminReport>(`/admin/queue/reports/${id}`, { action, resolution }),
  summary: () => get<{ reports: Record<string, number> }>('/admin/queue/summary'),
}

// ---- badge configs ---------------------------------------------------------

export const adminBadgesApi = {
  list: () => get<{ items: AdminBadgeConfig[] }>('/admin/badge-configs'),
  upsert: (body: Record<string, unknown>) => post<AdminBadgeConfig>('/admin/badge-configs', body),
}

// ---- users & stats ---------------------------------------------------------

export const adminUsersApi = {
  get: (id: string) => get<AdminUser>(`/admin/users/${id}`),
  setStatus: (id: string, status: string) => patch<AdminUser>(`/admin/users/${id}`, { status }),
}

export const adminStatsApi = {
  get: () => get<{ mountains: { total: number; complete: number }; reports: Record<string, number> }>('/admin/stats'),
}
