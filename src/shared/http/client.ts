/**
 * Typed HTTP client for the hikingfo API. Wraps fetch with uniform error
 * handling, JSON serialisation, and the API's error shape.
 *
 * Every feature's infrastructure/ adapter imports this client rather than
 * calling fetch directly.
 */

// ---- Error shape (contracts/api.md → Conventions → Error shape) ----------

export interface ApiError {
  code: string
  message: string
  fields?: Record<string, string>
}

export class ApiRequestError extends Error {
  readonly status: number
  readonly code: string
  readonly fields?: Record<string, string>

  constructor(status: number, body: ApiError) {
    super(body.message)
    this.name = 'ApiRequestError'
    this.status = status
    this.code = body.code
    this.fields = body.fields
  }
}

// ---- Client --------------------------------------------------------------

type Method = 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE'

interface RequestOptions {
  method?: Method
  body?: unknown
  query?: Record<string, string | number | undefined>
  headers?: Record<string, string>
}

// ---- CSRF ----------------------------------------------------------------

/**
 * Reads the session-scoped CSRF cookie (set by the API on authenticated
 * requests) and echoes it in the X-CSRF-Token header on mutating requests.
 */
export function csrfToken(): string {
  const m = document.cookie.match(/(?:^|;\s*)hikingfo_csrf=([^;]*)/)
  return m ? decodeURIComponent(m[1]) : ''
}

/**
 * Request sends an API call and returns the parsed JSON body. Throws
 * ApiRequestError on non-2xx responses matching the uniform error shape.
 */
export async function request<T = unknown>(
  path: string,
  opts: RequestOptions = {},
): Promise<T> {
  const { method = 'GET', body, query, headers: extra } = opts

  const url = new URL(`/api/v1${path}`, window.location.origin)
  if (query) {
    for (const [k, v] of Object.entries(query)) {
      if (v !== undefined && v !== '') url.searchParams.set(k, String(v))
    }
  }

  const init: RequestInit = {
    method,
    credentials: 'include', // send cookies (session auth)
    headers: {
      Accept: 'application/json',
      ...extra,
    },
  }

  if (body !== undefined) {
    init.headers = {
      ...init.headers,
      'Content-Type': 'application/json',
    }
    init.body = JSON.stringify(body)
  }

  if (method !== 'GET') {
    const token = csrfToken()
    if (token) init.headers = { ...init.headers, 'X-CSRF-Token': token }
  }

  const res = await fetch(url, init)

  // 204 No Content (deletes)
  if (res.status === 204) return undefined as T

  const text = await res.text()
  // Bodies that are not JSON (stale-server plain 404, proxy HTML) must not
  // throw SyntaxError — surface them as HTTP <status> instead.
  let data: unknown = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = null
    }
  }

  if (!res.ok) {
    const err: ApiError = (data as { error?: ApiError })?.error ?? {
      code: 'internal',
      message: `HTTP ${res.status}`,
    }
    throw new ApiRequestError(res.status, err)
  }

  return data as T
}

// Convenience helpers

export const get = <T>(path: string, query?: RequestOptions['query']) =>
  request<T>(path, { method: 'GET', query })

export const post = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'POST', body })

export const patch = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PATCH', body })

export const put = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'PUT', body })

export const del = <T>(path: string, body?: unknown) =>
  request<T>(path, { method: 'DELETE', body })
