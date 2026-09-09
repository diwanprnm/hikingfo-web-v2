/**
 * Identity API adapter. Maps use-case inputs to HTTP calls and returns
 * domain types. The only file in the identity feature that touches the
 * network layer.
 */
import { get, patch, post, put } from '@/shared/http/client'
import type {
  LoginPayload,
  MeView,
  RegisterPayload,
  UpdateContactsPayload,
  UpdateProfilePayload,
} from '../domain/types'

export const identityApi = {
  register: (p: RegisterPayload) =>
    post<{ id: string; email: string; display_name: string }>(
      '/auth/register',
      p,
    ),

  login: (p: LoginPayload) => post<unknown>('/auth/login', p),

  googleLogin: (credential: string) =>
    post<unknown>('/auth/google', { credential }),

  logout: () => post<unknown>('/auth/logout'),

  verifyEmail: (token: string) =>
    post<unknown>('/auth/verify-email', { token }),

  forgotPassword: (email: string) =>
    post<unknown>('/auth/forgot-password', { email }),

  resetPassword: (token: string, newPassword: string) =>
    post<unknown>('/auth/reset-password', {
      token,
      new_password: newPassword,
    }),

  me: () => get<MeView>('/auth/me'),

  updateProfile: (p: UpdateProfilePayload) =>
    patch<unknown>('/me/profile', p),

  updateContacts: (p: UpdateContactsPayload) =>
    put<unknown>('/me/contacts', p),
}
