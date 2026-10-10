import type {
  IBusinessUser,
  ICreateTenantInput,
  IPermissionSettings,
  IUserTenant,
} from '@/interfaces/tenant/tenant.interface'
import { api, withTenant } from '@/services/http'

export default {
  list(): Promise<IUserTenant[]> {
    return api<IUserTenant[]>('/tenants')
  },

  create(input: ICreateTenantInput): Promise<{ slug: string }> {
    return api<{ slug: string }>('/tenants', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  listUsers(slug: string): Promise<IBusinessUser[]> {
    return api<IBusinessUser[]>('/tenants/user-tenants', withTenant(slug))
  },

  permissions(slug: string): Promise<IPermissionSettings> {
    return api<IPermissionSettings>('/tenants/permissions', withTenant(slug))
  },

  savePermissions(
    slug: string,
    role: string,
    permissions: string[],
  ): Promise<{ status: string }> {
    return api<{ status: string }>('/tenants/permissions', withTenant(slug, {
      method: 'PUT',
      body: JSON.stringify({ role, permissions }),
    }))
  },

  grant(
    slug: string,
    input: { name: string, email: string, role: string },
  ): Promise<IBusinessUser> {
    return api<IBusinessUser>('/tenants/user-tenants', withTenant(slug, {
      method: 'POST',
      body: JSON.stringify(input),
    }))
  },

  updateUser(
    slug: string,
    input: { email: string, name: string, nextEmail: string, role: string },
  ): Promise<IBusinessUser> {
    return api<IBusinessUser>('/tenants/user-tenants', withTenant(slug, {
      method: 'PUT',
      body: JSON.stringify(input),
    }))
  },

  removeUser(slug: string, email: string): Promise<{ status: string }> {
    return api<{ status: string }>('/tenants/user-tenants', withTenant(slug, {
      method: 'DELETE',
      body: JSON.stringify({ email }),
    }))
  },

  createRole(slug: string, label: string): Promise<IPermissionSettings['roles'][number]> {
    return api<IPermissionSettings['roles'][number]>('/tenants/roles', withTenant(slug, {
      method: 'POST',
      body: JSON.stringify({ label }),
    }))
  },

  deleteRole(slug: string, role: string): Promise<{ status: string }> {
    return api<{ status: string }>(`/tenants/roles/${encodeURIComponent(role)}`, withTenant(slug, {
      method: 'DELETE',
    }))
  },
}
