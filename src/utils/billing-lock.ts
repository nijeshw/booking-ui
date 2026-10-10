export function subscriptionLocksApp(status: string | null | undefined): boolean {
  return status === 'PAST_DUE' || status === 'UNPAID'
}

export function lockedBillingRoute(
  name: unknown,
  slug: string,
  status: string | null | undefined,
): { name: 'billing', params: { slug: string } } | null {
  if (!slug || name === 'billing' || !subscriptionLocksApp(status)) {
    return null
  }
  return { name: 'billing', params: { slug } }
}
