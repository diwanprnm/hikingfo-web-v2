/**
 * Partner API adapter.
 */
import { get, post, del } from '@/shared/http/client'
import type { CandidateResult, PartnerNotice, PartnerRequest, RequestFilter, SearchFilter } from '../domain/types'

export const partnerApi = {
  search: (f: SearchFilter) =>
    get<{ items: CandidateResult[]; total: number }>('/partners/search', f as Record<string, string | number>),

  createNotice: (p: { mountain_id: string; trip_start: string; trip_end: string; note?: string }) =>
    post<{ id: string; status: string }>('/partners/notices', p),

  listNotices: (f: Record<string, any> = {}) =>
    get<{ items: PartnerNotice[]; total: number }>('/partners/notices', f),

  withdrawNotice: (id: string) => del(`/partners/notices/${id}`),

  sendRequest: (p: { to_user_id: string; mountain_id: string; trip_start: string; trip_end: string; notice_id?: string; message?: string }) =>
    post<{ id: string; status: string }>('/partners/requests', p),

  listRequests: (f: RequestFilter = {}) =>
    get<{ items: PartnerRequest[]; total: number }>('/partners/requests', f as Record<string, string | number>),

  acceptRequest: (id: string) => post<{ ok: boolean; matched: boolean }>(`/partners/requests/${id}/accept`),

  declineRequest: (id: string) => post<{ ok: boolean }>(`/partners/requests/${id}/decline`),

  withdrawRequest: (id: string) => del(`/partners/requests/${id}`),

  /** Contacts of the counterpart — only served for a mutual accepted match. */
  revealRequest: (id: string) =>
    post<{ email: string; phone: string; whatsapp: string; instagram: string }>(`/partners/requests/${id}/reveal`),
}
