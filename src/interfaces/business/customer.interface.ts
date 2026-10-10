export interface ICustomer {
  id: string
  firstName: string
  lastName: string
  email: string | null
  phone: string | null
}

export interface ICustomerInput {
  firstName: string
  lastName: string
  email?: string
  phone?: string
}

export interface ICustomerExport {
  customer: ICustomer & { notes: string | null; createdAt: string }
  appointments: Array<{
    id: string
    status: string
    startAt: string
    endAt: string
    serviceName: string
    staffName: string
    priceAmountMinor: number
    currency: string
    customerNote: string | null
  }>
}
