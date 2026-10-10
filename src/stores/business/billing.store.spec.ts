import { createPinia, setActivePinia } from 'pinia'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import billingService from '@/services/business/billing.service'
import { useBillingStore } from './billing.store'

vi.mock('@/services/business/billing.service', () => ({
  default: {
    subscription: vi.fn(),
    checkout: vi.fn(),
    portal: vi.fn(),
  },
}))

const assign = vi.fn()

describe('billing store', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    assign.mockReset()
    vi.stubGlobal('window', { location: { assign } })
    vi.mocked(billingService.portal).mockReset()
    vi.mocked(billingService.checkout).mockReset()
  })

  it('opens the customer portal', async () => {
    vi.mocked(billingService.portal).mockResolvedValue({
      url: 'https://billing.stripe.test/portal',
    })
    const store = useBillingStore()
    await store.openPortal('ada-studio')
    expect(billingService.portal).toHaveBeenCalledWith('ada-studio')
    expect(assign).toHaveBeenCalledWith('https://billing.stripe.test/portal')
    expect(store.error).toBe('')
    expect(store.busyPortal).toBe(false)
  })

  it('keeps the page in place when the portal cannot open', async () => {
    vi.mocked(billingService.portal).mockRejectedValue(new Error('Subscribe before managing billing'))
    const store = useBillingStore()
    await store.openPortal('ada-studio')
    expect(assign).not.toHaveBeenCalled()
    expect(store.error).toBe('Subscribe before managing billing')
    expect(store.busyPortal).toBe(false)
  })

  it('sends the visitor to checkout for a chosen plan', async () => {
    vi.mocked(billingService.checkout).mockResolvedValue({
      url: 'https://checkout.stripe.test/session',
    })
    const store = useBillingStore()
    await store.checkout('ada-studio', 'basic')
    expect(billingService.checkout).toHaveBeenCalledWith('ada-studio', 'basic')
    expect(assign).toHaveBeenCalledWith('https://checkout.stripe.test/session')
  })
})
