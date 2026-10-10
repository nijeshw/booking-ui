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
import { api, withTenant } from '@/services/http'

function tenant<T>(slug: string, path: string, init: RequestInit = {}): Promise<T> {
  return api<T>(`/tenants${path}`, withTenant(slug, init))
}

export default {
  get(slug: string): Promise<IWorkspace> {
    return tenant<IWorkspace>(slug, '/workspace')
  },

  onboard(slug: string, input: IOnboardingInput): Promise<IWorkspace> {
    return tenant<IWorkspace>(slug, '/onboarding', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  saveBranding(slug: string, input: IBrandingInput): Promise<IWorkspace> {
    return tenant<IWorkspace>(slug, '/profile', {
      method: 'PUT',
      body: JSON.stringify(input),
    })
  },

  addService(slug: string, input: IServiceInput): Promise<void> {
    return tenant(slug, '/services', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateService(slug: string, id: string, input: IServiceInput): Promise<void> {
    return tenant(slug, `/services/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(input),
    })
  },

  removeService(slug: string, id: string): Promise<void> {
    return tenant(slug, `/services/${id}`, { method: 'DELETE' })
  },

  addStaff(slug: string, input: IStaffInput): Promise<IStaff> {
    return tenant<IStaff>(slug, '/staff', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  updateStaff(slug: string, id: string, name: string): Promise<void> {
    return tenant(slug, `/staff/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
  },

  saveStaffServices(slug: string, id: string, serviceIds: string[]): Promise<void> {
    return tenant(slug, `/staff/${id}/services`, {
      method: 'PUT',
      body: JSON.stringify({ serviceIds }),
    })
  },

  removeStaff(slug: string, id: string): Promise<void> {
    return tenant(slug, `/staff/${id}`, { method: 'DELETE' })
  },

  saveStaffHours(slug: string, staffId: string, hours: IHourRange[]): Promise<void> {
    return tenant(slug, `/staff/${staffId}/hours`, {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    })
  },

  saveHours(slug: string, hours: IHourRange[]): Promise<void> {
    return tenant(slug, '/hours', {
      method: 'PUT',
      body: JSON.stringify({ hours }),
    })
  },

  addTimeOff(slug: string, input: ITimeOffInput): Promise<void> {
    return tenant(slug, '/time-off', {
      method: 'POST',
      body: JSON.stringify(input),
    })
  },

  removeTimeOff(slug: string, id: string): Promise<void> {
    return tenant(slug, `/time-off/${id}`, { method: 'DELETE' })
  },
}
