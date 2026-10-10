<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, watch } from 'vue'
import { useRoute } from 'vue-router'
import NoticeList from '@/layouts/components/NoticeList.vue'
import { useNoticeStore } from '@/stores/business/notice.store'
import { useWorkspaceStore } from '@/stores/business/workspace.store'

const route = useRoute()
const noticeStore = useNoticeStore()
const workspaceStore = useWorkspaceStore()
const { items, unread, error } = storeToRefs(noticeStore)
const { workspace } = storeToRefs(workspaceStore)
const slug = computed(() => String(route.params.slug))
const timeZone = computed(() => (
  workspace.value?.onboarded ? workspace.value.profile.timezone : 'UTC'
))

async function openItem(id: string): Promise<void> {
  await noticeStore.markRead(slug.value, id)
}

async function markAll(): Promise<void> {
  await noticeStore.markAll(slug.value)
}

watch(slug, () => {
  void noticeStore.fetch(slug.value)
}, { immediate: true })
</script>

<template>
  <v-container class="nx-wide py-8">
    <header class="nx-pagehead nx-pagehead-row">
      <div>
        <h1>Notifications</h1>
        <p>Bookings, cancellations, and reschedules for this business.</p>
      </div>
      <v-btn v-if="unread > 0" variant="outlined" @click="markAll">Mark all read</v-btn>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <div class="nx-panel">
      <NoticeList v-if="items.length" :items="items" :time-zone="timeZone" @open="openItem" />
      <p v-else class="nx-notes-empty">No notifications yet.</p>
    </div>
  </v-container>
</template>
