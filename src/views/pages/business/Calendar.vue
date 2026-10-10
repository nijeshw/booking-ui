<script setup lang="ts">
import { DateTime } from 'luxon'
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import type { IBookProfile, IBookSlot } from '@/interfaces/booking/book.interface'
import bookService from '@/services/booking/book.service'
import { useCalendarStore } from '@/stores/business/calendar.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import { dayInZone, formatSlot, startOfWeek } from '@/utils/booking'
import { errorMessage } from '@/utils/error'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const calendar = useCalendarStore()
const tenants = useTenantStore()
const { appointments, timeZone, error, cancelling } = storeToRefs(calendar)
const { permissions, userTenants } = storeToRefs(tenants)
const cursor = ref(startOfWeek())
const shifted = ref(false)
const profile = ref<IBookProfile | null>(null)
const profileSlug = ref('')
const serviceId = ref('')
const staffFilter = ref<string | null>('')
const openSlots = ref<IBookSlot[]>([])
const booking = ref<IBookSlot | null>(null)
const bookServiceId = ref('')
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')
const bookError = ref('')
const bookingBusy = ref(false)
let ticket = 0

const canManage = computed(() => {
  const role = userTenants.value.find((link) => link.tenant.slug === slug.value)?.role ?? ''
  return role === 'OWNER' || permissions.value.mine.includes('calendar.manage')
})

const serviceChoices = computed(() => (
  (profile.value?.services ?? []).map((service) => ({ title: service.name, value: service.id }))
))

const staffChoices = computed(() => (
  (profile.value?.staff ?? []).filter((member) => member.serviceIds.includes(serviceId.value))
))

const bookServiceChoices = computed(() => {
  const member = profile.value?.staff.find((item) => item.id === booking.value?.staffId)
  const allowed = new Set(member?.serviceIds ?? [])
  return (profile.value?.services ?? [])
    .filter((service) => allowed.has(service.id))
    .map((service) => ({ title: service.name, value: service.id }))
})

const bookingWindow = computed(() => {
  const slot = booking.value
  const service = profile.value?.services.find((item) => item.id === bookServiceId.value)
  if (!slot || !service) {
    return ''
  }
  const start = DateTime.fromISO(slot.startAt).setZone(timeZone.value)
  const end = start.plus({ minutes: service.durationMinutes })
  return `${start.toFormat('HH:mm')}–${end.toFormat('HH:mm')}`
})

const weekLabel = computed(() => {
  const end = cursor.value.plus({ days: 6 })
  const label = (value: DateTime): string =>
    value.setLocale('en-GB').toLocaleString({ day: 'numeric', month: 'short' })
  return `${label(cursor.value)} – ${label(end)}`
})

const days = computed(() => {
  const zone = timeZone.value
  const today = DateTime.now().setZone(zone).toISODate()
  return Array.from({ length: 7 }, (_, index) => {
    const day = cursor.value.plus({ days: index })
    const key = day.toISODate() ?? ''
    const items = appointments.value.filter((appointment) => dayInZone(appointment.startAt, zone) === key)
    const opens = openSlots.value.filter((slot) => dayInZone(slot.startAt, zone) === key)
    const grouped = new Map<string, IBookSlot[]>()
    for (const slot of opens) {
      const list = grouped.get(slot.startAt) ?? []
      list.push(slot)
      grouped.set(slot.startAt, list)
    }
    const entries = [
      ...items.map((appointment) => ({
        kind: 'booked' as const,
        id: appointment.id,
        at: appointment.startAt,
        appointment,
      })),
      ...[...grouped.entries()].map(([at, slots]) => ({
        kind: 'open' as const,
        id: at,
        at,
        slots,
      })),
    ].sort((left, right) => left.at.localeCompare(right.at))
    return {
      key,
      name: day.setLocale('en-GB').toFormat('ccc'),
      date: day.toFormat('d'),
      today: key === today,
      entries,
    }
  })
})

function shift(daysToMove: number): void {
  shifted.value = true
  cursor.value = cursor.value.plus({ days: daysToMove })
}

function thisWeek(): void {
  shifted.value = true
  cursor.value = startOfWeek(DateTime.now().setZone(timeZone.value))
}

