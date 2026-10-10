import { defineStore } from 'pinia'
import type { ISettingGroup, SettingValue } from '@/interfaces/business/setting.interface'
import settingService from '@/services/business/setting.service'
import { errorMessage } from '@/utils/error'

export const useSettingStore = defineStore('setting', {
  state: () => ({
    groups: [] as ISettingGroup[],
    values: {} as Record<string, SettingValue>,
    error: '',
    busy: false,
    saved: false,
  }),
  actions: {
    async fetch(slug: string): Promise<void> {
      this.error = ''
      this.saved = false
      try {
        const catalog = await settingService.get(slug)
        this.groups = catalog.groups
        this.values = Object.fromEntries(
          catalog.groups.flatMap((group) => group.items.map((item) => [item.key, item.value])),
        )
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },

    set(key: string, value: SettingValue): void {
      this.values = { ...this.values, [key]: value }
      this.saved = false
    },

    async save(slug: string): Promise<void> {
      this.busy = true
      this.error = ''
      try {
        const catalog = await settingService.save(slug, this.values)
        this.groups = catalog.groups
        this.values = Object.fromEntries(
          catalog.groups.flatMap((group) => group.items.map((item) => [item.key, item.value])),
        )
        this.saved = true
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
  },
})
