export interface IUserTenant {
  role: string
  status: string
  subscriptionStatus: string | null
  tenant: {
    slug: string
    legalName: string
    status: string
    email: string | null
    phone: string | null
    addressLine1: string | null
    city: string | null
    postcode: string | null
    country: string | null
  }
}

export interface IBusinessUser {
  email: string
  name: string | null
  role: string
  status: string
}

export interface IPermissionCatalogItem {
  key: string
  label: string
}

export interface IRolePermissions {
  role: string
  label: string
  system: boolean
  locked: boolean
  permissions: string[]
}

export interface IPermissionSettings {
  mine: string[]
  catalog: IPermissionCatalogItem[]
  roles: IRolePermissions[]
}

export interface ICreateTenantInput {
  legalName: string
  slug: string
  timezone: string
  currency: string
  email: string
  phone: string
  addressLine1: string
  city: string
  postcode: string
  country: string
}

export interface IBusinessDraft {
  legalName: string
  slug: string
  phone: string
  addressLine1: string
  city: string
  postcode: string
  country: string
}
