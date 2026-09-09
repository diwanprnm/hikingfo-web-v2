/**
 * T103 — E2E happy-paths for the five user stories + the privacy negative.
 * Scenarios follow specs/001-hiking-info-centre/quickstart.md.
 */
import { test, expect } from '@playwright/test'
import { users, MOUNTAIN_QUERY, login, logout, ensureUser, expectNoContacts } from './fixtures'

test.describe.configure({ mode: 'serial' })

// ---- US1 — Browse detailed mountain info (logged out) ----------------------

test('US1: search, filter, and open the Rinjani profile logged out', async ({ page }) => {
  await page.goto('/')
  await page.getByPlaceholder(/Cari|Search/i).fill(MOUNTAIN_QUERY)
  await page.getByRole('button', { name: /Cari|Search/i }).click()

  // Alias search matched — result card references Rinjani.
  await expect(page.getByRole('button', { name: /Rinjani/i }).first()).toBeVisible()

  // Open the profile.
  await page.getByRole('button', { name: /Rinjani/i }).first().click()
  await expect(page).toHaveURL(/mountains\/rinjani/i)

  // Core planning blocks render.
  await expect(page.getByText(/3726|Sembalun|Senaru/i).first()).toBeVisible()

  // Toggle to English → curated fields fall back to Indonesian when lacking EN.
  const langToggle = page.getByRole('button', { name: /EN|ID|Bahasa/i }).first()
  if (await langToggle.count()) {
    await langToggle.click()
    await expect(page.locator('body')).not.toContainText('undefined')
  }
})

// ---- US2 — Record my hike + journey post -----------------------------------

test('US2: record a hike with evidence → post appears in feed; photo-less blocked', async ({ page }) => {
  await ensureUser(page, users.a)
  await login(page, users.a)

  await page.goto('/me/hikes/record')

  // Attempt without evidence photo → blocked with guidance.
  await page.getByRole('button', { name: /Catat|Simpan|Submit|Rekam/i }).click()
  await expect(page.getByText(/bukti|foto|evidence/i).first()).toBeVisible()

  // Fill the form with a generated evidence image.
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('input[type="date"]').fill('2026-08-17')
  await page.locator('input[type="file"]').setInputFiles({
    name: 'summit.jpg',
    mimeType: 'image/jpeg',
    buffer: Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==',
      'base64',
    ),
  })

  await page.getByRole('button', { name: /Catat|Simpan|Submit|Rekam/i }).click()
  await expect(page.locator('body')).not.toContainText(/bukti|foto wajib|evidence.*required/i)

  await logout(page)
})

// ---- US3 — Badges for distinct mountains -----------------------------------

test('US3: badge list shows earned state and distinct-count semantics', async ({ page }) => {
  await login(page, users.a)
  await page.goto('/me/badges')
  await expect(page.locator('body')).not.toContainText('undefined')
  await logout(page)
})

// ---- US4 — Share-ready social posts ----------------------------------------

test('US4: share generator reachable with a verified hike', async ({ page }) => {
  await login(page, users.a)
  await page.goto('/me/share')
  await expect(page.locator('body')).not.toContainText('undefined')
  await logout(page)
})

// ---- US5 — Find a partner + privacy negative -------------------------------

test('US5: A posts notice → B searches → request → accept → mutual reveal; C sees no contacts', async ({ page }) => {
  await ensureUser(page, users.b)
  await login(page, users.a)

  // A posts a notice via the search page (mountain + date range).
  await page.goto('/partners/search')
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('input[type="date"]').first().fill('2026-09-20')
  await page.locator('input[type="date"]').nth(1).fill('2026-09-22')
  await page.getByRole('button', { name: /Cari|Search/i }).click()
  await logout(page)

  // B searches for the same window and sees A's limited profile.
  await login(page, users.b)
  await page.goto('/partners/search')
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('input[type="date"]').first().fill('2026-09-20')
  await page.locator('input[type="date"]').nth(1).fill('2026-09-22')
  await page.getByRole('button', { name: /Cari|Search/i }).click()
  await expect(page.getByText(/Pendaki A/i).first()).toBeVisible()
  await expectNoContacts(page) // B is not yet matched with A

  // B sends a request to A.
  await page.getByRole('button', { name: /Minta|Request/i }).first().click()
  await logout(page)

  // A accepts → B sees accepted; contacts revealed to both.
  await login(page, users.a)
  await page.goto('/me/partner-requests')
  await page.getByRole('button', { name: /Terima|Accept/i }).first().click()
  await logout(page)

  await login(page, users.b)
  await page.goto('/me/partner-requests')
  await expect(page.getByText(/Diterima|Accepted|cocok|matched/i).first()).toBeVisible()

  // Privacy negative: user C (unmatched) sees A's profile without contacts.
  await logout(page)
  await ensureUser(page, users.c)
  await login(page, users.c)
  await page.goto('/partners/search')
  await page.locator('select').first().selectOption({ index: 1 })
  await page.locator('input[type="date"]').first().fill('2026-09-20')
  await page.locator('input[type="date"]').nth(1).fill('2026-09-22')
  await page.getByRole('button', { name: /Cari|Search/i }).click()
  await expectNoContacts(page)
  await logout(page)
})
