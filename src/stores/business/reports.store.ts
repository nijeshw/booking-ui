import { defineStore } from 'pinia'
import type { IReport } from '@/interfaces/business/report.interface'
import reportsService from '@/services/business/reports.service'
import { errorMessage } from '@/utils/error'

export const useReportsStore = defineStore('reports', {
  state: () => ({
    report: null as IReport | null,
    error: '',
    busy: false,
  }),
  actions: {
    async fetch(slug: string, from: string, to: string): Promise<void> {
      this.error = ''
      this.busy = true
      try {
        this.report = await reportsService.summary(slug, from, to)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
  },
})
