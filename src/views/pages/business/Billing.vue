<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabRoute } from '@/composables/useTabRoute'
import { useBillingStore } from '@/stores/business/billing.store'
import { formatMinor, formatShortDate } from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const billingStore = useBillingStore()
const { billing, error, busyPlan } = storeToRefs(billingStore)
const { tab, tabTo } = useTabRoute('billing', computed(() => ['current', 'plans']))

const otherPlans = computed(() => {
  const current = billing.value
  if (!current) {
    return []
  }
  return current.plans.filter((item) => item.id !== current.subscription?.planId)
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

watch(slug, () => {
  void billingStore.fetch(slug.value)
}, { immediate: true })

async function checkout(planId: string): Promise<void> {
  await billingStore.checkout(slug.value, planId)
}
</script>

<template>
  <v-container fluid class="nx-bill-page py-4">
    <header class="nx-report-bar">
      <div class="nx-report-title">
        <h1>Billing</h1>
        <p>The plan for this business.</p>
      </div>
    </header>
    <v-alert v-if="notice" type="info" class="mb-4">{{ notice }}</v-alert>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div v-if="billing" class="nx-panel">
      <v-tabs :model-value="tab" color="primary" class="nx-tabs">
        <v-tab value="current" :to="tabTo('current')">Current plan</v-tab>
        <v-tab value="plans" :to="tabTo('plans')">Other plans</v-tab>
      </v-tabs>
      <v-tabs-window :model-value="tab">
        <v-tabs-window-item value="current">
          <div class="nx-panel-body">
            <div v-if="billing.subscription" class="nx-stats">
              <article class="nx-stat">
                <span>Plan</span>
                <strong>{{ billing.subscription.planName }}</strong>
              </article>
              <article class="nx-stat">
                <span>Status</span>
                <strong>{{ statusLabel(billing.subscription.status) }}</strong>
              </article>
              <article class="nx-stat">
                <span>Price</span>
                <strong>{{ priceLabel(billing.subscription.monthlyAmountMinor, billing.subscription.currency) }}</strong>
              </article>
              <article class="nx-stat">
                <span>{{ billing.subscription.trialEndsAt ? 'Trial ends' : 'Period ends' }}</span>
                <strong>
                  {{
                    billing.subscription.trialEndsAt
                      ? formatShortDate(billing.subscription.trialEndsAt)
                      : billing.subscription.currentPeriodEnd
                        ? formatShortDate(billing.subscription.currentPeriodEnd)
                        : '—'
                  }}
                </strong>
              </article>
            </div>
            <p v-if="billing.subscription?.cancelAtPeriodEnd" class="nx-meta">This plan ends at the close of the current period.</p>
            <p v-else-if="!billing.subscription" class="nx-meta">No plan is active.</p>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="plans">
          <div class="nx-panel-body">
            <div v-if="otherPlans.length" class="nx-plans">
              <article v-for="plan in otherPlans" :key="plan.id" class="nx-plan">
                <h2>{{ plan.name }}</h2>
                <p>{{ priceLabel(plan.monthlyAmountMinor, plan.currency) }}</p>
                <v-btn
                  v-if="billing.canManage"
                  color="primary"
                  :disabled="!plan.purchasable"
                  :loading="busyPlan === plan.id"
                  @click="checkout(plan.id)"
                >
                  {{ plan.purchasable ? 'Choose plan' : 'Not available yet' }}
                </v-btn>
              </article>
            </div>
            <p v-else class="nx-meta">No other plans.</p>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>
