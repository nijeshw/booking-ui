import type { IAdminTenant } from '@/interfaces/business/admin.interface'
import { api } from '@/services/http'

export default {
  list(): Promise<IAdminTenant[]> {
    return api<IAdminTenant[]>('/admin/tenants')
  },

  suspend(id: string): Promise<void> {
    return api(`/admin/tenants/${id}/suspend`, { method: 'POST' })
  },

  activate(id: string): Promise<void> {
    return api(`/admin/tenants/${id}/activate`, { method: 'POST' })
  },

  issueLogin(id: string): Promise<void> {
    return api(`/admin/tenants/${id}/database-login`, { method: 'POST' })
  },
}
