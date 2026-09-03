import type { RouteRecordRaw } from 'vue-router'

/**
 * Route table for hikingfo. Lazy feature imports keep the bundle split per feature.
 * `meta.zone` drives the layout and guards:
 *  - public    → any visitor (e.g. catalogue browse/detail, community feed)
 *  - auth      → session required (record-my-hike, partner search, profile, notifications)
 *  - admin     → session + admin role required
 * Empty/placeholder feature pages are wired in their own phases (T024, T037+ etc.).
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/shared/layout/AppLayout.vue'),
    children: [
      {
        path: '',
        name: 'home',
        component: () => import('@/features/catalogue/ui/pages/MountainListPage.vue'),
        meta: { zone: 'public', title: 'home' },
      },
      {
        path: 'mountains/:slug',
        name: 'mountain-detail',
        component: () => import('@/features/catalogue/ui/pages/MountainDetailPage.vue'),
        meta: { zone: 'public', title: 'mountain-detail' },
      },
      {
        path: 'journeys',
        name: 'journeys',
        component: () => import('@/features/journey/ui/pages/JourneyFeedPage.vue'),
        meta: { zone: 'public', title: 'journeys' },
      },
      {
        path: 'auth/login',
        name: 'login',
        component: () => import('@/features/identity/ui/pages/LoginPage.vue'),
        meta: { zone: 'public', title: 'login' },
      },
      {
        path: 'auth/register',
        name: 'register',
        component: () => import('@/features/identity/ui/pages/RegisterPage.vue'),
        meta: { zone: 'public', title: 'register' },
      },
      {
        path: 'me/profile',
        name: 'my-profile',
        component: () => import('@/features/identity/ui/pages/ProfilePage.vue'),
        meta: { zone: 'auth', title: 'my-profile' },
      },
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/shared/ui/NotFoundPage.vue'),
        meta: { zone: 'public', title: 'not-found' },
      },
    ],
  },
]