/**
 * Achievement API adapter.
 */
import { get } from '@/shared/http/client'
import type { UserBadgesView } from '../domain/types'

export const achievementApi = {
  myBadges: () => get<UserBadgesView>('/me/badges'),
}
