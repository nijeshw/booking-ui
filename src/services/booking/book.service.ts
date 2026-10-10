import type {
  IBookInput,
  IBookProfile,
  IBookSlot,
  IManagedBooking,
  IRescheduleInput,
} from '@/interfaces/booking/book.interface'
import { api, withBookingToken, withTenant } from '@/services/http'

export default {
  profile(slug: string): Promise<IBookProfile> {
    return api<IBookProfile>('/book/profile', withTenant(slug))
  },

  slots(slug: string, params: URLSearchParams, token?: string): Promise<IBookSlot[]> {
    const init = token ? withBookingToken(slug, token) : withTenant(slug)
    return api<IBookSlot[]>(`/book/slots?${params.toString()}`, init)
  },

  book(slug: string, input: IBookInput): Promise<void> {
    return api('/book/appointments', withTenant(slug, {
      method: 'POST',
      body: JSON.stringify(input),
    }))
  },

  manage(slug: string, token: string): Promise<IManagedBooking> {
    return api<IManagedBooking>('/book/manage', withBookingToken(slug, token))
  },

  cancel(slug: string, token: string): Promise<void> {
    return api('/book/manage/cancel', withBookingToken(slug, token, { method: 'POST' }))
  },

  reschedule(slug: string, token: string, input: IRescheduleInput): Promise<IManagedBooking> {
    return api<IManagedBooking>('/book/manage/reschedule', withBookingToken(slug, token, {
      method: 'POST',
      body: JSON.stringify(input),
    }))
  },
}
