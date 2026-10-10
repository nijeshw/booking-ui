export interface IReportGroup {
  id: string
  name: string
  bookings: number
  revenueAmountMinor: number
}

export interface IReport {
  currency: string
  bookings: number
  cancelled: number
  noShows: number
  revenueAmountMinor: number
  advanced: boolean
  byService: IReportGroup[]
  byStaff: IReportGroup[]
}
