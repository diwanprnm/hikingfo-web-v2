/**
 * Partner store (Pinia).
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'
import { partnerApi } from '../infrastructure/api'
import type { CandidateResult, PartnerNotice, PartnerRequest, RequestFilter, SearchFilter } from '../domain/types'

export const usePartnerStore = defineStore('partner', () => {
  const candidates = ref<CandidateResult[]>([])
  const candidatesTotal = ref(0)
  const searchLoading = ref(false)
  const error = ref<string | null>(null)

  const notices = ref<PartnerNotice[]>([])
  const noticesTotal = ref(0)

  const requests = ref<PartnerRequest[]>([])
  const requestsTotal = ref(0)

  async function search(f: SearchFilter) {
    searchLoading.value = true
    error.value = null
    try {
      const res = await partnerApi.search(f)
      candidates.value = res.items
      candidatesTotal.value = res.total
    } catch (e: any) {
      error.value = e.message ?? 'Search failed'
    } finally {
      searchLoading.value = false
    }
  }

  async function fetchNotices(f: Record<string, any> = {}) {
    try {
      const res = await partnerApi.listNotices(f)
      notices.value = res.items
      noticesTotal.value = res.total
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function fetchRequests(f: RequestFilter = {}) {
    try {
      const res = await partnerApi.listRequests(f)
      requests.value = res.items
      requestsTotal.value = res.total
    } catch (e: any) {
      error.value = e.message
    }
  }

  async function withdrawNotice(id: string) {
    await partnerApi.withdrawNotice(id)
    notices.value = notices.value.filter(n => n.id !== id)
  }

  /** 003 T014: post a "looking for partner" notice. */
  async function createNotice(p: { mountain_id: string; trip_start: string; trip_end: string; note?: string }) {
    return partnerApi.createNotice(p)
  }

  async function acceptRequest(id: string) {
    const res = await partnerApi.acceptRequest(id)
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'accepted'
    return res
  }

  async function declineRequest(id: string) {
    await partnerApi.declineRequest(id)
    const req = requests.value.find(r => r.id === id)
    if (req) req.status = 'declined'
  }

  async function withdrawRequest(id: string) {
    await partnerApi.withdrawRequest(id)
    requests.value = requests.value.filter(r => r.id !== id)
  }

  return {
    candidates, candidatesTotal, searchLoading, error,
    notices, noticesTotal, requests, requestsTotal,
    search, fetchNotices, fetchRequests,
    createNotice, withdrawNotice, acceptRequest, declineRequest, withdrawRequest,
  }
})
