<script setup lang="ts">
import AuthSplit from '@/layouts/components/AuthSplit.vue'
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useAuthStore } from '@/stores/auth/auth.store'

const auth = useAuthStore()
const route = useRoute()
const token = ref(typeof route.query.token === 'string' ? route.query.token : '')
const error = ref('')
const verified = ref(false)
const busy = ref(false)

async function submit(): Promise<void> {
  error.value = ''
  busy.value = true
  try {
    await auth.verifyEmail(token.value)
    verified.value = true
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}

onMounted(() => {
  if (token.value) {
    void submit()
  }
})
</script>

<template>
      <AuthSplit>
        <h4 class="auth-title text-h4 mb-1">Verify your email</h4>
        <v-alert v-if="verified" type="success" class="mt-4">
          Your email is verified.
          <router-link class="nx-inline-link" to="/login">Log in</router-link>
        </v-alert>
        <template v-else>
          <v-alert v-if="error" type="error" class="mb-4 mt-4">{{ error }}</v-alert>
          <v-text-field v-model="token" label="Verification token" class="mt-4" />
          <v-btn color="primary" size="large" block :loading="busy" @click="submit">Verify</v-btn>
        </template>
</AuthSplit>
  </template>
