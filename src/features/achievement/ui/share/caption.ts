/**
 * Caption generation for share cards. Uses verified data only.
 * T074: caption.ts
 */

export interface ShareData {
  mountainName: string
  badgeName?: string
  distinctCount: number
  hikeDate?: string
  distanceKm?: number
}

/**
 * Generates a share caption with hashtags from verified data.
 */
export function generateCaption(data: ShareData): string {
  const lines: string[] = []

  if (data.badgeName) {
    lines.push(`🏅 ${data.badgeName}`)
  }

  lines.push(`🏔️ ${data.mountainName}`)

  if (data.distinctCount > 0) {
    lines.push(`📊 ${data.distinctCount} gunung ditaklukkan`)
  }

  if (data.hikeDate) {
    lines.push(`📅 ${data.hikeDate}`)
  }

  lines.push('')
  lines.push('#hikingfo #pendakian #gunungindonesia #hiking #mountains')

  if (data.distinctCount >= 5) lines.push('#explorer')
  if (data.distinctCount >= 25) lines.push('#mountainchampion')

  return lines.join('\n')
}
