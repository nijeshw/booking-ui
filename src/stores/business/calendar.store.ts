import { defineStore } from 'pinia'
import type { IAppointment } from '@/interfaces/business/calendar.interface'
import calendarService from '@/services/business/calendar.service'
import { errorMessage } from '@/utils/error'

export const useCalendarStore = defineStore('calendar', {
  state: () => ({
    appointments: [] as IAppointment[],
    timeZone: 'Europe/London',
    error: '',
    cancelling: '',
  }),
  actions: {
    async fetch(slug: string, from: string, to: string): Promise<void> {
      this.error = ''
      try {
        const workspace = await calendarService.workspace(slug)
        if (workspace.profile?.timezone) {
          this.timeZone = workspace.profile.timezone
        }
        this.appointments = await calendarService.list(slug, from, to)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async cancel(slug: string, id: string, from: string, to: string): Promise<void> {
      this.error = ''
      this.cancelling = id
      try {
        await calendarService.cancel(slug, id)
        await this.fetch(slug, from, to)
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.cancelling = ''
      }
    },
  },
})
