import { defineStore } from 'pinia'
import type { IPublicUser } from '@/interfaces/global/auth.interface'
import authService from '@/services/auth/auth.service'
import { refreshAccessToken, setAccessToken } from '@/services/http'

export const useSessionStore = defineStore('session', {
  state: () => ({
    accessToken: null as string | null,
    user: null as IPublicUser | null,
    ready: false,
  }),
  actions: {
    async bootstrap(): Promise<void> {
      if (this.ready) {
        return
      }
      const data = await refreshAccessToken()
      this.accessToken = data?.accessToken ?? null
      this.user = data?.user ?? null
      this.ready = true
    },
    setUser(user: IPublicUser): void {
      this.user = user
    },
    signedIn(accessToken: string, user: IPublicUser): void {
      this.accessToken = accessToken
      this.user = user
      this.ready = true
      setAccessToken(accessToken)
    },
    async logout(): Promise<void> {
      await authService.logout().catch(() => undefined)
      this.accessToken = null
      this.user = null
      setAccessToken(null)
    },
  },
})
