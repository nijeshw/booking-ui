export interface IAdminTenant {
  id: string
  slug: string
  legalName: string
  status: string
  timezone: string
  currency: string
  createdAt: string
  planId: string | null
  subscriptionStatus: string | null
  hasDatabaseLogin: boolean
}
