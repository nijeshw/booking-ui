import type { IAuthResponse } from '@/interfaces/global/auth.interface'
import { apiBaseUrl } from './client'

export const TENANT_SLUG_HEADER = 'x-tenant-slug'
export const BOOKING_TOKEN_HEADER = 'x-booking-token'

let accessToken: string | null = null

export function withTenant(slug: string, init: RequestInit = {}): RequestInit {
  const headers = new Headers(init.headers)
  headers.set(TENANT_SLUG_HEADER, slug)
  return { ...init, headers }
}

export function withBookingToken(slug: string, token: string, init: RequestInit = {}): RequestInit {
  const next = withTenant(slug, init)
  const headers = new Headers(next.headers)
  headers.set(BOOKING_TOKEN_HEADER, token)
  return { ...next, headers }
}

export function setAccessToken(token: string | null): void {
  accessToken = token
}

export function readApiError(body: unknown): string {
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const message = body.message
    if (typeof message === 'string' && message.length > 0 && message !== 'Invalid input') {
      return message
    }
    if (message === 'Invalid input' && 'fields' in body && Array.isArray(body.fields)) {
      const fields = body.fields.filter((field) => typeof field === 'string')
      if (fields.length > 0) {
        return `Check ${fields.join(', ')}`
      }
    }
  }
  return 'Something went wrong'
}

export async function api<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers)
  if (init.body !== undefined && !headers.has('content-type')) {
    headers.set('content-type', 'application/json')
  }
  if (accessToken) {
    headers.set('authorization', `Bearer ${accessToken}`)
  }

  const response = await fetch(`${apiBaseUrl()}${path}`, {
    ...init,
    headers,
    credentials: 'include',
  })

  if (response.status === 401 && retry && !path.startsWith('/auth/')) {
    const refreshed = await refreshAccessToken()
    if (refreshed) {
      return api<T>(path, init, false)
    }
  }

  if (!response.ok) {
    const body: unknown = await response.json().catch(() => null)
    throw new Error(readApiError(body))
  }

  if (response.status === 204) {
    return undefined as T
  }
  return (await response.json()) as T
}

export async function refreshAccessToken(): Promise<IAuthResponse | null> {
  try {
    const data = await api<IAuthResponse>('/auth/refresh', { method: 'POST' }, false)
    setAccessToken(data.accessToken)
    return data
  } catch {
    setAccessToken(null)
    return null
  }
}
