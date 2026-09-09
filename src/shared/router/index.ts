import { createRouter, createWebHistory } from 'vue-router'
import { routes } from './routes'
import { setupAuthGuard } from './guards'

/**
 * App router. Route meta drives the layout zone (public vs authenticated vs admin)
 * and the auth/role guards (task T024). Lazy-load every feature page.
 */
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(to, _from, savedPosition) {
    if (savedPosition) return savedPosition
    if (to.hash) return { el: to.hash, behavior: 'smooth' }
    return { top: 0 }
  },
})

setupAuthGuard(router)

export default router
