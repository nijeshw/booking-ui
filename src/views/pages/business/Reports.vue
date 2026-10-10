<script setup lang="ts">
import { DateTime } from 'luxon'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppDateTimePicker from '@/components/AppDateTimePicker.vue'
import { useTabRoute } from '@/composables/useTabRoute'
import { useReportsStore } from '@/stores/business/reports.store'
import { formatMinor } from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const reports = useReportsStore()
const { report, error, busy } = storeToRefs(reports)

const now = DateTime.now().toUTC()
const fromDate = ref(now.startOf('month').toISODate() ?? '')
const toDate = ref(now.endOf('month').toISODate() ?? '')
const dateConfig = {
  altInput: true,
  altFormat: 'd-m-Y',
  dateFormat: 'Y-m-d',
  locale: { firstDayOfWeek: 1 },
}
const { tab, tabTo } = useTabRoute('reports', computed(() => ['services', 'staff']))

async function apply(): Promise<void> {
  const from = DateTime.fromISO(fromDate.value, { zone: 'utc' }).startOf('day')
  const to = DateTime.fromISO(toDate.value, { zone: 'utc' })
    .plus({ days: 1 })
    .startOf('day')
  await reports.fetch(slug.value, from.toISO() ?? '', to.toISO() ?? '')
}

watch(slug, () => {
  void apply()
}, { immediate: true })
</script>

<template>
  <v-container fluid class="nx-report-page py-4">
    <header class="nx-report-bar">
      <div class="nx-report-title">
        <h1>Reports</h1>
        <p>Bookings in the selected dates.</p>
      </div>
      <AppDateTimePicker
        v-model="fromDate"
        class="nx-report-field"
        label="From"
        placeholder="From"
        :config="dateConfig"
        density="compact"
        hide-details
      />
      <AppDateTimePicker
        v-model="toDate"
        class="nx-report-field"
        label="To"
        placeholder="To"
        :config="dateConfig"
        density="compact"
        hide-details
      />
      <v-btn color="primary" :loading="busy" @click="apply">Apply</v-btn>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div v-if="report" class="nx-stats">
      <article class="nx-stat">
        <span>Bookings</span>
        <strong>{{ report.bookings }}</strong>
      </article>
      <article class="nx-stat">
        <span>Cancelled</span>
        <strong>{{ report.cancelled }}</strong>
      </article>
      <article class="nx-stat">
        <span>No-shows</span>
        <strong>{{ report.noShows }}</strong>
      </article>
      <article class="nx-stat">
        <span>Revenue</span>
        <strong>{{ formatMinor(report.revenueAmountMinor, report.currency) }}</strong>
      </article>
    </div>
    <div v-if="report?.advanced" class="nx-panel">
      <v-tabs :model-value="tab" color="primary" class="nx-tabs">
        <v-tab value="services" :to="tabTo('services')">By service</v-tab>
        <v-tab value="staff" :to="tabTo('staff')">By staff</v-tab>
      </v-tabs>
      <v-tabs-window :model-value="tab">
        <v-tabs-window-item value="services">
          <div class="nx-panel-body">
            <v-table v-if="report.byService.length" class="nx-table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th class="text-end">Bookings</th>
                  <th class="text-end">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in report.byService" :key="group.id">
                  <td>{{ group.name }}</td>
                  <td class="text-end">{{ group.bookings }}</td>
                  <td class="text-end">{{ formatMinor(group.revenueAmountMinor, report.currency) }}</td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta">No bookings in this range.</p>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="staff">
          <div class="nx-panel-body">
            <v-table v-if="report.byStaff.length" class="nx-table">
              <thead>
                <tr>
                  <th>Staff</th>
                  <th class="text-end">Bookings</th>
                  <th class="text-end">Revenue</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in report.byStaff" :key="group.id">
                  <td>{{ group.name }}</td>
                  <td class="text-end">{{ group.bookings }}</td>
                  <td class="text-end">{{ formatMinor(group.revenueAmountMinor, report.currency) }}</td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta">No bookings in this range.</p>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>
  </v-container>
</template>
