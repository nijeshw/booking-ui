import { defineStore } from 'pinia'
import type { IAdminTenant } from '@/interfaces/business/admin.interface'
import adminService from '@/services/business/admin.service'
import { errorMessage } from '@/utils/error'

export const useAdminStore = defineStore('admin', {
  state: () => ({
    tenants: [] as IAdminTenant[],
    error: '',
    busyId: '',
  }),
  actions: {
    async fetch(): Promise<void> {
      this.error = ''
      try {
        this.tenants = await adminService.list()
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async suspend(id: string): Promise<void> {
      await this.run(id, () => adminService.suspend(id))
    },
    async activate(id: string): Promise<void> {
      await this.run(id, () => adminService.activate(id))
    },
    async issueLogin(id: string): Promise<void> {
      await this.run(id, () => adminService.issueLogin(id))
    },
    async run(id: string, action: () => Promise<void>): Promise<void> {
      this.error = ''
      this.busyId = id
      try {
        await action()
        await this.fetch()
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busyId = ''
      }
    },
  },
})
