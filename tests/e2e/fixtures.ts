/**
 * T103 helpers: seed-aware fixtures for the E2E stories.
 *
 * The seeded stack (compose up + migrations/seed) provides:
 *  - admin@hikingfo.local / Admin123!  (role admin, from 0007_seed_admin.sql)
 *  - user A / user B / user C          (created via the public register flow
 *                                       by ensureUser below — deterministic
 *                                       emails so reruns reuse the accounts)
 */
import { expect, type Page } from '@playwright/test'

export const MOUNTAIN_QUERY = 'Rinjani'

export const users = {
  a: { email: 'e2e-a@hikingfo.local', password: 'E2ePass123!', name: 'E2E Pendaki A' },
  b: { email: 'e2e-b@hikingfo.local', password: 'E2ePass123!', name: 'E2E Pendaki B' },
  c: { email: 'e2e-c@hikingfo.local', password: 'E2ePass123!', name: 'E2E Pendaki C' },
  admin: { email: 'admin@hikingfo.local', password: 'Admin123!', name: 'Admin Hikingfo' },
}

/** Register a user through the UI; tolerant of "already exists" conflicts. */
export async function ensureUser(page: Page, u: { email: string; password: string; name: string }) {
  await page.goto('/auth/register')
  // The register page may already be implemented with these i18n labels.
  const email = page.getByLabel(/Email/i).or(page.locator('input[type="email"]'))
  await email.first().fill(u.email)
  await page.locator('input[type="password"]').first().fill(u.password)
  const nameInput = page.getByLabel(/Nama|Name/i)
  if (await nameInput.count()) await nameInput.first().fill(u.name)
  await page.getByRole('button', { name: /Daftar|Register/i }).click()
  await page.waitForTimeout(500)
  await page.context().clearCookies() // stay logged out after registering
}

/** Log in through the UI and wait for the session to be established. */
export async function login(page: Page, u: { email: string; password: string }) {
  await page.goto('/auth/login')
  await page.locator('input[type="email"]').fill(u.email)
  await page.locator('input[type="password"]').first().fill(u.password)
  await page.getByRole('button', { name: /Masuk|Login/i }).click()
  await page.waitForTimeout(500)
}

export async function logout(page: Page) {
  await page.context().clearCookies()
}

/** Assert the privacy invariant: the page body never leaks contact channels. */
export async function expectNoContacts(page: Page) {
  const body = await page.locator('body').innerText()
  for (const forbidden of [/whatsapp/i, /instagram/i, /@[a-z0-9.-]+\.(com|co|id|net)/, /\+62/]) {
    expect(body, `contact channel leaked: ${forbidden}`).not.toMatch(forbidden)
  }
}
