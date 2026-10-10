import { computed, watch, type ComputedRef } from 'vue'
import { useRoute, useRouter, type RouteLocationRaw } from 'vue-router'

export function useTabRoute(
  routeName: string,
  allowed: ComputedRef<readonly string[]>,
  ready: ComputedRef<boolean> = computed(() => true),
): { tab: ComputedRef<string>; tabTo: (value: string) => RouteLocationRaw } {
  const route = useRoute()
  const router = useRouter()

  const tab = computed((): string => {
    const value = typeof route.params.tab === 'string' ? route.params.tab : ''
    if (allowed.value.includes(value)) {
      return value
    }
    return allowed.value[0] ?? ''
  })

  function tabTo(value: string): RouteLocationRaw {
    return {
      name: routeName,
      params: { slug: String(route.params.slug ?? ''), tab: value },
    }
  }

  watch(
    [() => route.params.tab, allowed, ready],
    () => {
      if (!ready.value) {
        return
      }
      const value = typeof route.params.tab === 'string' ? route.params.tab : ''
      const next = allowed.value[0] ?? ''
      if (!next || allowed.value.includes(value)) {
        return
      }
      void router.replace({
        name: routeName,
        params: { slug: route.params.slug, tab: next },
        query: route.query,
      })
    },
    { immediate: true },
  )

  return { tab, tabTo }
}
