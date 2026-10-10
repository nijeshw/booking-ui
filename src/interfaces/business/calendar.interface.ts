export interface IAppointment {
  id: string
  startAt: string
  endAt: string
  service: { name: string }
  staff: { name: string }
  customer: { firstName: string; lastName: string }
}

export interface ICalendarWorkspace {
  profile?: { timezone: string }
}
