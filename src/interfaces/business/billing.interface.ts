export interface IPlan {
  id: string
  name: string
  monthlyAmountMinor: number
  currency: string
  purchasable: boolean
}

export interface IBilling {
  canManage: boolean
  canOpenPortal: boolean
  stripe: {
    card: { brand: string; last4: string } | null
    renewal: { amountMinor: number; currency: string; at: string | null } | null
    invoices: Array<{
      id: string
      number: string | null
      status: string
      amountMinor: number
      currency: string
      createdAt: string
      hostedUrl: string | null
    }>
  } | null
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
