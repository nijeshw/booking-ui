import { defineStore } from 'pinia'
import type { ICustomer, ICustomerExport, ICustomerInput } from '@/interfaces/business/customer.interface'
import customerService from '@/services/business/customer.service'
import { errorMessage } from '@/utils/error'

export const useCustomerStore = defineStore('customer', {
  state: () => ({
    customers: [] as ICustomer[],
    error: '',
    busy: false,
  }),
  actions: {
    async fetch(slug: string): Promise<void> {
      this.error = ''
      try {
        this.customers = await customerService.list(slug)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async update(slug: string, id: string, input: ICustomerInput): Promise<boolean> {
      this.error = ''
      this.busy = true
      try {
        await customerService.update(slug, id, input)
        await this.fetch(slug)
        return true
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async create(slug: string, input: ICustomerInput): Promise<boolean> {
      this.error = ''
      this.busy = true
      try {
        await customerService.create(slug, input)
        await this.fetch(slug)
        return true
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async exportCustomer(slug: string, id: string): Promise<ICustomerExport | null> {
      this.error = ''
      try {
        return await customerService.exportCustomer(slug, id)
      } catch (caught) {
        this.error = errorMessage(caught)
        return null
      }
    },
    async erase(slug: string, id: string): Promise<boolean> {
      this.error = ''
      this.busy = true
      try {
        await customerService.erase(slug, id)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
  },
})