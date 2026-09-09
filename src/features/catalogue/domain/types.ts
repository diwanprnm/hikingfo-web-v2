/**
 * Catalogue domain types. Pure TS — no Vue imports.
 */

export interface MountainSummary {
  id: string
  slug: string
  name: { id: string; en: string }
  peak_height_m: number
  difficulty: number
  region: string
  province: string
  latitude: number
  longitude: number
  photo_url?: string
}

export interface MountainPhoto {
  id: string
  photo_url?: string
  created_at: string
}

export interface MountainProfile {
  mountain: MountainSummary & {
    aliases: string[]
    location: { id: string; en: string }
    peak_name: { id: string; en: string }
    data_meta: Record<string, FieldMeta>
    status: string
  }
  photos: MountainPhoto[]
  routes: Route[]
  basecamps: Basecamp[]
  weather?: WeatherSnapshot
}

export interface Route {
  id: string
  name: { id: string; en: string }
  distance_km: number
  duration_hours: number
  elevation_gain_m: number
  entry_requirements: { id: string; en: string }
}

export interface Basecamp {
  id: string
  name: { id: string; en: string }
  facilities: { id: string; en: string }
  cost_estimate: { id: string; en: string }
  is_permit_point: boolean
  latitude?: number | null
  longitude?: number | null
}

export interface FieldMeta {
  source: string
  reliability: string
  updated_at?: string
}

export interface WeatherSnapshot {
  mountain_id: string
  captured_at: string
  is_live: boolean
  data: Record<string, any>
}

export interface SearchResult {
  items: MountainSummary[]
  total: number
  page: number
  page_size: number
}

export type Region = string

export interface SearchFilter {
  q?: string
  region?: string
  province?: string
  difficulty?: number
  min_height?: number
  max_height?: number
  page?: number
  page_size?: number
}
