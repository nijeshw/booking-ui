import type { IAppointment, ICalendarWorkspace } from '@/interfaces/business/calendar.interface'
import { api, withTenant } from '@/services/http'

export default {
  workspace(slug: string): Promise<ICalendarWorkspace> {
    return api<ICalendarWorkspace>('/tenants/workspace', withTenant(slug))
  },

  list(slug: string, from: string, to: string): Promise<IAppointment[]> {
    const params = new URLSearchParams({ from, to })
    return api<IAppointment[]>(`/tenants/calendar?${params.toString()}`, withTenant(slug))
  },

  cancel(slug: string, id: string): Promise<void> {
    return api(`/tenants/appointments/${id}/cancel`, withTenant(slug, { method: 'POST' }))
  },
}
