<script setup lang="ts">
import AuthSplit from '@/layouts/components/AuthSplit.vue'
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth/auth.store'

const auth = useAuthStore()
const email = ref('')
const error = ref('')
const sent = ref(false)
const busy = ref(false)

async function submit(): Promise<void> {
  error.value = ''
  busy.value = true
  try {
    await auth.forgotPassword(email.value)
    sent.value = true
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}
</script>

<template>
      <AuthSplit>
        <h4 class="auth-title text-h4 mb-1">Reset your password</h4>
        <p class="nx-lead mb-6">We will email a link if that address has an account.</p>
        <v-alert v-if="sent" type="success">
          If that email has an account, a reset link is on its way. In development the API prints the link in its log.
        </v-alert>
        <template v-else>
          <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
          <v-text-field v-model="email" label="Email" type="email" />
          <v-btn color="primary" size="large" block :loading="busy" @click="submit">Send reset link</v-btn>
        </template>
        <div class="nx-links">
          <router-link to="/login">Back to log in</router-link>
        </div>
</AuthSplit>
  </template>
