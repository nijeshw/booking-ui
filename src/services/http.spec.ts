import { describe, expect, it } from 'vitest'
import { readApiError, withBookingToken, withTenant } from './http'

describe('readApiError', () => {
  it('returns the server message', () => {
    expect(readApiError({ message: 'Verify your email before creating a business' })).toBe(
      'Verify your email before creating a business',
    )
  })

  it('names invalid fields without echoing the submitted value', () => {
    const message = readApiError({
      message: 'Invalid input',
      fields: ['password'],
    })
    expect(message).toBe('Check password')
    expect(message).not.toContain('secret')
  })

  it('uses a generic message for an empty body', () => {
    expect(readApiError(null)).toBe('Something went wrong')
  })
})

describe('withTenant', () => {
  it('sends the tenant slug in a header', () => {
    const init = withTenant('ada-studio', {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
    })
    const headers = new Headers(init.headers)
    expect(headers.get('x-tenant-slug')).toBe('ada-studio')
    expect(headers.get('content-type')).toBe('application/json')
    expect(init.method).toBe('POST')
  })
})

describe('withBookingToken', () => {
  it('sends the manage token beside the tenant slug', () => {
    const init = withBookingToken('ada-studio', 'manage-token')
    const headers = new Headers(init.headers)
    expect(headers.get('x-tenant-slug')).toBe('ada-studio')
    expect(headers.get('x-booking-token')).toBe('manage-token')
  })
})
