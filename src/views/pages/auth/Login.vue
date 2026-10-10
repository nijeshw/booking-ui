<script setup lang="ts">
import { ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import AuthSplit from '@/layouts/components/AuthSplit.vue'
import { useAuthStore } from '@/stores/auth/auth.store'
import { useSessionStore } from '@/stores/global/session.store'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const session = useSessionStore()
const email = ref('')
const password = ref('')
const error = ref('')
const busy = ref(false)

async function submit(): Promise<void> {
  error.value = ''
  busy.value = true
  try {
    const data = await auth.login(email.value, password.value)
    session.signedIn(data.accessToken, data.user)
    const next = typeof route.query.next === 'string' ? route.query.next : '/dashboard'
    await router.push(next)
  } catch (caught) {
    error.value = caught instanceof Error ? caught.message : 'Something went wrong'
  } finally {
    busy.value = false
  }
}
</script>

<template>
  <AuthSplit>
    <h1 class="auth-title">Log in</h1>
    <p class="nx-lead mb-6">Pick up your businesses where you left them.</p>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-text-field v-model="email" class="mt-6" label="Email" type="email" autocomplete="username" />
    <v-text-field
      v-model="password"
      label="Password"
      type="password"
      autocomplete="current-password"
      @keyup.enter="submit"
    />
    <v-btn class="mt-1" color="primary" size="large" block :loading="busy" @click="submit">Log in</v-btn>
    <div class="nx-links">
      <router-link to="/forgot-password">Forgot password</router-link>
      <router-link to="/register">Create an account</router-link>
    </div>
  </AuthSplit>
</template>
