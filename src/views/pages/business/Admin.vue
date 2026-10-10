<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { onMounted } from 'vue'
import { useAdminStore } from '@/stores/business/admin.store'
import { formatMediumDateTime } from '@/utils/booking'

const admin = useAdminStore()
const { tenants, error, busyId } = storeToRefs(admin)

onMounted(() => {
  void admin.fetch()
})
</script>

<template>
  <v-container class="nx-wide py-8">
    <header class="nx-pagehead">
      <h1>Admin</h1>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div class="nx-panel">
    <v-table>
      <thead>
        <tr>
          <th>Business</th>
          <th>Status</th>
          <th>Plan</th>
          <th>Database login</th>
          <th></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="tenant in tenants" :key="tenant.id">
          <td>
            <div>{{ tenant.legalName }}</div>
            <div class="text-caption">{{ tenant.slug }} · {{ formatMediumDateTime(tenant.createdAt) }}</div>
          </td>
          <td>{{ tenant.status }}</td>
          <td>{{ tenant.planId || 'None' }} · {{ tenant.subscriptionStatus || 'None' }}</td>
          <td>{{ tenant.hasDatabaseLogin ? 'Separate' : 'Shared' }}</td>
          <td>
            <v-btn
              v-if="tenant.status === 'ACTIVE'"
              variant="text"
              :loading="busyId === tenant.id"
              @click="admin.suspend(tenant.id)"
            >
              Suspend
            </v-btn>
            <v-btn
              v-if="tenant.status === 'SUSPENDED'"
              variant="text"
              :loading="busyId === tenant.id"
              @click="admin.activate(tenant.id)"
            >
              Activate
            </v-btn>
            <v-btn
              v-if="tenant.status === 'ACTIVE' && !tenant.hasDatabaseLogin"
              variant="text"
              :loading="busyId === tenant.id"
              @click="admin.issueLogin(tenant.id)"
            >
              Separate login
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
    <p v-if="tenants.length === 0" class="nx-meta pa-5">No businesses yet.</p>
    </div>
  </v-container>
</template>
