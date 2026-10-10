import type { INoticeList } from '@/interfaces/business/notice.interface'
import { api, withTenant } from '@/services/http'

export default {
  list(slug: string, limit: number): Promise<INoticeList> {
    return api<INoticeList>(`/tenants/notices?limit=${limit}`, withTenant(slug))
  },

  read(slug: string, id: string): Promise<INoticeList> {
    return api<INoticeList>(`/tenants/notices/${id}/read`, withTenant(slug, { method: 'POST' }))
  },

  readAll(slug: string): Promise<INoticeList> {
    return api<INoticeList>('/tenants/notices/read-all', withTenant(slug, { method: 'POST' }))
  },
}
