import type { RouteRecordRaw } from 'vue-router'

/**
 * Route table for hikingfo. Lazy feature imports keep the bundle split per feature.
 * `meta.zone` drives the layout and guards:
 *  - public    → any visitor (e.g. catalogue browse/detail, community feed)
 *  - auth      → session required (record-my-hike, partner search, profile, notifications)
 *  - admin     → session + admin role required
 */
export const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('@/shared/layout/AppLayout.vue'),
    children: [
      // Catalogue (US1)
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

      // Journey (US2) — 004: signed-in only.
      {
        path: 'journeys',
        name: 'journeys',
        component: () => import('@/features/journey/ui/pages/JourneyFeedPage.vue'),
        meta: { zone: 'auth', title: 'journeys' },
      },
      {
        path: 'journeys/:id',
        name: 'journey-detail',
        component: () => import('@/features/journey/ui/pages/JourneyFeedPage.vue'),
        meta: { zone: 'auth', title: 'journey-detail' },
      },
      {
        path: 'me/hikes',
        name: 'my-hikes',
        component: () => import('@/features/journey/ui/pages/MyHikesPage.vue'),
        meta: { zone: 'auth', title: 'my-hikes' },
      },
      {
        path: 'me/hikes/record',
        name: 'record-hike',
        component: () => import('@/features/journey/ui/pages/RecordHikePage.vue'),
        meta: { zone: 'auth', title: 'record-hike' },
      },
      {
        path: 'me/journeys/new',
        name: 'journey-new',
        component: () => import('@/features/journey/ui/pages/JourneyEditorPage.vue'),
        meta: { zone: 'auth', title: 'journey-new' },
      },
      {
        path: 'me/journeys/:id/edit',
        name: 'journey-edit',
        component: () => import('@/features/journey/ui/pages/JourneyEditorPage.vue'),
        meta: { zone: 'auth', title: 'journey-edit' },
      },

      // Achievement (US3)
      {
        path: 'me/badges',
        name: 'my-badges',
        component: () => import('@/features/achievement/ui/pages/BadgeListPage.vue'),
        meta: { zone: 'auth', title: 'my-badges' },
      },

      // Share (US4)
      {
        path: 'me/share',
        name: 'share',
        component: () => import('@/features/achievement/ui/share/ShareGenerator.vue'),
        meta: { zone: 'auth', title: 'share' },
      },

      // Partner (US5)
      {
        path: 'partners/search',
        name: 'partner-search',
        component: () => import('@/features/partner/ui/pages/PartnerSearchPage.vue'),
        meta: { zone: 'auth', title: 'partner-search' },
      },
      {
        path: 'me/partner-requests',
        name: 'partner-requests',
        component: () => import('@/features/partner/ui/pages/PartnerRequestsPage.vue'),
        meta: { zone: 'auth', title: 'partner-requests' },
      },

      // Notifications
      {
        path: 'me/notifications',
        name: 'notifications',
        component: () => import('@/features/notification/ui/pages/NotificationsPage.vue'),
        meta: { zone: 'auth', title: 'notifications' },
      },

      // Identity
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

      // Admin (US4) — zone admin; guards.ts enforces session.isAdmin
      {
        path: 'admin',
        component: () => import('@/features/admin/ui/AdminShell.vue'),
        meta: { zone: 'admin' },
        children: [
          {
            path: '',
            name: 'admin-mountains',
            component: () => import('@/features/admin/ui/AdminMountainsPage.vue'),
            meta: { zone: 'admin', title: 'admin.mountains' },
          },
          {
            path: 'mountains/:id',
            name: 'admin-mountain-edit',
            component: () => import('@/features/admin/ui/AdminMountainEditPage.vue'),
            meta: { zone: 'admin', title: 'admin.mountains' },
          },
          {
            path: 'moderation',
            name: 'admin-moderation',
            component: () => import('@/features/admin/ui/AdminModerationPage.vue'),
            meta: { zone: 'admin', title: 'admin.moderation' },
          },
          {
            path: 'badges',
            name: 'admin-badges',
            component: () => import('@/features/admin/ui/AdminBadgesPage.vue'),
            meta: { zone: 'admin', title: 'admin.badges' },
          },
          {
            path: 'users',
            name: 'admin-users',
            component: () => import('@/features/admin/ui/AdminUsersStatsPage.vue'),
            meta: { zone: 'admin', title: 'admin.users' },
          },
          {
            path: 'stats',
            name: 'admin-stats',
            component: () => import('@/features/admin/ui/AdminUsersStatsPage.vue'),
            meta: { zone: 'admin', title: 'admin.stats' },
          },
        ],
      },

      // 404
      {
        path: ':pathMatch(.*)*',
        name: 'not-found',
        component: () => import('@/shared/ui/NotFoundPage.vue'),
        meta: { zone: 'public', title: 'not-found' },
      },
    ],
  },
]
