import type { IAuthResponse, IPublicUser } from '@/interfaces/global/auth.interface'
import { api } from '@/services/http'

export default {
  login(email: string, password: string): Promise<IAuthResponse> {
    return api<IAuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    })
  },

  register(name: string, email: string, password: string): Promise<void> {
    return api('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    })
  },

  forgotPassword(email: string): Promise<void> {
    return api('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  resetPassword(token: string, password: string): Promise<void> {
    return api('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, password }),
    })
  },

  verifyEmail(token: string): Promise<void> {
    return api('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    })
  },

  resendVerification(email: string): Promise<void> {
    return api('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    })
  },

  updateProfile(name: string): Promise<IPublicUser> {
    return api<IPublicUser>('/auth/me', {
      method: 'PATCH',
      body: JSON.stringify({ name }),
    })
  },

  logout(): Promise<void> {
    return api('/auth/logout', { method: 'POST' })
  },
}
