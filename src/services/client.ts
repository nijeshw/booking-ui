export function apiBaseUrl(): string {
  const url = import.meta.env.VITE_API_URL
  if (typeof url !== 'string' || url.length === 0) {
    throw new Error('VITE_API_URL is not set')
  }
  return url
}
