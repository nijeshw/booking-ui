import { describe, expect, it } from 'vitest'
import { formatMinor, formatNoticeStamp, formatSlot, formatZonedDateTime, isPublicSlug, priceToMinor, slugify, timeToMinutes, zonedLocalToUtcIso } from './booking'

describe('booking helpers', () => {
  it('builds a public address from a business name', () => {
    expect(slugify('Ada Studio!')).toBe('ada-studio')
    expect(isPublicSlug('ada-studio')).toBe(true)
    expect(isPublicSlug('book')).toBe(false)
    expect(isPublicSlug('a')).toBe(false)
  })

  it('stores prices as minor units and prints them as currency', () => {
    expect(priceToMinor('40.5')).toBe(4050)
    expect(priceToMinor('-1')).toBeNull()
    expect(formatMinor(4050, 'GBP')).toBe('£40.50')
  })

  it('prints a slot in the business timezone', () => {
    expect(formatSlot('2026-01-05T09:00:00.000Z', 'Europe/London')).toBe('09:00')
    expect(formatSlot('2026-07-06T08:00:00.000Z', 'Europe/London')).toBe('09:00')
  })

  it('keeps time off on the business clock', () => {
    expect(formatZonedDateTime('2026-09-30T09:00:00.000Z', 'Europe/London')).toBe('30 Sept 2026, 10:00')
    expect(formatNoticeStamp('2026-09-28T15:28:00.000Z', 'Europe/London')).toBe('28-09-2026 16:28')
    expect(zonedLocalToUtcIso('2026-09-30T09:00', 'Europe/London')).toBe('2026-09-30T08:00:00.000Z')
  })

  it('converts a time field into minutes', () => {
    expect(timeToMinutes('09:30')).toBe(570)
    expect(timeToMinutes('24:00')).toBe(1440)
    expect(timeToMinutes('24:30')).toBeNull()
  })
})
