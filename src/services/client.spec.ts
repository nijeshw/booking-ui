import { afterEach, describe, expect, it, vi } from 'vitest'
import { apiBaseUrl } from './client'

afterEach(() => {
  vi.unstubAllEnvs()
})

describe('apiBaseUrl', () => {
  it('returns the configured API URL', () => {
    vi.stubEnv('VITE_API_URL', 'http://localhost:3000')
    expect(apiBaseUrl()).toBe('http://localhost:3000')
  })

  it('rejects a missing API URL', () => {
    vi.stubEnv('VITE_API_URL', '')
    expect(() => apiBaseUrl()).toThrow('VITE_API_URL is not set')
  })
})