function range(): { from: string; to: string } {
  const start = cursor.value.startOf('day')
  return {
    from: start.toUTC().toISO() ?? '',
    to: start.plus({ days: 7 }).toUTC().toISO() ?? '',
  }
}

async function loadOpenSlots(currentSlug: string, current: number): Promise<void> {
  if (!serviceId.value) {
    openSlots.value = []
    return
  }
  const dates = Array.from({ length: 7 }, (_, index) => cursor.value.plus({ days: index }).toISODate() ?? '')
  const lists = await Promise.all(dates.map((date) => {
    const params = new URLSearchParams({ serviceId: serviceId.value, date })
    if (staffFilter.value) {
      params.set('staffId', staffFilter.value)
    }
    return bookService.slots(currentSlug, params)
  }))
  if (current !== ticket) {
    return
  }
  openSlots.value = lists.flat()
}

async function load(): Promise<void> {
  const current = ++ticket
  const currentSlug = slug.value
  const { from, to } = range()
  await calendar.fetch(currentSlug, from, to)
  if (current !== ticket || slug.value !== currentSlug) {
    return
  }
  try {
    if (profileSlug.value !== currentSlug) {
      const next = await bookService.profile(currentSlug)
      if (current !== ticket) {
        return
      }
      profile.value = next
      profileSlug.value = currentSlug
      const ids = next.services.map((service) => service.id)
      if (!ids.includes(serviceId.value)) {
        serviceId.value = ids[0] ?? ''
        staffFilter.value = ''
        return
      }
    }
  } catch (caught) {
    bookError.value = errorMessage(caught)
    openSlots.value = []
    return
  }
  try {
    await loadOpenSlots(currentSlug, current)
  } catch (caught) {
    if (current === ticket) {
      bookError.value = errorMessage(caught)
      openSlots.value = []
    }
  }
}

async function cancel(id: string): Promise<void> {
  const { from, to } = range()
  await calendar.cancel(slug.value, id, from, to)
  await load()
}

function openOnly(slots: IBookSlot[]): void {
  const slot = slots[0]
  if (slot) {
    openBook(slot)
  }
}

function slotRange(slots: IBookSlot[]): string {
  const slot = slots[0]
  if (!slot) {
    return ''
  }
  return `${formatSlot(slot.startAt, timeZone.value)}–${formatSlot(slot.endAt, timeZone.value)}`
}

function openBook(slot: IBookSlot): void {
  bookError.value = ''
  firstName.value = ''
  lastName.value = ''
  email.value = ''
  phone.value = ''
  const member = profile.value?.staff.find((item) => item.id === slot.staffId)
  const allowed = member?.serviceIds ?? []
  bookServiceId.value = allowed.includes(serviceId.value) ? serviceId.value : (allowed[0] ?? '')
  booking.value = slot
}

async function confirmBook(): Promise<void> {
  const slot = booking.value
  if (!slot || !bookServiceId.value) {
    bookError.value = 'Choose a service'
    return
  }
  if (!firstName.value.trim() || !lastName.value.trim()) {
    bookError.value = 'Enter a first and last name'
    return
  }
  bookingBusy.value = true
  bookError.value = ''
  try {
    await bookService.book(slug.value, {
      serviceId: bookServiceId.value,
      staffId: slot.staffId,
      startAt: slot.startAt,
      firstName: firstName.value.trim(),
      lastName: lastName.value.trim(),
      email: email.value.trim() || undefined,
      phone: phone.value.trim() || undefined,
    })
    booking.value = null
    await load()
  } catch (caught) {
    bookError.value = errorMessage(caught)
  } finally {
    bookingBusy.value = false
  }
}

watch([slug, cursor, serviceId, staffFilter], () => {
  void load()
}, { immediate: true })

watch(serviceId, () => {
  const member = profile.value?.staff.find((item) => item.id === staffFilter.value)
  if (member && !member.serviceIds.includes(serviceId.value)) {
    staffFilter.value = ''
  }
})

watch(timeZone, (zone) => {
  if (!shifted.value) {
    cursor.value = startOfWeek(DateTime.now().setZone(zone))
  }
})
</script>

