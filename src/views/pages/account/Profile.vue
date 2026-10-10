<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { ref, watch } from 'vue'
import authService from '@/services/auth/auth.service'
import { useSessionStore } from '@/stores/global/session.store'
import { errorMessage } from '@/utils/error'

const session = useSessionStore()
const { user } = storeToRefs(session)
const name = ref('')
const error = ref('')
const busy = ref(false)

const initials = (): string => {
  const current = name.value.trim() || user.value?.email || '?'
  return current
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('')
}

async function save(): Promise<void> {
  if (!name.value.trim()) {
    error.value = 'Enter your name'
    return
  }
  busy.value = true
  error.value = ''
  try {
    session.setUser(await authService.updateProfile(name.value.trim()))
  } catch (caught) {
    error.value = errorMessage(caught)
  } finally {
    busy.value = false
  }
}

watch(user, (current) => {
  name.value = current?.name ?? ''
}, { immediate: true })
</script>

<template>
  <v-container class="nx-wide py-8">
    <header class="nx-pagehead">
      <h1>Profile</h1>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div class="nx-panel">
      <div class="nx-panel-body">
        <div class="nx-profile-head">
          <v-avatar class="nx-profile-avatar" color="primary" size="72">
            <span class="nx-profile-initials">{{ initials() }}</span>
          </v-avatar>
          <div>
            <h2>{{ name.trim() || 'Your name' }}</h2>
            <p>{{ user?.email }}</p>
          </div>
        </div>
        <div class="nx-profile-form">
          <v-text-field v-model="name" label="Name" />
          <v-text-field :model-value="user?.email ?? ''" label="Email" disabled />
          <v-btn class="mb-3" variant="flat" color="primary" :loading="busy" @click="save">Save</v-btn>
        </div>
      </div>
    </div>
  </v-container>
</template>
