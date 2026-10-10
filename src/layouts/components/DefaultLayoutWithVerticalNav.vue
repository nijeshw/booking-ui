<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useDisplay } from 'vuetify'
import NavAccount from '@/layouts/components/NavAccount.vue'
import NavNotifications from '@/layouts/components/NavNotifications.vue'
import NexoraLogo from '@/layouts/components/NexoraLogo.vue'
import ThemeToggle from '@/layouts/components/ThemeToggle.vue'
import { useWorkspaceStore } from '@/stores/business/workspace.store'
import { useSessionStore } from '@/stores/global/session.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import { subscriptionLocksApp } from '@/utils/billing-lock'

const route = useRoute()
const router = useRouter()
const session = useSessionStore()
const tenants = useTenantStore()
const workspaceStore = useWorkspaceStore()
const { userTenants, permissions } = storeToRefs(tenants)
const { workspace } = storeToRefs(workspaceStore)
const brandSlug = ref('')
const { user } = storeToRefs(session)
const { mdAndUp } = useDisplay()
const drawer = ref(false)

const routeSlug = computed(() => (
  route.path.startsWith('/businesses/') && typeof route.params.slug === 'string'
    ? route.params.slug
    : ''
))

const brand = computed(() => {
  const current = workspace.value
  if (!current?.onboarded || brandSlug.value !== routeSlug.value) {
    return null
  }
  return current.profile
})

const switchItems = computed(() => (
  userTenants.value
    .filter((link) => link.tenant.status === 'ACTIVE' || link.tenant.slug === routeSlug.value)
    .map((link) => ({
      title: `${link.tenant.legalName} · ${link.role.toLowerCase().replaceAll('_', ' ')}`,
      value: link.tenant.slug,
    }))
))

function lockedFor(slug: string): boolean {
  const status = userTenants.value.find((link) => link.tenant.slug === slug)?.subscriptionStatus
  return subscriptionLocksApp(status)
}

const locked = computed(() => routeSlug.value !== '' && lockedFor(routeSlug.value))

const items = computed(() => {
  if (locked.value && routeSlug.value) {
    return [
      { title: 'Billing', to: `/businesses/${routeSlug.value}/billing`, icon: 'mdi-credit-card-outline', exact: true, permission: '', routeName: '' },
    ]
  }
  if (!routeSlug.value) {
    return [
      { title: 'Businesses', to: '/dashboard', icon: 'mdi-domain', exact: true, routeName: '' },
      ...(user.value?.platformRole === 'ADMIN'
        ? [{ title: 'Admin', to: '/admin', icon: 'mdi-shield-account', exact: true, routeName: '' }]
        : []),
    ]
  }
  const slug = routeSlug.value
  const mine = permissions.value.mine
  const role = userTenants.value.find((link) => link.tenant.slug === slug)?.role
  const menu = [
    { title: 'All businesses', to: '/dashboard', icon: 'mdi-domain', exact: true, permission: '' },
    { title: 'Setup', to: `/businesses/${slug}`, icon: 'mdi-cog-outline', exact: true, permission: 'setup.view', routeName: 'workspace' },
    { title: 'Settings', to: `/businesses/${slug}/settings`, icon: 'mdi-tune-variant', exact: true, permission: 'setup.view', routeName: 'settings' },
    { title: 'Access', to: `/businesses/${slug}/access`, icon: 'mdi-account-key-outline', exact: false, permission: 'people.manage', routeName: '' },
    { title: 'Calendar', to: `/businesses/${slug}/calendar`, icon: 'mdi-calendar-month-outline', exact: false, permission: 'calendar.view', routeName: '' },
    { title: 'Customers', to: `/businesses/${slug}/customers`, icon: 'mdi-account-group-outline', exact: false, permission: 'customers.view', routeName: '' },
    { title: 'Reports', to: `/businesses/${slug}/reports`, icon: 'mdi-chart-bar', exact: false, permission: 'reports.view', routeName: '' },
    { title: 'Billing', to: `/businesses/${slug}/billing`, icon: 'mdi-credit-card-outline', exact: false, permission: 'billing.view', routeName: '' },
  ]
  return menu.filter((item) => (
    item.permission === '' || role === 'OWNER' || mine.includes(item.permission)
  ))
})

function switchBusiness(slug: unknown): void {
  if (typeof slug !== 'string' || slug === routeSlug.value) {
    return
  }
  const section = route.path.replace(/^\/businesses\/[^/]+/, '')
  void router.push(`/businesses/${slug}${section}`)
  drawer.value = false
}

async function loadUserTenants(): Promise<void> {
  await tenants.fetchUserTenants(true)
}

async function loadBrand(slug: string): Promise<void> {
  await workspaceStore.fetch(slug)
  if (routeSlug.value === slug && workspace.value?.onboarded) {
    brandSlug.value = slug
  }
}

watch(routeSlug, (slug) => {
  brandSlug.value = ''
  if (slug && userTenants.value.length > 0 && !lockedFor(slug)) {
    void tenants.fetchPermissions(slug)
  }
}, { immediate: true })

watch(userTenants, () => {
  const slug = routeSlug.value
  if (!slug || lockedFor(slug) || permissions.value.catalog.length > 0) {
    return
  }
  void tenants.fetchPermissions(slug)
})

watch([routeSlug, permissions, userTenants], () => {
  const slug = routeSlug.value
  if (!slug || brandSlug.value === slug || lockedFor(slug)) {
    return
  }
  const role = userTenants.value.find((link) => link.tenant.slug === slug)?.role
  const canView = role === 'OWNER' || permissions.value.mine.includes('setup.view')
  if (canView) {
    void loadBrand(slug)
  }
})

onMounted(() => {
  void loadUserTenants()
})
</script>

<template>
  <div class="layout-shell">
    <aside v-show="mdAndUp || drawer" class="layout-vertical-nav">
      <router-link class="nav-brand" to="/dashboard"><NexoraLogo /></router-link>
      <div v-if="brand" class="nav-business">
        <img v-if="brand.logoUrl" :src="brand.logoUrl" alt="" class="nav-logo">
        <div class="nav-business-copy">
          <div class="nav-business-name">{{ brand.name }}</div>
          <p v-if="brand.description">{{ brand.description }}</p>
        </div>
      </div>
      <div v-if="routeSlug" class="nav-switch">
        <v-select
          :model-value="routeSlug"
          :items="switchItems"
          label="Switch business"
          density="compact"
          hide-details
          @update:model-value="switchBusiness"
        />
      </div>
      <v-list>
        <v-list-item
          v-for="item in items"
          :key="item.to"
          :prepend-icon="item.icon"
          :title="item.title"
          :exact="item.exact"
          :to="item.to"
          v-bind="item.routeName ? { active: route.name === item.routeName } : {}"
          rounded="lg"
          @click="drawer = false"
        />
      </v-list>
    </aside>

    <header class="layout-navbar">
      <v-btn v-if="!mdAndUp" icon="mdi-menu" variant="text" @click="drawer = !drawer" />
      <div v-if="brand" class="nav-current">
        <img v-if="brand.logoUrl" :src="brand.logoUrl" :alt="brand.name" class="nav-logo">
        <span v-else>{{ brand.name }}</span>
      </div>
      <v-spacer />
      <NavNotifications v-if="!locked" />
      <ThemeToggle />
      <NavAccount />
    </header>

    <main class="layout-page">
      <slot />
    </main>
  </div>
</template>
