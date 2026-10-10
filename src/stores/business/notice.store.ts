import { defineStore } from 'pinia'
import type { INotice } from '@/interfaces/business/notice.interface'
import noticeService from '@/services/business/notice.service'
import { errorMessage } from '@/utils/error'

export const useNoticeStore = defineStore('notice', {
  state: () => ({
    unread: 0,
    items: [] as INotice[],
    error: '',
  }),
  actions: {
    async fetch(slug: string, limit = 50): Promise<void> {
      try {
        const result = await noticeService.list(slug, limit)
        this.unread = result.unread
        this.items = result.items
        this.error = ''
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },

    async peek(slug: string): Promise<INotice[]> {
      const result = await noticeService.list(slug, 12)
      this.unread = result.unread
      return result.items
    },

    async markRead(slug: string, id: string): Promise<void> {
      const result = await noticeService.read(slug, id)
      this.unread = result.unread
      this.items = this.items.map((item) => (item.id === id ? { ...item, read: true } : item))
    },

    async markAll(slug: string): Promise<void> {
      const result = await noticeService.readAll(slug)
      this.unread = result.unread
      this.items = this.items.map((item) => ({ ...item, read: true }))
    },
  },
})
