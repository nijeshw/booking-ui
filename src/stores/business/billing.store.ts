import { defineStore } from 'pinia'
import type { IBilling } from '@/interfaces/business/billing.interface'
import billingService from '@/services/business/billing.service'
import { errorMessage } from '@/utils/error'

export const useBillingStore = defineStore('billing', {
  state: () => ({
    billing: null as IBilling | null,
    error: '',
    busyPlan: '',
    busyPortal: false,
  }),
  actions: {
    async fetch(slug: string): Promise<void> {
      this.error = ''
      try {
        this.billing = await billingService.subscription(slug)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async checkout(slug: string, planId: string): Promise<void> {
      this.error = ''
      this.busyPlan = planId
      try {
        const session = await billingService.checkout(slug, planId)
        window.location.assign(session.url)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busyPlan = ''
      }
    },
    async openPortal(slug: string): Promise<void> {
      this.error = ''
      this.busyPortal = true
      try {
        const session = await billingService.portal(slug)
        window.location.assign(session.url)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busyPortal = false
      }
    },
  },
})
