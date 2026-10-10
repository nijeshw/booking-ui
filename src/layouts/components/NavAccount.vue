<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useSessionStore } from '@/stores/global/session.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import { isPublicSlug, slugify } from '@/utils/booking'
import { clearBusinessDraft, readBusinessDraft } from '@/utils/business-draft'

const session = useSessionStore()
const auth = useAuthStore()
const tenants = useTenantStore()
const { user } = storeToRefs(session)
const { userTenants, busy, loading } = storeToRefs(tenants)
const route = useRoute()
const router = useRouter()
const createOpen = ref(false)
const formError = ref('')
const legalName = ref('')
const slug = ref('')
const slugEdited = ref(false)
const contactEmail = ref('')
const contactPhone = ref('')
const addressLine1 = ref('')
const city = ref('')
const postcode = ref('')
const country = ref('GB')

const insideBusiness = computed(() => (
  route.path.startsWith('/businesses/') && typeof route.params.slug === 'string'
))

const showCreate = computed(() => (
  insideBusiness.value || (!loading.value && userTenants.value.length === 0)
))

watch(legalName, (value) => {
  if (!slugEdited.value) {
    slug.value = slugify(value)
  }
})

const initials = computed(() => {
  const name = user.value?.name?.trim()
  if (name) {
    return name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? '')
      .join('')
  }
  return (user.value?.email[0] ?? '?').toUpperCase()
})

const roleLabel = computed(() => {
  const slug = route.path.startsWith('/businesses/') && typeof route.params.slug === 'string'
    ? route.params.slug
    : ''
  const role = userTenants.value.find((link) => link.tenant.slug === slug)?.role
  if (role) {
    return role
      .toLowerCase()
      .split('_')
      .filter((part) => part.length > 0)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ')
  }
  if (user.value?.platformRole === 'ADMIN') {
    return 'Admin'
  }
  return user.value?.email ?? ''
})

function openCreate(): void {
  formError.value = ''
  const draft = readBusinessDraft()
  if (draft && !legalName.value) {
    legalName.value = draft.legalName
    slug.value = draft.slug
    slugEdited.value = true
    contactPhone.value = draft.phone
    addressLine1.value = draft.addressLine1
    city.value = draft.city
    postcode.value = draft.postcode
    country.value = draft.country
  }
  if (!contactEmail.value && user.value?.email) {
    contactEmail.value = user.value.email
  }
  createOpen.value = true
}

async function createBusiness(): Promise<void> {
  formError.value = ''
  if (!isPublicSlug(slug.value)) {
    formError.value = 'Choose a public address using letters, numbers, and dashes'
    return
  }
  if (!contactEmail.value.trim() || !contactPhone.value.trim() || !addressLine1.value.trim() || !city.value.trim() || !postcode.value.trim()) {
    formError.value = 'Add an email, phone, and address'
    return
  }
  const created = await tenants.create({
    legalName: legalName.value,
    slug: slug.value,
    timezone: 'Europe/London',
    currency: 'GBP',
    email: contactEmail.value,
    phone: contactPhone.value,
    addressLine1: addressLine1.value,
    city: city.value,
    postcode: postcode.value,
    country: country.value || 'GB',
  })
  if (!created) {
    formError.value = tenants.error
    tenants.error = ''
    return
  }
  clearBusinessDraft()
  createOpen.value = false
  await router.push(`/businesses/${created}`)
}

async function resend(): Promise<void> {
  if (!user.value) {
    return
  }
  await auth.resendVerification(user.value.email)
  formError.value = 'Verification link sent. In development, read it from the API log.'
}

async function logout(): Promise<void> {
  await session.logout()
  await router.push('/login')
}
</script>

<template>
  <v-menu location="bottom end" content-class="nx-account-menu">
    <template #activator="{ props: menuProps }">
      <v-btn class="nav-avatar" icon variant="text" v-bind="menuProps">
        <span class="nav-avatar-wrap">
          <v-avatar size="34">
            <span>{{ initials }}</span>
          </v-avatar>
          <span class="nav-avatar-dot" />
        </span>
      </v-btn>
    </template>
    <div class="nx-account">
      <div class="nx-account-head">
        <span class="nav-avatar-wrap">
          <span class="nx-account-mark">{{ initials }}</span>
          <span class="nav-avatar-dot" />
        </span>
        <div>
          <strong>{{ user?.name || 'Profile' }}</strong>
          <span class="nx-account-role">{{ roleLabel }}</span>
        </div>
      </div>
      <div class="nx-account-links">
        <router-link class="nx-account-link" to="/dashboard">
          <span class="nx-account-icon"><v-icon icon="mdi-swap-horizontal" size="18" /></span>
          Businesses
        </router-link>
        <router-link class="nx-account-link" to="/profile">
          <span class="nx-account-icon"><v-icon icon="mdi-account-outline" size="18" /></span>
          Profile
        </router-link>
        <button v-if="showCreate" type="button" class="nx-account-link" @click="openCreate">
          <span class="nx-account-icon"><v-icon icon="mdi-plus" size="18" /></span>
          New business
        </button>
        <router-link v-if="user?.platformRole === 'ADMIN'" class="nx-account-link" to="/admin">
          <span class="nx-account-icon"><v-icon icon="mdi-shield-account-outline" size="18" /></span>
          Admin
        </router-link>
      </div>
      <button type="button" class="nx-account-logout" @click="logout">
        <v-icon icon="mdi-logout" size="18" />
        Log out
      </button>
    </div>
  </v-menu>
  <v-dialog v-model="createOpen" max-width="520">
    <v-card>
      <v-card-title class="text-h6 px-4 py-3">New business</v-card-title>
      <v-divider />
      <v-card-text class="pt-4 pb-0">
        <v-alert v-if="user && !user.emailVerified" type="warning" class="mb-4">
          Verify your email before creating a business.
          <v-btn variant="text" @click="resend">Resend link</v-btn>
        </v-alert>
        <v-alert v-if="formError" type="error" class="mb-4">{{ formError }}</v-alert>
        <p class="nx-lead mb-4">Customers and invoices use these contact details.</p>
        <v-text-field v-model="legalName" label="Legal name" />
        <v-text-field
          v-model="slug"
          label="Public address"
          prefix="/"
          hint="Customers will book at this address"
          persistent-hint
          @update:model-value="slugEdited = true"
        />
        <v-text-field v-model="contactEmail" label="Email" type="email" />
        <v-text-field v-model="contactPhone" label="Phone" />
        <v-text-field v-model="addressLine1" label="Address" />
        <div class="auth-grid">
          <v-text-field v-model="city" label="City" />
          <v-text-field v-model="postcode" label="Postcode" />
        </div>
        <v-text-field v-model="country" label="Country" maxlength="2" hint="For example GB" persistent-hint />
      </v-card-text>
      <v-divider />
      <v-card-actions class="px-4 py-3">
        <v-spacer />
        <v-btn variant="outlined" @click="createOpen = false">Cancel</v-btn>
        <v-btn variant="flat" color="primary" :loading="busy" :disabled="user !== null && !user.emailVerified" @click="createBusiness">Create</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