<template>
  <v-container fluid class="nx-cal-page py-4">
    <header class="nx-cal-bar">
      <div class="nx-cal-title">
        <h1>Calendar</h1>
        <p>{{ weekLabel }} · {{ appointments.length }} booked</p>
      </div>
      <v-select
        v-model="serviceId"
        class="nx-cal-select"
        placeholder="Service"
        density="compact"
        hide-details
        :items="serviceChoices"
      />
      <v-select
        v-model="staffFilter"
        class="nx-cal-select"
        placeholder="Staff"
        density="compact"
        clearable
        hide-details
        :items="[{ title: 'Any available', value: '' }, ...staffChoices.map((member) => ({ title: member.name, value: member.id }))]"
      />
      <div class="nx-actions">
        <v-btn variant="outlined" @click="shift(-7)">Previous</v-btn>
        <v-btn variant="outlined" @click="thisWeek">Today</v-btn>
        <v-btn variant="outlined" @click="shift(7)">Next</v-btn>
      </div>
    </header>
    <v-alert v-if="error || (bookError && !booking)" type="error" class="mb-4">{{ bookError || error }}</v-alert>
    <p v-if="!serviceId" class="nx-meta mb-4">Choose a service to see open times.</p>
    <div class="nx-cal">
      <section
        v-for="day in days"
        :key="day.key"
        class="nx-cal-day"
        :class="{ 'is-today': day.today }"
      >
        <header>
          <span>{{ day.name }}</span>
          <strong>{{ day.date }}</strong>
        </header>
        <template v-for="entry in day.entries" :key="entry.id">
          <article v-if="entry.kind === 'booked'" class="nx-slot">
            <div>
              <p class="nx-slot-time">{{ formatSlot(entry.appointment.startAt, timeZone) }}–{{ formatSlot(entry.appointment.endAt, timeZone) }}</p>
              <p class="nx-slot-who">{{ entry.appointment.customer.firstName }} {{ entry.appointment.customer.lastName }}</p>
              <p class="nx-slot-meta">{{ entry.appointment.service.name }} · {{ entry.appointment.staff.name }}</p>
            </div>
            <div v-if="canManage">
              <v-btn
                color="error"
                icon="mdi-close"
                size="x-small"
                variant="text"
                :loading="cancelling === entry.appointment.id"
                @click="cancel(entry.appointment.id)"
              />
              <v-tooltip activator="parent">Cancel</v-tooltip>
            </div>
          </article>
          <v-menu v-else-if="entry.slots.length > 1" location="bottom start">
            <template #activator="{ props: menuProps }">
              <button type="button" class="nx-open" v-bind="menuProps">
                <span>{{ slotRange(entry.slots) }}</span>
                <span class="nx-open-count">{{ entry.slots.length }}</span>
              </button>
            </template>
            <v-list density="compact" class="nx-open-menu">
              <v-list-item
                v-for="slot in entry.slots"
                :key="slot.staffId"
                :title="slot.staffName"
                @click="openBook(slot)"
              />
            </v-list>
          </v-menu>
          <button v-else type="button" class="nx-open" @click="openOnly(entry.slots)">
            {{ slotRange(entry.slots) }}
          </button>
        </template>
        <p v-if="!day.entries.length" class="nx-cal-empty">No open times</p>
      </section>
    </div>

    <v-dialog :model-value="booking !== null" max-width="480" @update:model-value="(open) => { if (!open) booking = null }">
      <v-card v-if="booking">
        <v-card-title class="text-h6 px-4 py-3">Book</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <div class="nx-book-when">
            <strong>{{ bookingWindow }}</strong>
            <span>{{ booking.staffName }}</span>
          </div>
          <v-alert v-if="bookError" type="error" class="mb-4">{{ bookError }}</v-alert>
          <v-select v-model="bookServiceId" label="Service" :items="bookServiceChoices" />
          <v-text-field v-model="firstName" label="First name" />
          <v-text-field v-model="lastName" label="Last name" />
          <v-text-field v-model="email" label="Email" type="email" />
          <v-text-field v-model="phone" label="Phone" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="booking = null">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="bookingBusy" @click="confirmBook">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
