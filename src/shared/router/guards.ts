/**
 * Router navigation guards. Reads route meta.zone to enforce auth and admin
 * access. The session store is lazily imported to avoid circular deps.
 */
import type { Router } from 'vue-router'
import { useSessionStore } from '@/features/identity/application/session'

export function setupAuthGuard(router: Router) {
  router.beforeEach(async (to) => {
    const zone = to.meta.zone as string | undefined
    if (!zone || zone === 'public') return true

    const session = useSessionStore()

    // Bootstrap: if we haven't fetched the user yet, try to restore the session
    // from the httpOnly cookie (first load after page refresh).
    if (!session.user && !session.loading) {
      await session.fetchUser()
    }

    if (zone === 'auth' && !session.isAuthenticated) {
      return { name: 'login', query: { redirect: to.fullPath } }
    }

    if (zone === 'admin' && !session.isAdmin) {
      return { name: 'not-found' }
    }

    return true
  })
}
