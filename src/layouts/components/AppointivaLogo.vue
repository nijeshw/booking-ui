<script setup lang="ts">
import { computed } from 'vue'
import { useTheme } from 'vuetify'
import logo from '@/assets/brand/appointiva-logo.png'
import mark from '@/assets/brand/appointiva-mark.png'

const props = defineProps<{
  markOnly?: boolean
}>()

const theme = useTheme()
const source = computed(() => (
  props.markOnly || theme.global.current.value.dark ? mark : logo
))

const compact = computed(() => props.markOnly || theme.global.current.value.dark)
</script>

<template>
  <img class="nx-logo" :class="{ 'nx-logo-mark': compact }" :src="source" alt="Appointiva">
</template>
