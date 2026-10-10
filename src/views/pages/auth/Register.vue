<script setup lang="ts">
import { ref, watch } from 'vue'
import AuthSplit from '@/layouts/components/AuthSplit.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { isPublicSlug, slugify } from '@/utils/booking'
import { saveBusinessDraft } from '@/utils/business-draft'

const auth = useAuthStore()
const name = ref('')
const email = ref('')
const password = ref('')
const legalName = ref('')
const slug = ref('')
const slugEdited = ref(false)
const phone = ref('')
const addressLine1 = ref('')
const city = ref('')
const postcode = ref('')
const country = ref('GB')
const error = ref('')
const sent = ref(false)
const busy = ref(false)

watch(legalName, (value) => {
  if (!slugEdited.value) {
    slug.value = slugify(value)
  }
})

async function submit(): Promise<void> {
  error.value = ''
  if (!name.value.trim() || !email.value.trim() || password.value.length < 10) {
    error.value = 'Enter your name, email, and a password of at least 10 characters'
    return
  }
  if (!legalName.value.trim()) {
    error.value = 'Enter the legal name'
    return
  }
  if (!isPublicSlug(slug.value)) {
    error.value = 'Choose a public address using letters, numbers, and dashes'
    return
  }
  if (!phone.value.trim() || !addressLine1.value.trim() || !city.value.trim() || !postcode.value.trim()) {
    error.value = 'Add a phone number and address'
    return
  }
  if (!/^[A-Za-z]{2}$/.test(country.value.trim())) {
    error.value = 'Enter a two-letter country code'
    return
  }
  busy.value = true
  try {
    saveBusinessDraft({
      legalName: legalName.value.trim(),
      slug: slug.value,
      phone: phone.value.trim(),
      addressLine1: addressLine1.value.trim(),
      city: city.value.trim(),
      postcode: postcode.value.trim(),
      country: country.value.trim().toUpperCase(),
    })
    await auth.register(name.value, email.value, password.value)
    sent.value = true
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthSplit wide>
    <h1 class="auth-title">Start your free trial</h1>
    <p class="nx-lead mb-5">5 days with full access. Verify your email before the business goes live.</p>
    <v-alert v-if="sent" type="success">
      Check your email for a verification link. In development the API prints that link in its log.
    </v-alert>
    <template v-else>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <p class="auth-section">Account</p>
      <v-text-field v-model="name" label="Your name" autocomplete="name" />
      <v-text-field v-model="email" label="Email" type="email" autocomplete="username" />
      <v-text-field
        v-model="password"
        label="Password"
        type="password"
        hint="At least 10 characters"
        persistent-hint
        autocomplete="new-password"
      />
      <p class="auth-section">Business</p>
      <v-text-field v-model="legalName" label="Legal name" />
      <v-text-field
        v-model="slug"
        label="Public address"
        prefix="/"
        hint="Customers will book at this address"
        persistent-hint
        @update:model-value="slugEdited = true"
      />
      <v-text-field v-model="phone" label="Phone" autocomplete="tel" />
      <v-text-field v-model="addressLine1" label="Address" autocomplete="street-address" />
      <div class="auth-grid">
        <v-text-field v-model="city" label="City" autocomplete="address-level2" />
        <v-text-field v-model="postcode" label="Postcode" autocomplete="postal-code" />
      </div>
      <v-text-field
        v-model="country"
        label="Country"
        maxlength="2"
        hint="For example GB"
        persistent-hint
        autocomplete="country"
      />
      <v-btn class="mt-1" color="primary" size="large" block :loading="busy" @click="submit">
        Create account
      </v-btn>
    </template>
    <div class="nx-links">
      <router-link to="/login">I already have an account</router-link>
    </div>
  </AuthSplit>
</template>
