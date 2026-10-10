<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import AppDateTimePicker from '@/components/AppDateTimePicker.vue'
import type { IBookSlot } from '@/interfaces/booking/book.interface'
import { useManageStore } from '@/stores/booking/manage.store'
import { dayInZone, formatSlot } from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const token = computed(() => String(route.params.token))
const manage = useManageStore()
const { booking, slots, error, notice, cancelling, moving, slotsLoaded, finished } = storeToRefs(manage)
const date = ref('')
const chosen = ref<IBookSlot | null>(null)
const dateConfig = {
  altInput: true,
  altFormat: 'd-m-Y',
  dateFormat: 'Y-m-d',
  locale: { firstDayOfWeek: 1 },
}

async function load(): Promise<void> {
  await manage.fetch(slug.value, token.value)
  if (!booking.value) {
    return
  }
  const nextDate = dayInZone(booking.value.startAt, booking.value.timezone)
  if (date.value === nextDate) {
    await manage.fetchSlots(slug.value, token.value, date.value)
  } else {
    date.value = nextDate
  }
}

async function cancel(): Promise<void> {
  await manage.cancel(slug.value, token.value)
}

async function reschedule(): Promise<void> {
  if (!chosen.value) {
    return
  }
  await manage.reschedule(slug.value, token.value, {
    startAt: chosen.value.startAt,
    staffId: chosen.value.staffId,
  })
  if (finished.value) {
    chosen.value = null
  }
}

watch([slug, token], () => {
  void load()
}, { immediate: true })

watch(date, () => {
  chosen.value = null
  void manage.fetchSlots(slug.value, token.value, date.value)
})
</script>

<template>
      <v-container class="book-page nx-read py-10">
      <header class="nx-pagehead">
        <h1>Your booking</h1>
      </header>
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
      <v-alert v-if="notice" type="success" class="mb-4">{{ notice }}</v-alert>
      <template v-if="booking">
        <p class="nx-lead">{{ booking.serviceName }} with {{ booking.staffName }}</p>
        <p class="nx-meta mb-6">
          {{ formatSlot(booking.startAt, booking.timezone) }}
          – {{ formatSlot(booking.endAt, booking.timezone) }}
          · {{ booking.customerFirstName }}
        </p>
        <v-btn
          v-if="booking.canCancel && !finished"
          color="error"
          variant="outlined"
          class="mb-6"
          :loading="cancelling"
          @click="cancel"
        >
          Cancel booking
        </v-btn>
        <template v-if="booking.canReschedule && !finished">
          <AppDateTimePicker
            v-model="date"
            label="Move to"
            placeholder="Select a date"
            :config="dateConfig"
          />
          <div class="nx-slots">
            <v-btn
              v-for="slot in slots"
              :key="`${slot.staffId}-${slot.startAt}`"
              :variant="chosen?.startAt === slot.startAt ? 'flat' : 'outlined'"
              color="primary"
              @click="chosen = slot"
            >
              {{ formatSlot(slot.startAt, booking.timezone) }}
            </v-btn>
          </div>
          <p v-if="slotsLoaded && slots.length === 0" class="nx-empty">No open times on this day.</p>
          <v-btn v-if="chosen" class="mt-4" color="primary" :loading="moving" @click="reschedule">Confirm new time</v-btn>
        </template>
      </template>
    </v-container>
  </template>
