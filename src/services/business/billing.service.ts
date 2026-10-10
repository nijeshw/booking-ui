import type { IBilling, ICheckoutSession } from '@/interfaces/business/billing.interface'
import { api, withTenant } from '@/services/http'

export default {
  subscription(slug: string): Promise<IBilling> {
    return api<IBilling>('/billing/subscription', withTenant(slug))
  },

  checkout(slug: string, planId: string): Promise<ICheckoutSession> {
    return api<ICheckoutSession>('/billing/checkout', withTenant(slug, {
      method: 'POST',
      body: JSON.stringify({ planId }),
    }))
  },
}
