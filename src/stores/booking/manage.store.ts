import { defineStore } from 'pinia'
import type { IBookSlot, IManagedBooking, IRescheduleInput } from '@/interfaces/booking/book.interface'
import bookService from '@/services/booking/book.service'
import { errorMessage } from '@/utils/error'

export const useManageStore = defineStore('manage-booking', {
  state: () => ({
    booking: null as IManagedBooking | null,
    slots: [] as IBookSlot[],
    error: '',
    notice: '',
    cancelling: false,
    moving: false,
    slotsLoaded: false,
    finished: false,
  }),
  actions: {
    async fetch(slug: string, token: string): Promise<void> {
      this.error = ''
      this.notice = ''
      try {
        this.booking = await bookService.manage(slug, token)
      } catch (caught) {
        this.error = errorMessage(caught)
      }
    },
    async fetchSlots(slug: string, token: string, date: string): Promise<void> {
      if (this.finished || !this.booking?.canReschedule || !date) {
        this.slots = []
        this.slotsLoaded = true
        return
      }
      this.slotsLoaded = false
      const params = new URLSearchParams({
        serviceId: this.booking.serviceId,
        staffId: this.booking.staffId,
        date,
      })
      try {
        this.slots = await bookService.slots(slug, params, token)
        this.slotsLoaded = true
      } catch (caught) {
        this.slotsLoaded = true
        this.error = errorMessage(caught)
      }
    },
    async cancel(slug: string, token: string): Promise<void> {
      this.error = ''
      this.cancelling = true
      try {
        await bookService.cancel(slug, token)
        this.finished = true
        this.notice = 'This booking is cancelled.'
        if (this.booking) {
          this.booking = {
            ...this.booking,
            status: 'CANCELLED',
            canCancel: false,
            canReschedule: false,
          }
        }
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.cancelling = false
      }
    },
    async reschedule(slug: string, token: string, input: IRescheduleInput): Promise<void> {
      this.error = ''
      this.moving = true
      try {
        this.booking = await bookService.reschedule(slug, token, input)
        this.finished = true
        this.notice = 'This booking has been moved. Check your email for the updated link.'
        this.slots = []
      } catch (caught) {
        this.error = errorMessage(caught)
      } finally {
        this.moving = false
      }
    },
  },
})
