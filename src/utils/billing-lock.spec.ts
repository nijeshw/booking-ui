import { describe, expect, it } from 'vitest'
import { lockedBillingRoute, subscriptionLocksApp } from './billing-lock'

describe('subscriptionLocksApp', () => {
  it('locks an overdue or unpaid subscription', () => {
    expect(subscriptionLocksApp('PAST_DUE')).toBe(true)
    expect(subscriptionLocksApp('UNPAID')).toBe(true)
  })

  it('leaves a current subscription open', () => {
    expect(subscriptionLocksApp('ACTIVE')).toBe(false)
    expect(subscriptionLocksApp('TRIALING')).toBe(false)
    expect(subscriptionLocksApp(null)).toBe(false)
  })
})

describe('lockedBillingRoute', () => {
  it('sends every other business page to billing', () => {
    expect(lockedBillingRoute('calendar', 'ada-studio', 'PAST_DUE')).toEqual({
      name: 'billing',
      params: { slug: 'ada-studio' },
    })
  })

  it('stays on billing and on a paid business', () => {
    expect(lockedBillingRoute('billing', 'ada-studio', 'UNPAID')).toBeNull()
    expect(lockedBillingRoute('calendar', 'ada-studio', 'ACTIVE')).toBeNull()
    expect(lockedBillingRoute('calendar', '', 'PAST_DUE')).toBeNull()
  })
})
