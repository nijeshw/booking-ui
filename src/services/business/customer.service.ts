import type { ICustomer, ICustomerExport, ICustomerInput } from '@/interfaces/business/customer.interface'
import { api, withTenant } from '@/services/http'

export default {
  list(slug: string): Promise<ICustomer[]> {
    return api<ICustomer[]>('/tenants/customers', withTenant(slug))
  },

  update(slug: string, id: string, input: ICustomerInput): Promise<ICustomer> {
    return api<ICustomer>(`/tenants/customers/${id}`, withTenant(slug, {
      method: 'PATCH',
      body: JSON.stringify(input),
    }))
  },

  create(slug: string, input: ICustomerInput): Promise<void> {
    return api('/tenants/customers', withTenant(slug, {
      method: 'POST',
      body: JSON.stringify(input),
    }))
  },

  exportCustomer(slug: string, id: string): Promise<ICustomerExport> {
    return api<ICustomerExport>(`/tenants/customers/${id}/export`, withTenant(slug))
  },

  erase(slug: string, id: string): Promise<void> {
    return api(`/tenants/customers/${id}/erase`, withTenant(slug, { method: 'POST' }))
  },
}
