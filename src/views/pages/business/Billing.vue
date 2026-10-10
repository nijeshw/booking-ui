<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useBillingStore } from '@/stores/business/billing.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import { subscriptionLocksApp } from '@/utils/billing-lock'
import { formatMinor, formatShortDate } from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const billingStore = useBillingStore()
const tenants = useTenantStore()
const { billing, error, busyPlan, busyPortal } = storeToRefs(billingStore)
const { userTenants } = storeToRefs(tenants)

const paused = computed(() => {
  const listed = userTenants.value.find((link) => link.tenant.slug === slug.value)?.subscriptionStatus
  return subscriptionLocksApp(billing.value?.subscription?.status) || subscriptionLocksApp(listed)
})

const offer = computed(() => {
  const current = billing.value
  if (!current) {
    return null
  }
  return current.plans.find((item) => item.purchasable && item.id !== current.subscription?.planId) ?? null
})

const periodWhen = computed(() => {
  const subscription = billing.value?.subscription
  if (!subscription) {
    return ''
  }
  if (subscription.trialEndsAt) {
    return `Trial ends ${formatShortDate(subscription.trialEndsAt)}`
  }
  if (subscription.currentPeriodEnd) {
    return `Period ends ${formatShortDate(subscription.currentPeriodEnd)}`
  }
  return ''
})

const notice = computed(() => {
  if (route.query.checkout === 'success') {
    return 'Stripe is confirming the payment. The plan updates when that finishes.'
  }
  if (route.query.checkout === 'cancel') {
    return 'Checkout was cancelled. The current plan is unchanged.'
  }
  return ''
})

function statusLabel(status: string): string {
  if (status === 'TRIALING') return 'Free trial'
  if (status === 'ACTIVE') return 'Active'
  if (status === 'PAST_DUE') return 'Payment past due'
  if (status === 'CANCELED') return 'Cancelled'
  return status
}

function priceLabel(amountMinor: number, currency: string): string {
  if (amountMinor === 0) {
    return 'Free'
  }
  return `${formatMinor(amountMinor, currency)} / month`
}

function cardLabel(card: { brand: string; last4: string }): string {
  const brand = card.brand.charAt(0).toUpperCase() + card.brand.slice(1)
  return `${brand} ···· ${card.last4}`
}

function invoiceStatus(status: string): string {
  if (status === 'paid') return 'Paid'
  if (status === 'open') return 'Open'
  if (status === 'uncollectible') return 'Uncollectible'
  if (status === 'void') return 'Void'
  return status
}

watch(slug, () => {
  void billingStore.fetch(slug.value)
  void tenants.fetchUserTenants(true)
}, { immediate: true })

async function checkout(planId: string): Promise<void> {
  await billingStore.checkout(slug.value, planId)
}

async function openPortal(): Promise<void> {
  await billingStore.openPortal(slug.value)
}
</script>

<template>
  <v-container fluid class="nx-bill-page py-4">
    <header class="nx-report-bar">
      <div class="nx-report-title">
        <h1>Billing</h1>
        <p>The plan for this business.</p>
      </div>
      <v-btn
        v-if="billing?.canOpenPortal"
        variant="outlined"
        color="primary"
        :loading="busyPortal"
        @click="openPortal"
      >
        Manage
      </v-btn>
    </header>
    <v-alert v-if="paused" type="warning" class="mb-4">
      This business is paused until the invoice is paid.
    </v-alert>
    <v-alert v-if="notice" type="info" class="mb-4">{{ notice }}</v-alert>
    <v-alert v-if="error && !paused" type="error" class="mb-4">{{ error }}</v-alert>
    <div v-if="billing" class="nx-bill">
      <section v-if="billing.subscription" class="nx-bill-summary">
        <div>
          <p class="nx-bill-kicker">Current plan</p>
          <h2>{{ billing.subscription.planName }}</h2>
          <p class="nx-bill-price">
            <template v-if="billing.subscription.monthlyAmountMinor === 0">Free</template>
            <template v-else>
              {{ formatMinor(billing.subscription.monthlyAmountMinor, billing.subscription.currency) }}
              <span>/ month</span>
            </template>
          </p>
          <p v-if="periodWhen" class="nx-bill-when">{{ periodWhen }}</p>
        </div>
        <span class="nx-bill-status" :data-status="billing.subscription.status">
          {{ statusLabel(billing.subscription.status) }}
        </span>
      </section>
      <p v-if="billing.subscription?.cancelAtPeriodEnd" class="nx-meta">This plan ends at the close of the current period.</p>
      <p v-else-if="!billing.subscription" class="nx-meta">No plan is active.</p>
      <div v-if="billing.stripe" class="nx-bill-facts">
        <article class="nx-bill-fact">
          <span>Card</span>
          <strong>{{ billing.stripe.card ? cardLabel(billing.stripe.card) : 'None' }}</strong>
        </article>
        <article class="nx-bill-fact">
          <span>Next payment</span>
          <strong>
            {{
              billing.stripe.renewal
                ? formatMinor(billing.stripe.renewal.amountMinor, billing.stripe.renewal.currency)
                : '—'
            }}
          </strong>
          <em v-if="billing.stripe.renewal?.at">{{ formatShortDate(billing.stripe.renewal.at) }}</em>
        </article>
      </div>
      <article v-if="offer" class="nx-bill-offer">
        <div>
          <h2>{{ offer.name }}</h2>
          <p>{{ priceLabel(offer.monthlyAmountMinor, offer.currency) }}</p>
        </div>
        <v-btn
          v-if="billing.canManage"
          variant="flat"
          color="white"
          :loading="busyPlan === offer.id"
          @click="checkout(offer.id)"
        >
          Choose
        </v-btn>
      </article>
      <section v-if="billing.stripe" class="nx-bill-rows">
        <h2>Invoices</h2>
        <article v-for="invoice in billing.stripe.invoices" :key="invoice.id" class="nx-bill-row">
          <div>
            <strong>{{ invoice.number || 'Invoice' }}</strong>
            <small>{{ formatShortDate(invoice.createdAt) }}</small>
          </div>
          <span class="nx-bill-status" :data-status="invoice.status">{{ invoiceStatus(invoice.status) }}</span>
          <strong>{{ formatMinor(invoice.amountMinor, invoice.currency) }}</strong>
          <a
            v-if="invoice.hostedUrl"
            :href="invoice.hostedUrl"
            target="_blank"
            rel="noopener noreferrer"
          >View</a>
          <span v-else></span>
        </article>
        <p v-if="!billing.stripe.invoices.length" class="nx-meta nx-bill-empty">No invoices yet.</p>
      </section>
    </div>
  </v-container>
</template>
