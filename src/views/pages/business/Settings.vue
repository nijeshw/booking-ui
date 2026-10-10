<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { SettingValue } from '@/interfaces/business/setting.interface'
import { useSettingStore } from '@/stores/business/setting.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const settingStore = useSettingStore()
const tenants = useTenantStore()
const { groups, values, error, busy, saved } = storeToRefs(settingStore)
const { permissions, userTenants } = storeToRefs(tenants)

const canManage = computed(() => {
  const role = userTenants.value.find((link) => link.tenant.slug === slug.value)?.role
  return role === 'OWNER' || permissions.value.mine.includes('setup.manage')
})

function setValue(key: string, value: SettingValue): void {
  settingStore.set(key, value)
}

function setNumber(key: string, raw: string): void {
  const parsed = Number(raw)
  if (Number.isInteger(parsed)) {
    settingStore.set(key, parsed)
  }
}

watch(slug, () => {
  void settingStore.fetch(slug.value)
}, { immediate: true })
</script>

<template>
  <v-container fluid class="nx-settings-page py-4">
    <header class="nx-pagehead nx-pagehead-row">
      <div>
        <h1>Settings</h1>
        <p>Choices for this business. New options appear here when they are added.</p>
      </div>
      <v-btn v-if="canManage" color="primary" :loading="busy" @click="settingStore.save(slug)">
        Save
      </v-btn>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-alert v-else-if="saved" type="success" class="mb-4">Saved.</v-alert>
    <section v-for="group in groups" :key="group.label" class="nx-panel nx-settings">
      <h2>{{ group.label }}</h2>
      <div v-for="item in group.items" :key="item.key" class="nx-setting">
        <div>
          <strong>{{ item.label }}</strong>
          <p>{{ item.description }}</p>
        </div>
        <div class="nx-setting-control">
          <v-switch
            v-if="item.type === 'boolean'"
            :model-value="values[item.key] === true"
            :disabled="!canManage"
            color="primary"
            hide-details
            inset
            @update:model-value="setValue(item.key, $event === true)"
          />
          <v-select
            v-else-if="item.options"
            :model-value="values[item.key]"
            :items="item.options"
            item-title="label"
            item-value="value"
            :disabled="!canManage"
            hide-details
            density="compact"
            @update:model-value="setValue(item.key, String($event))"
          />
          <v-text-field
            v-else-if="item.type === 'number'"
            :model-value="String(values[item.key] ?? '')"
            type="number"
            :disabled="!canManage"
            hide-details
            density="compact"
            @update:model-value="setNumber(item.key, String($event ?? ''))"
          />
          <v-text-field
            v-else
            :model-value="String(values[item.key] ?? '')"
            :disabled="!canManage"
            hide-details
            density="compact"
            @update:model-value="setValue(item.key, String($event ?? ''))"
          />
        </div>
      </div>
    </section>
  </v-container>
</template>
