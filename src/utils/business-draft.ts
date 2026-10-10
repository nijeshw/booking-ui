import type { IBusinessDraft } from '@/interfaces/tenant/tenant.interface'

const KEY = 'nx-business-draft'

export function saveBusinessDraft(draft: IBusinessDraft): void {
  localStorage.setItem(KEY, JSON.stringify(draft))
}

export function readBusinessDraft(): IBusinessDraft | null {
  const raw = localStorage.getItem(KEY)
  if (!raw) {
    return null
  }
  try {
    const value = JSON.parse(raw) as Partial<IBusinessDraft>
    if (!value.legalName || !value.slug) {
      return null
    }
    return {
      legalName: value.legalName,
      slug: value.slug,
      phone: value.phone ?? '',
      addressLine1: value.addressLine1 ?? '',
      city: value.city ?? '',
      postcode: value.postcode ?? '',
      country: value.country ?? 'GB',
    }
  } catch {
    return null
  }
}

export function clearBusinessDraft(): void {
  localStorage.removeItem(KEY)
}
