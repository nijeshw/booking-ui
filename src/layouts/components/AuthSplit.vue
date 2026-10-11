<script setup lang="ts">
import AppointivaLogo from '@/layouts/components/AppointivaLogo.vue'

defineProps<{
  wide?: boolean
}>()
</script>

<template>
  <div class="auth-stage">
    <div class="auth-stage-art" aria-hidden="true">
      <span class="auth-orb auth-orb-blue" />
      <span class="auth-orb auth-orb-teal" />
      <span class="auth-ring" />
    </div>
    <div class="auth-stage-row" :class="{ 'auth-stage-row-wide': wide }">
      <div class="auth-pitch">
        <p class="auth-kicker">Appointments</p>
        <h1>Your day, open for appointments.</h1>
        <p>Customers pick a time. You keep the calendar.</p>
      </div>
      <v-card class="auth-card pa-6 pa-sm-8" :class="{ 'auth-card-wide': wide }" flat>
        <router-link class="auth-logo" to="/">
          <AppointivaLogo />
        </router-link>
        <slot />
      </v-card>
    </div>
  </div>
</template>
