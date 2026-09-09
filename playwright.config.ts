import { defineConfig, devices } from '@playwright/test'

/**
 * Playwright config for the hikingfo E2E suite (task T103).
 *
 * The suite targets a running full stack (compose up: API on :8080, SPA on
 * :5173 proxied to the API) seeded via `backend/migrations/seed`. Run:
 *   docker compose up -d
 *   cd backend && make seed   (or go run ./cmd/seed)
 *   cd frontend && npm run test:e2e
 */
export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false, // stories share seeded state (users A/B/C)
  workers: 1,
  retries: process.env.CI ? 1 : 0,
  reporter: 'list',
  timeout: 30_000,
  use: {
    baseURL: process.env.E2E_BASE_URL ?? 'http://localhost:5173',
    trace: 'retain-on-failure',
    locale: 'id-ID',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
})
