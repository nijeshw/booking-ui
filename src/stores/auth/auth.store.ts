import { defineStore } from 'pinia'
import type { IAuthResponse } from '@/interfaces/global/auth.interface'
import authService from '@/services/auth/auth.service'

export const useAuthStore = defineStore('auth', {
  actions: {
    login(email: string, password: string): Promise<IAuthResponse> {
      return authService.login(email, password)
    },
    register(name: string, email: string, password: string): Promise<void> {
      return authService.register(name, email, password)
    },
    forgotPassword(email: string): Promise<void> {
      return authService.forgotPassword(email)
    },
    resetPassword(token: string, password: string): Promise<void> {
      return authService.resetPassword(token, password)
    },
    verifyEmail(token: string): Promise<void> {
      return authService.verifyEmail(token)
    },
    resendVerification(email: string): Promise<void> {
      return authService.resendVerification(email)
    },
  },
})
