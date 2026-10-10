<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'
import { useTheme } from 'vuetify'
import { resolvedTheme, savedThemeChoice, type ThemeChoice } from '@/plugins/vuetify/theme'

const theme = useTheme()
const choice = ref<ThemeChoice>(savedThemeChoice())

const options: { value: ThemeChoice; label: string; icon: string }[] = [
  { value: 'light', label: 'Light', icon: 'mdi-weather-sunny' },
  { value: 'dark', label: 'Dark', icon: 'mdi-weather-night' },
  { value: 'system', label: 'System', icon: 'mdi-monitor' },
]

const current = computed(() => options.find((item) => item.value === choice.value) ?? options[2])

function apply(next: ThemeChoice): void {
  choice.value = next
  theme.global.name.value = resolvedTheme(next)
  localStorage.setItem('nx-theme', next)
}

function onSystemChange(): void {
  if (choice.value === 'system') {
    theme.global.name.value = resolvedTheme('system')
  }
}

const media = window.matchMedia('(prefers-color-scheme: dark)')

onMounted(() => {
  media.addEventListener('change', onSystemChange)
})

onUnmounted(() => {
  media.removeEventListener('change', onSystemChange)
})
</script>

<template>
  <v-menu location="bottom end">
    <template #activator="{ props: menuProps }">
      <div class="nx-theme-menu" v-bind="menuProps">
        <v-btn class="nx-theme-btn" :icon="current.icon" variant="text" />
        <v-tooltip activator="parent" location="bottom">{{ current.label }}</v-tooltip>
      </div>
    </template>
    <v-list density="compact" nav min-width="180">
      <v-list-item
        v-for="item in options"
        :key="item.value"
        :prepend-icon="item.icon"
        :title="item.label"
        :active="choice === item.value"
        color="primary"
        rounded="lg"
        @click="apply(item.value)"
      />
    </v-list>
  </v-menu>
</template>
