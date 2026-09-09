/**
 * Catalogue API adapter.
 */
import { get, post } from '@/shared/http/client'
import type {
  MountainProfile,
  MountainSummary,
  Region,
  SearchFilter,
  SearchResult,
  WeatherSnapshot,
} from '../domain/types'

export const catalogueApi = {
  search: (f: SearchFilter = {}) =>
    get<SearchResult>('/mountains', f as Record<string, string | number>),

  /**
   * 003 US1 — thin type-ahead wrapper. Matches ID/EN name + aliases (server
   * trigram over search_text), published-only, page_size capped ≤10.
   */
  suggestMountains: async (q: string): Promise<MountainSummary[]> => {
    const res = await catalogueApi.search({ q: q.trim() || undefined, page_size: 10 })
    return res.items ?? []
  },

  regions: () => get<{ items: Region[] }>('/regions'),

  profile: (slug: string) => get<MountainProfile>(`/mountains/${slug}`),

  weather: (slug: string) =>
    get<WeatherSnapshot>(`/mountains/${slug}/weather`),

  reportField: (mountainId: string, field: string, reason: string, detail: string) =>
    post(`/mountains/${mountainId}/fields/${field}/reports`, { reason, detail }),
}
