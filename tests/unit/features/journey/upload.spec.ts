/**
 * T016 (004 US2): upload must carry X-CSRF-Token — the missing header was the
 * root cause of both broken photo flows (research R1/R2).
 */
import { describe, it, expect, afterEach, vi } from 'vitest'

import { journeyApi } from '@/features/journey/infrastructure/api'

function setCsrf(value: string) {
  document.cookie = `hikingfo_csrf=${value}; path=/`
}

function firstCallInit(fetchMock: ReturnType<typeof vi.fn>): RequestInit {
  return (fetchMock.mock.calls as unknown as Array<[string, RequestInit]>)[0][1]
}

describe('journeyApi.upload CSRF header', () => {
  afterEach(() => {
    setCsrf('')
    vi.unstubAllGlobals()
  })

  it('sends X-CSRF-Token from the hikingfo_csrf cookie', async () => {
    setCsrf('tok-abc')
    const fetchMock = vi.fn(async () =>
      Response.json({ key: 'uploads/x.png', url: 'https://blob/x.png' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await journeyApi.upload(new File(['x'], 'x.png', { type: 'image/png' }))

    const init = firstCallInit(fetchMock)
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBe('tok-abc')
    expect(init.credentials).toBe('include')
  })

  it('omits the header when no csrf cookie is set', async () => {
    setCsrf('')
    const fetchMock = vi.fn(async () =>
      Response.json({ key: 'uploads/y.png', url: 'https://blob/y.png' }),
    )
    vi.stubGlobal('fetch', fetchMock)

    await journeyApi.upload(new File(['y'], 'y.png', { type: 'image/png' }))

    const init = firstCallInit(fetchMock)
    expect((init.headers as Record<string, string>)['X-CSRF-Token']).toBeUndefined()
  })

  it('throws on non-2xx so callers surface the failure (SC-004)', async () => {
    setCsrf('tok-abc')
    vi.stubGlobal(
      'fetch',
      vi.fn(async () => new Response('{"error":{}}', { status: 403 })),
    )
    await expect(
      journeyApi.upload(new File(['z'], 'z.png', { type: 'image/png' })),
    ).rejects.toThrow('403')
  })
})
