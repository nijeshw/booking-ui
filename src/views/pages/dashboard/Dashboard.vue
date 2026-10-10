<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted } from 'vue'
import NexoraLogo from '@/layouts/components/NexoraLogo.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useSessionStore } from '@/stores/global/session.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import { subscriptionLocksApp } from '@/utils/billing-lock'

const session = useSessionStore()
const auth = useAuthStore()
const tenants = useTenantStore()
const { userTenants: businesses, error, loading } = storeToRefs(tenants)

const greeting = computed(() => (
  session.user?.name ? `Hello, ${session.user.name}` : 'Your businesses'
))

function mark(name: string): string {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

function roleLabel(role: string): string {
  return role
    .toLowerCase()
    .split('_')
    .filter((part) => part.length > 0)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

async function load(): Promise<void> {
  await tenants.fetchUserTenants()
}

async function resend(): Promise<void> {
  if (!session.user) {
    return
  }
  await auth.resendVerification(session.user.email)
  error.value = 'Verification link sent. In development, read it from the API log.'
}

onMounted(() => {
  void load()
})
</script>

<template>
  <div class="auth-stage">
    <div class="auth-stage-art" aria-hidden="true">
      <span class="auth-orb auth-orb-blue" />
      <span class="auth-orb auth-orb-teal" />
      <span class="auth-ring" />
    </div>
    <div class="auth-stage-row dash-stage-row">
      <div class="auth-pitch">
        <p class="auth-kicker">Businesses</p>
        <h1>{{ greeting }}</h1>
        <p>Open a business, or jump to a section.</p>
      </div>
      <v-card class="auth-card dash-card pa-6 pa-sm-8" flat>
        <div class="dash-card-head">
          <router-link class="auth-logo" to="/dashboard"><NexoraLogo /></router-link>
          <div class="dash-card-tools">
            <v-btn v-if="session.user?.platformRole === 'ADMIN'" variant="text" to="/admin">Admin</v-btn>
          </div>
        </div>
        <v-alert v-if="session.user && !session.user.emailVerified" type="warning" class="mb-4">
          Verify your email before creating a business.
          <v-btn variant="text" @click="resend">Resend link</v-btn>
        </v-alert>
        <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
        <v-progress-linear v-if="loading" indeterminate class="mb-4" color="primary" />
        <template v-else>
          <p class="auth-section">Your businesses</p>
          <div v-if="businesses.length" class="nx-biz-list">
            <article v-for="link in businesses" :key="link.tenant.slug" class="nx-biz">
              <div class="nx-biz-main">
                <span class="nx-biz-mark">{{ mark(link.tenant.legalName) }}</span>
                <div class="nx-biz-copy">
                  <h3>{{ link.tenant.legalName }}</h3>
                  <p>/{{ link.tenant.slug }}</p>
                  <p v-if="link.tenant.city || link.tenant.phone">
                    {{ [link.tenant.city, link.tenant.postcode].filter(Boolean).join(' ') }}
                    <span v-if="link.tenant.phone"> · {{ link.tenant.phone }}</span>
                  </p>
                </div>
                <div class="nx-biz-side">
                  <span class="nx-biz-status" :class="`nx-biz-status-${link.tenant.status.toLowerCase()}`">
                    {{ roleLabel(link.role) }}
                  </span>
                  <router-link
                    v-if="subscriptionLocksApp(link.subscriptionStatus)"
                    class="nx-biz-status nx-biz-open"
                    :to="`/businesses/${link.tenant.slug}/billing`"
                  >
                    Pay
                  </router-link>
                  <router-link
                    v-else-if="link.tenant.status === 'ACTIVE'"
                    class="nx-biz-status nx-biz-open"
                    :to="`/businesses/${link.tenant.slug}`"
                  >
                    Open
                  </router-link>
                  <router-link
                    v-else-if="link.tenant.status === 'PROVISIONING'"
                    class="nx-biz-status nx-biz-open"
                    :to="`/businesses/${link.tenant.slug}`"
                  >
                    Finish setup
                  </router-link>
                </div>
              </div>
              <div v-if="link.tenant.status === 'ACTIVE' && !subscriptionLocksApp(link.subscriptionStatus)" class="nx-biz-foot">
                <v-btn
                  v-if="link.tenant.status === 'ACTIVE'"
                  size="small"
                  variant="text"
                  prepend-icon="mdi-calendar-month-outline"
                  :to="`/businesses/${link.tenant.slug}/calendar`"
                >
                  Calendar
                </v-btn>
                <v-btn
                  v-if="link.tenant.status === 'ACTIVE'"
                  size="small"
                  variant="text"
                  prepend-icon="mdi-account-group-outline"
                  :to="`/businesses/${link.tenant.slug}/customers`"
                >
                  Customers
                </v-btn>
                <v-btn
                  v-if="link.tenant.status === 'ACTIVE'"
                  size="small"
                  variant="text"
                  prepend-icon="mdi-open-in-new"
                  :to="`/book/${link.tenant.slug}`"
                >
                  Booking page
                </v-btn>
              </div>
            </article>
          </div>
          <p v-else class="nx-lead">No businesses yet.</p>
        </template>
      </v-card>
    </div>
  </div>
</template>
