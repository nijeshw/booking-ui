import { defineStore } from 'pinia'
import type { IBookInput, IBookProfile, IBookSlot } from '@/interfaces/booking/book.interface'
import bookService from '@/services/booking/book.service'
import { todayInZone } from '@/utils/booking'
import { errorMessage } from '@/utils/error'

export const useBookStore = defineStore('book', {
  state: () => ({
    profile: null as IBookProfile | null,
    slots: [] as IBookSlot[],
    serviceId: '',
    date: '',
    error: '',
    booked: false,
    busy: false,
  }),
  actions: {
    async fetchProfile(slug: string): Promise<void> {
      this.error = ''
      this.booked = false
      try {
        this.profile = await bookService.profile(slug)
        this.serviceId = this.profile.services[0]?.id ?? ''
        this.date = todayInZone(this.profile.timezone)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async fetchSlots(slug: string, staffId: string): Promise<void> {
      this.slots = []
      if (!this.serviceId || !this.date) {
        return
      }
      const params = new URLSearchParams({ serviceId: this.serviceId, date: this.date })
      if (staffId) {
        params.set('staffId', staffId)
      }
      try {
        this.slots = await bookService.slots(slug, params)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async confirm(slug: string, input: IBookInput): Promise<void> {
      this.error = ''
      this.busy = true
      try {
        await bookService.book(slug, input)
        this.booked = true
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.busy = false
      }
    },
  },
})
