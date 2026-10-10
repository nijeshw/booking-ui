export interface IPlan {
  id: string
  name: string
  monthlyAmountMinor: number
  currency: string
  purchasable: boolean
}

export interface IBilling {
  canManage: boolean
  subscription: {
    planId: string
    planName: string
    monthlyAmountMinor: number
    currency: string
    status: string
    trialEndsAt: string | null
    currentPeriodEnd: string | null
    cancelAtPeriodEnd: boolean
  } | null
  plans: IPlan[]
}

export interface ICheckoutSession {
  url: string
}
