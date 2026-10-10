<script setup lang="ts">
import AuthSplit from '@/layouts/components/AuthSplit.vue'
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'

const auth = useAuthStore()
const route = useRoute()
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const password = ref('')
const error = ref('')
const done = ref(false)
const busy = ref(false)

async function submit(): Promise<void> {
  error.value = ''
  busy.value = true
  try {
    await auth.resetPassword(token.value, password.value)
    done.value = true
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}
</script>

<template>
      <AuthSplit>
        <h4 class="auth-title text-h4 mb-1">Choose a new password</h4>
        <v-alert v-if="done" type="success" class="mt-4">
          Password updated.
          <router-link class="nx-inline-link" to="/login">Log in</router-link>
        </v-alert>
        <template v-else>
          <v-alert v-if="error" type="error" class="mb-4 mt-4">{{ error }}</v-alert>
          <v-text-field v-model="token" label="Reset token" class="mt-4" />
          <v-text-field v-model="password" label="New password" type="password" autocomplete="new-password" />
          <v-btn color="primary" size="large" block :loading="busy" @click="submit">Save</v-btn>
        </template>
</AuthSplit>
  </template>
