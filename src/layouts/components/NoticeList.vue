<script setup lang="ts">
import type { INotice } from '@/interfaces/business/notice.interface'
import { formatNoticeStamp } from '@/utils/booking'

defineProps<{
  items: INotice[]
  timeZone: string
}>()

const emit = defineEmits<{
  open: [id: string]
}>()

function icon(kind: INotice['kind']): string {
  if (kind === 'cancel') {
    return 'mdi-calendar-remove'
  }
  if (kind === 'reschedule') {
    return 'mdi-calendar-sync'
  }
  return 'mdi-bell-outline'
}
</script>

<template>
  <button
    v-for="item in items"
    :key="item.id"
    class="nx-note"
    :class="{ unread: !item.read }"
    type="button"
    @click="emit('open', item.id)"
  >
    <span class="nx-note-icon" :class="item.kind">
      <v-icon :icon="icon(item.kind)" size="20" />
    </span>
    <span>
      <span class="nx-note-title">{{ item.title }}</span>
      <span class="nx-note-time">{{ formatNoticeStamp(item.createdAt, timeZone) }}</span>
    </span>
  </button>
</template>
