import type { IReport } from '@/interfaces/business/report.interface'
import { api, withTenant } from '@/services/http'

export default {
  summary(slug: string, from: string, to: string): Promise<IReport> {
    const params = new URLSearchParams({ from, to })
    return api<IReport>(`/tenants/reports?${params.toString()}`, withTenant(slug))
  },
}
