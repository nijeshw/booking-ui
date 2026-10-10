export interface IHourRange {
  weekday: number
  startMinute: number
  endMinute: number
}

export interface IService {
  id: string
  name: string
  durationMinutes: number
  priceAmountMinor: number
  currency: string
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  active: boolean
}

export interface IStaff {
  id: string
  name: string
  email: string | null
  active: boolean
  serviceIds: string[]
}

export interface ITimeOff {
  id: string
  staffId: string | null
  startsAt: string
  endsAt: string
  reason: string | null
}

export interface IWorkspaceReady {
  onboarded: true
  profile: {
    name: string
    category: string
    timezone: string
    currency: string
    description: string | null
    logoUrl: string | null
    brandColor: string | null
  }
  services: IService[]
  staff: IStaff[]
  hours: IHourRange[]
  staffHours: { staffId: string; hours: IHourRange[] }[]
  timeOff: ITimeOff[]
}

export type IWorkspace = { onboarded: false } | IWorkspaceReady

export interface IBrandingInput {
  name: string
  description: string
  logoUrl: string
  brandColor: string
}

export interface IOnboardingInput {
  name: string
  category: string
  locationType: 'PHYSICAL' | 'MOBILE' | 'ONLINE'
  timezone: string
  currency: string
  country: string
  email?: string
  phone?: string
  addressLine1?: string
  city?: string
  postcode?: string
  hours: IHourRange[]
  service: {
    name: string
    durationMinutes: number
    priceAmountMinor: number
    currency: string
    bufferBeforeMinutes: number
    bufferAfterMinutes: number
    active: boolean
  }
}

export interface IServiceInput {
  name: string
  durationMinutes: number
  priceAmountMinor: number
  currency: string
  bufferBeforeMinutes: number
  bufferAfterMinutes: number
  active: boolean
}

export interface IStaffInput {
  name: string
  serviceIds: string[]
}

export interface ITimeOffInput {
  startsAt: string
  endsAt: string
  reason?: string
}
