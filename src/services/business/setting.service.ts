import type { ISettingCatalog, SettingValue } from '@/interfaces/business/setting.interface'
import { api, withTenant } from '@/services/http'

export default {
  get(slug: string): Promise<ISettingCatalog> {
    return api<ISettingCatalog>('/tenants/settings', withTenant(slug))
  },

  save(slug: string, values: Record<string, SettingValue>): Promise<ISettingCatalog> {
    return api<ISettingCatalog>('/tenants/settings', withTenant(slug, {
      method: 'PUT',
      body: JSON.stringify({ values }),
    }))
  },
}
