import { defineStore } from 'pinia'
import type {
  IBusinessUser,
  ICreateTenantInput,
  IPermissionSettings,
  IUserTenant,
} from '@/interfaces/tenant/tenant.interface'
import tenantService from '@/services/tenant/tenant.service'
import { errorMessage } from '@/utils/error'

export const useTenantStore = defineStore('tenant', {
  state: () => ({
    userTenants: [] as IUserTenant[],
    people: [] as IBusinessUser[],
    permissions: {
      mine: [] as string[],
      catalog: [] as IPermissionSettings['catalog'],
      roles: [] as IPermissionSettings['roles'],
    },
    loading: true,
    busy: false,
    error: '',
  }),
  actions: {
    async fetchUserTenants(quiet = false): Promise<void> {
      if (!quiet) {
        this.loading = true
        this.error = ''
      }
      try {
        this.userTenants = await tenantService.list()
      } catch (caught) {
        if (!quiet) {
          this.error = errorMessage(caught)
        }
      } finally {
        if (!quiet) {
          this.loading = false
        }
      }
    },
    async create(input: ICreateTenantInput): Promise<string | null> {
      this.error = ''
      this.busy = true
      try {
        const tenant = await tenantService.create(input)
        return tenant.slug
      } catch (caught) {
        this.error = errorMessage(caught)
        return null
      } finally {
        this.busy = false
      }
    },
    async fetchPermissions(slug: string): Promise<string> {
      try {
        this.permissions = await tenantService.permissions(slug)
        return ''
      } catch (caught) {
        this.permissions = { mine: [], catalog: [], roles: [] }
        return errorMessage(caught)
      }
    },
    async savePermissions(
      slug: string,
      role: string,
      keys: string[],
    ): Promise<string> {
      this.busy = true
      try {
        await tenantService.savePermissions(slug, role, keys)
        return await this.fetchPermissions(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async createRole(slug: string, label: string): Promise<string> {
      this.busy = true
      try {
        await tenantService.createRole(slug, label)
        return await this.fetchPermissions(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async deleteRole(slug: string, role: string): Promise<string> {
      this.busy = true
      try {
        await tenantService.deleteRole(slug, role)
        return await this.fetchPermissions(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async fetchPeople(slug: string): Promise<string> {
      try {
        this.people = await tenantService.listUsers(slug)
        return ''
      } catch (caught) {
        return errorMessage(caught)
      }
    },
    async grant(
      slug: string,
      input: { name: string, email: string, role: string },
    ): Promise<string> {
      this.busy = true
      try {
        await tenantService.grant(slug, input)
        return await this.fetchPeople(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async updatePerson(
      slug: string,
      input: { email: string, name: string, nextEmail: string, role: string },
    ): Promise<string> {
      this.busy = true
      try {
        await tenantService.updateUser(slug, input)
        return await this.fetchPeople(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
    async removePerson(slug: string, email: string): Promise<string> {
      this.busy = true
      try {
        await tenantService.removeUser(slug, email)
        return await this.fetchPeople(slug)
      } catch (caught) {
        return errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
  },
})
