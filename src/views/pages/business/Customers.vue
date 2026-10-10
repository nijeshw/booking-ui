<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useTabRoute } from '@/composables/useTabRoute'
import type { ICustomer, ICustomerExport } from '@/interfaces/business/customer.interface'
import { useCustomerStore } from '@/stores/business/customer.store'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const customerStore = useCustomerStore()
const { customers, error, busy } = storeToRefs(customerStore)
const addOpen = ref(false)
const editing = ref<ICustomer | null>(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const erasing = ref<ICustomer | null>(null)

useTabRoute('customers', computed(() => ['list']))

function openAdd(): void {
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  phone.value = ''
  addOpen.value = true
}

function openEdit(customer: ICustomer): void {
  firstName.value = customer.firstName
  lastName.value = customer.lastName
  email.value = customer.email ?? ''
  phone.value = customer.phone ?? ''
  editing.value = customer
}

async function create(): Promise<void> {
  if (!firstName.value.trim() || !lastName.value.trim()) {
    error.value = 'Enter a first and last name'
    return
  }
  const saved = await customerStore.create(slug.value, {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
  })
  if (saved) {
    addOpen.value = false
  }
}

async function save(): Promise<void> {
  const customer = editing.value
  if (!customer) {
    return
  }
  if (!firstName.value.trim() || !lastName.value.trim()) {
    error.value = 'Enter a first and last name'
    return
  }
  const saved = await customerStore.update(slug.value, customer.id, {
    firstName: firstName.value.trim(),
    lastName: lastName.value.trim(),
    email: email.value.trim() || undefined,
    phone: phone.value.trim() || undefined,
  })
  if (saved) {
    editing.value = null
  }
}

function saveExport(data: ICustomerExport): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `customer-${data.customer.id}.json`
  link.click()
  URL.revokeObjectURL(url)
}

async function download(id: string): Promise<void> {
  const data = await customerStore.exportCustomer(slug.value, id)
  if (data) {
    saveExport(data)
  }
}

async function erase(): Promise<void> {
  const customer = erasing.value
  if (!customer) {
    return
  }
  const saved = await customerStore.erase(slug.value, customer.id)
  if (saved) {
    erasing.value = null
  }
}

watch(slug, () => {
  void customerStore.fetch(slug.value)
}, { immediate: true })
</script>

<template>
  <v-container fluid class="nx-customer-page py-4">
    <header class="nx-pagehead">
      <h1>Customers</h1>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div class="nx-panel">
      <div class="nx-panel-body">
        <div class="nx-toolbar">
          <p class="nx-meta">People who have booked.</p>
          <v-btn color="primary" prepend-icon="mdi-plus" @click="openAdd">Add</v-btn>
        </div>
        <v-table v-if="customers.length" class="nx-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th class="text-end">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id">
              <td>{{ customer.firstName }} {{ customer.lastName }}</td>
              <td>{{ customer.email || '—' }}</td>
              <td>{{ customer.phone || '—' }}</td>
              <td class="text-end">
                <div class="d-flex justify-end">
                  <div>
                    <v-btn color="primary" icon="mdi-pencil-outline" class="mx-2 rounded" variant="outlined" rounded @click="openEdit(customer)" />
                    <v-tooltip activator="parent">Edit</v-tooltip>
                  </div>
                  <div>
                    <v-btn color="primary" icon="mdi-download-outline" class="mx-2 rounded" variant="outlined" rounded @click="download(customer.id)" />
                    <v-tooltip activator="parent">Export</v-tooltip>
                  </div>
                  <div>
                    <v-btn color="error" icon="mdi-delete-outline" class="mx-2 rounded" variant="outlined" rounded @click="erasing = customer" />
                    <v-tooltip activator="parent">Erase</v-tooltip>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </v-table>
        <p v-else class="nx-meta">No customers yet.</p>
      </div>
    </div>

    <v-dialog v-model="addOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add customer</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="firstName" label="First name" />
          <v-text-field v-model="lastName" label="Last name" />
          <v-text-field v-model="email" label="Email" type="email" />
          <v-text-field v-model="phone" label="Phone" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="addOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="create">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="editing !== null" max-width="480" @update:model-value="(open) => { if (!open) editing = null }">
      <v-card v-if="editing">
        <v-card-title class="text-h6 px-4 py-3">Edit customer</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="firstName" label="First name" />
          <v-text-field v-model="lastName" label="Last name" />
          <v-text-field v-model="email" label="Email" type="email" />
          <v-text-field v-model="phone" label="Phone" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="editing = null">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="save">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="erasing !== null" max-width="480" @update:model-value="(open) => { if (!open) erasing = null }">
      <v-card v-if="erasing">
        <v-card-title class="text-h6 px-4 py-3">Erase</v-card-title>
        <v-divider />
        <v-card-text class="py-4 text-body-2">
          {{ erasing.firstName }} {{ erasing.lastName }} will lose their name and contact details. Bookings stay.
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="erasing = null">Cancel</v-btn>
          <v-btn variant="flat" color="error" :loading="busy" @click="erase">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
