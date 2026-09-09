/**
 * Identity domain types. Pure TS — no Vue imports, unit-testable in isolation.
 * Mirrors the backend identity context's public shapes.
 */

export interface MeView {
  id: string
  email: string
  email_verified: boolean
  display_name: string
  avatar_key: string
  home_region: string
  bio: { id: string; en: string } | null
  role: 'member' | 'admin'
  status: 'active' | 'suspended' | 'banned'
  joined_at: string
  distinct_count: number
  experience_level: 'Pemula' | 'Menengah' | 'Lanjut' | 'Ahli'
}

export interface RegisterPayload {
  email: string
  password: string
  display_name: string
}

export interface LoginPayload {
  email: string
  password: string
}

export interface UpdateProfilePayload {
  display_name?: string
  avatar_key?: string
  bio_id?: string
  bio_en?: string
  home_region?: string
}

export interface UpdateContactsPayload {
  phone?: string
  whatsapp?: string
  instagram?: string
}
