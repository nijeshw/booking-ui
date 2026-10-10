import { DateTime } from 'luxon'

const RESERVED = new Set(['admin', 'api', 'auth', 'book', 'health', 'login', 'register'])

export function slugify(value: string): string {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48)
}

export function isPublicSlug(value: string): boolean {
  return value.length >= 3 && !RESERVED.has(value) && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

export function formatMinor(amountMinor: number, currency: string): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
  }).format(amountMinor / 100)
}

export function priceToMinor(value: string): number | null {
  const amount = Number(value)
  if (!Number.isFinite(amount) || amount < 0 || amount > 100_000) {
    return null
  }
  return Math.round(amount * 100)
}

export function formatSlot(iso: string, timeZone: string): string {
  return DateTime.fromISO(iso, { setZone: true }).setZone(timeZone).toFormat('HH:mm')
}

export function todayInZone(timeZone: string): string {
  return DateTime.now().setZone(timeZone).toISODate() ?? ''
}

export function dayInZone(iso: string, timeZone: string): string {
  return DateTime.fromISO(iso, { setZone: true }).setZone(timeZone).toISODate() ?? ''
}

export function formatShortDate(iso: string): string {
  return DateTime.fromISO(iso, { setZone: true }).setLocale('en-GB').toLocaleString(DateTime.DATE_SHORT)
}

export function formatMediumDateTime(iso: string): string {
  return DateTime.fromISO(iso, { setZone: true })
    .setLocale('en-GB')
    .toLocaleString({ dateStyle: 'medium', timeStyle: 'short' })
}

export function formatZonedDateTime(iso: string, timeZone: string): string {
  return DateTime.fromISO(iso).setZone(timeZone).setLocale('en-GB').toLocaleString({
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

export function formatNoticeStamp(iso: string, timeZone: string): string {
  return DateTime.fromISO(iso).setZone(timeZone).toFormat('dd-MM-yyyy HH:mm')
}

export function zonedLocalToUtcIso(value: string, timeZone: string): string {
  return DateTime.fromISO(value, { zone: timeZone }).toUTC().toISO() ?? ''
}

export function startOfWeek(from: DateTime = DateTime.now()): DateTime {
  const local = from.setLocale('en-GB')
  const mondayOffset = local.weekday === 7 ? -6 : 1 - local.weekday
  return local.startOf('day').plus({ days: mondayOffset })
}

export function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const rest = minutes % 60
  return `${String(hours).padStart(2, '0')}:${String(rest).padStart(2, '0')}`
}

export function timeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value)
  if (!match) {
    return null
  }
  const hours = Number(match[1])
  const minutes = Number(match[2])
  if (hours > 24 || minutes > 59 || (hours === 24 && minutes !== 0)) {
    return null
  }
  return hours * 60 + minutes
}

export const WEEKDAYS = [
  { weekday: 1, label: 'Monday' },
  { weekday: 2, label: 'Tuesday' },
  { weekday: 3, label: 'Wednesday' },
  { weekday: 4, label: 'Thursday' },
  { weekday: 5, label: 'Friday' },
  { weekday: 6, label: 'Saturday' },
  { weekday: 0, label: 'Sunday' },
] as const
