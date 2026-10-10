export interface IBookService {
  id: string
  name: string
  durationMinutes: number
  priceAmountMinor: number
  currency: string
}

export interface IBookStaff {
  id: string
  name: string
  serviceIds: string[]
}

export interface IBookProfile {
  name: string
  category: string
  timezone: string
  description: string | null
  logoUrl: string | null
  brandColor: string | null
  services: IBookService[]
  staff: IBookStaff[]
  policy: {
    allowAnyStaff: boolean
    requireCustomerEmail: boolean
    requireCustomerPhone: boolean
  }
  page: Record<string, boolean | number | string>
}

export interface IBookSlot {
  startAt: string
  endAt: string
  staffId: string
  staffName: string
}

export interface IBookInput {
  serviceId: string
  staffId: string
  startAt: string
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface IManagedBooking {
  status: string
  startAt: string
  endAt: string
  serviceId: string
  serviceName: string
  staffId: string
  staffName: string
  customerFirstName: string
  timezone: string
  canCancel: boolean
  canReschedule: boolean
}

export interface IRescheduleInput {
  startAt: string
  staffId: string
}
