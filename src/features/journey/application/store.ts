/**
 * Journey store (Pinia). Manages hike log, posts, and feed state.
 */
import { defineStore } from 'pinia'
import { ref } from 'vue'

import { journeyApi } from '../infrastructure/api'
import type {
  CreatePostPayload,
  FeedFilter,
  FeedItem,
  HikeLogEntry,
  JourneyPost,
  RecordHikePayload,
} from '../domain/types'

export const useJourneyStore = defineStore('journey', () => {
  // Feed
  const feedItems = ref<FeedItem[]>([])
  const feedTotal = ref(0)
  const feedLoading = ref(false)
  const error = ref<string | null>(null)

  // My hikes
  const myHikes = ref<HikeLogEntry[]>([])
  const myHikesTotal = ref(0)
  const myHikesLoading = ref(false)

  // Current post
  const currentPost = ref<JourneyPost | null>(null)
  const currentPostLoading = ref(false)

  // Error code from the last failed feed fetch ('unauthorized' → sign-in prompt)
  const feedErrorCode = ref<string | null>(null)

  async function fetchFeed(filter: FeedFilter = {}) {
    feedLoading.value = true
    error.value = null
    feedErrorCode.value = null
    try {
      const res = await journeyApi.feed(filter)
      feedItems.value = res.items
      feedTotal.value = res.total
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load feed'
      feedErrorCode.value = e.code ?? null
    } finally {
      feedLoading.value = false
    }
  }

  async function fetchFeedItem(id: string) {
    currentPostLoading.value = true
    error.value = null
    try {
      currentPost.value = await journeyApi.feedItem(id) as any
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load post'
    } finally {
      currentPostLoading.value = false
    }
  }

  async function fetchMyHikes(page = 1) {
    myHikesLoading.value = true
    try {
      const res = await journeyApi.myHikes(page)
      myHikes.value = res.items
      myHikesTotal.value = res.total
    } catch (e: any) {
      error.value = e.message ?? 'Failed to load hikes'
    } finally {
      myHikesLoading.value = false
    }
  }

  async function recordHike(payload: RecordHikePayload) {
    const res = await journeyApi.recordHike(payload)
    return res
  }

  async function createPost(payload: CreatePostPayload) {
    const res = await journeyApi.createPost(payload)
    return res
  }

  async function updatePost(id: string, payload: Partial<CreatePostPayload>) {
    const res = await journeyApi.updatePost(id, payload)
    return res
  }

  async function publishPost(id: string) {
    const res = await journeyApi.publishPost(id)
    return res
  }

  async function deletePost(id: string) {
    await journeyApi.deletePost(id)
    feedItems.value = feedItems.value.filter(i => i.id !== id)
  }

  async function deleteHike(id: string) {
    await journeyApi.deleteHike(id)
    myHikes.value = myHikes.value.filter(h => h.id !== id)
  }

  function clearCurrent() {
    currentPost.value = null
  }

  return {
    feedItems, feedTotal, feedLoading, error, feedErrorCode,
    myHikes, myHikesTotal, myHikesLoading,
    currentPost, currentPostLoading,
    fetchFeed, fetchFeedItem, fetchMyHikes,
    recordHike, createPost, updatePost, publishPost,
    deletePost, deleteHike, clearCurrent,
  }
})
