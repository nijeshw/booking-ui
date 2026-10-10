<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { storeToRefs } from 'pinia'
import NoticeList from '@/layouts/components/NoticeList.vue'
import type { INotice } from '@/interfaces/business/notice.interface'
import { useNoticeStore } from '@/stores/business/notice.store'
import { useWorkspaceStore } from '@/stores/business/workspace.store'

const route = useRoute()
const noticeStore = useNoticeStore()
const workspaceStore = useWorkspaceStore()
const { unread } = storeToRefs(noticeStore)
const { workspace } = storeToRefs(workspaceStore)
const open = ref(false)
const preview = ref<INotice[]>([])
let timer: ReturnType<typeof setInterval> | undefined

const slug = computed(() => (
  typeof route.params.slug === 'string' ? route.params.slug : ''
))

const timeZone = computed(() => (
  workspace.value?.onboarded ? workspace.value.profile.timezone : 'UTC'
))

const allTo = computed(() => (
  slug.value ? `/businesses/${slug.value}/notifications` : '/dashboard'
))

async function loadPreview(): Promise<void> {
  if (!slug.value) {
    preview.value = []
    return
  }
  try {
    preview.value = await noticeStore.peek(slug.value)
  } catch {
    preview.value = []
  }
}

async function openItem(id: string): Promise<void> {
  if (!slug.value) {
    return
  }
  await noticeStore.markRead(slug.value, id)
  preview.value = preview.value.map((item) => (
    item.id === id ? { ...item, read: true } : item
  ))
}

watch(open, (value) => {
  if (value) {
    void loadPreview()
  }
})

watch(slug, () => {
  void loadPreview()
})

onMounted(() => {
  void loadPreview()
  timer = setInterval(() => {
    void loadPreview()
  }, 30_000)
})

onUnmounted(() => {
  if (timer) {
    clearInterval(timer)
  }
})
</script>

<template>
  <v-menu
    v-if="slug"
    v-model="open"
    location="bottom end"
    :close-on-content-click="false"
    content-class="nx-notes-menu"
  >
    <template #activator="{ props: menuProps }">
      <div class="nx-note-menu" v-bind="menuProps">
        <v-badge dot color="error" :model-value="unread > 0">
          <v-btn class="nx-theme-btn" icon="mdi-bell-outline" variant="text" />
        </v-badge>
        <v-tooltip activator="parent" location="bottom">Notifications</v-tooltip>
      </div>
    </template>
    <div class="nx-notes">
      <div class="nx-notes-head">
        <h2>Notifications</h2>
        <v-chip color="primary" size="small" variant="flat">{{ unread }} New</v-chip>
      </div>
      <div v-if="preview.length" class="nx-notes-list">
        <NoticeList :items="preview" :time-zone="timeZone" @open="openItem" />
      </div>
      <p v-else class="nx-notes-empty">No notifications yet.</p>
      <router-link class="nx-notes-foot" :to="allTo" @click="open = false">
        View all notifications
      </router-link>
    </div>
  </v-menu>
</template>
