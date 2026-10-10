import { defineStore } from 'pinia'
import type {
  IBrandingInput,
  IHourRange,
  IOnboardingInput,
  IServiceInput,
  IStaff,
  IStaffInput,
  ITimeOffInput,
  IWorkspace,
} from '@/interfaces/business/workspace.interface'
import workspaceService from '@/services/business/workspace.service'
import { errorMessage } from '@/utils/error'

export const useWorkspaceStore = defineStore('workspace', {
  state: () => ({
    workspace: null as IWorkspace | null,
    error: '',
    busy: false,
  }),
  actions: {
    async fetch(slug: string): Promise<void> {
      this.error = ''
      try {
        this.workspace = await workspaceService.get(slug)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async onboard(slug: string, input: IOnboardingInput): Promise<void> {
      this.error = ''
      this.busy = true
      try {
        this.workspace = await workspaceService.onboard(slug, input)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async saveBranding(slug: string, input: IBrandingInput): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.saveBranding(slug, input)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async addService(slug: string, input: IServiceInput): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.addService(slug, input)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async updateService(slug: string, id: string, input: IServiceInput): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.updateService(slug, id, input)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async removeService(slug: string, id: string): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.removeService(slug, id)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async addStaff(slug: string, input: IStaffInput): Promise<IStaff | null> {
      this.busy = true
      this.error = ''
      try {
        const created = await workspaceService.addStaff(slug, input)
        await this.fetch(slug)
        return this.error === '' ? created : null
      } catch (caught) {
        this.error = errorMessage(caught)
        return null
      } finally {
        this.busy = false
      }
    },
    async updateStaff(
      slug: string,
      id: string,
      input: { name: string, serviceIds: string[] },
    ): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.updateStaff(slug, id, input.name)
        await workspaceService.saveStaffServices(slug, id, input.serviceIds)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async removeStaff(slug: string, id: string): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.removeStaff(slug, id)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async saveStaffHours(slug: string, staffId: string, hours: IHourRange[]): Promise<void> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.saveStaffHours(slug, staffId, hours)
        await this.fetch(slug)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async saveHours(slug: string, hours: IHourRange[]): Promise<void> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.saveHours(slug, hours)
        await this.fetch(slug)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async addTimeOff(slug: string, input: ITimeOffInput): Promise<boolean> {
      this.busy = true
      this.error = ''
      try {
        await workspaceService.addTimeOff(slug, input)
        await this.fetch(slug)
        return this.error === ''
      } catch (caught) {
        this.error = errorMessage(caught)
        return false
      } finally {
        this.busy = false
      }
    },
    async removeTimeOff(slug: string, id: string): Promise<void> {
      await workspaceService.removeTimeOff(slug, id)
      await this.fetch(slug)
    },
  },
})
