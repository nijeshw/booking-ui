export interface IPublicUser {
  id: string
  email: string
  name: string | null
  emailVerified: boolean
  platformRole: 'NONE' | 'ADMIN'
}

export interface IAuthResponse {
  accessToken: string
  user: IPublicUser
}
