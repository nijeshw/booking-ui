<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import mark from '@/assets/brand/nexora-mark.png'
import AppDateTimePicker from '@/components/AppDateTimePicker.vue'
import type { IBookSlot } from '@/interfaces/booking/book.interface'
import { useBookStore } from '@/stores/booking/book.store'
import { formatMinor, formatSlot, todayInZone } from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const book = useBookStore()
const { profile, slots, serviceId, date, error, booked, busy } = storeToRefs(book)
const staffId = ref('')
const chosen = ref<IBookSlot | null>(null)
const firstName = ref('')
const lastName = ref('')
const email = ref('')
const phone = ref('')

const staffChoices = computed(() => {
  const service = serviceId.value
  return (profile.value?.staff ?? []).filter((member) => member.serviceIds.includes(service))
})

const selectedService = computed(() => (
  profile.value?.services.find((service) => service.id === serviceId.value) ?? null
))

function letters(name: string): string {
  const parts = name.trim().split(/\s+/).slice(0, 2)
  const mark = parts.map((part) => part[0]?.toUpperCase() ?? '').join('')
  return mark || 'N'
}

const initials = computed(() => letters(profile.value?.name ?? ''))

const minDate = computed(() => todayInZone(profile.value?.timezone ?? 'UTC'))

const dateConfig = computed(() => ({
  altInput: true,
  altFormat: 'd-m-Y',
  dateFormat: 'Y-m-d',
  minDate: minDate.value,
  locale: { firstDayOfWeek: 1 },
}))

function pageFlag(key: string): boolean {
  const value = profile.value?.page?.[key]
  return typeof value === 'boolean' ? value : true
}

const showPrice = computed(() => pageFlag('booking.showPrice'))
const showDuration = computed(() => pageFlag('booking.showDuration'))
const showStaffName = computed(() => pageFlag('booking.showStaffName'))
const whenStep = computed(() => (showStaffName.value ? '03' : '02'))
const detailStep = computed(() => (showStaffName.value ? '04' : '03'))

const summary = computed(() => {
  if (!chosen.value || !profile.value) {
    return ''
  }
  const parts = [
    selectedService.value?.name,
    formatSlot(chosen.value.startAt, profile.value.timezone),
  ]
  if (showStaffName.value) {
    parts.push(chosen.value.staffName)
  }
  return parts.filter((part) => part).join(' · ')
})

function pickSlot(slot: IBookSlot): void {
  chosen.value = slot
}

async function confirm(): Promise<void> {
  if (!chosen.value) {
    return
  }
  await book.confirm(slug.value, {
    serviceId: serviceId.value,
    staffId: chosen.value.staffId,
    startAt: chosen.value.startAt,
    firstName: firstName.value,
    lastName: lastName.value,
    email: email.value || undefined,
    phone: phone.value || undefined,
  })
}

watch(slug, () => {
  void book.fetchProfile(slug.value)
}, { immediate: true })

watch(showStaffName, (visible) => {
  if (!visible) {
    staffId.value = ''
  }
})

watch([serviceId, staffId, date], () => {
  const earliest = minDate.value
  if (date.value && earliest && date.value < earliest) {
    date.value = earliest
    return
  }
  chosen.value = null
  void book.fetchSlots(slug.value, staffId.value)
})
</script>

<template>
  <div class="book-shell">
    <header class="book-hero">
      <div class="book-hero-art" aria-hidden="true">
        <span class="book-orb book-orb-blue" />
        <span class="book-orb book-orb-teal" />
      </div>
      <div class="book-wrap book-identity">
        <img v-if="profile?.logoUrl" class="book-logo" :src="profile.logoUrl" alt="">
        <span v-else-if="profile" class="book-mark">{{ initials }}</span>
        <div>
          <p v-if="profile" class="book-kicker">{{ profile.category }}</p>
          <h1>{{ profile?.name || 'Book' }}</h1>
          <p v-if="profile?.description" class="book-intro">{{ profile.description }}</p>
        </div>
      </div>
    </header>

    <main class="book-wrap book-main">
      <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>

      <section v-if="booked" class="book-panel book-done">
        <span class="book-done-mark" aria-hidden="true" />
        <p class="book-kicker book-kicker-ink">Confirmed</p>
        <h2>You are booked.</h2>
        <p v-if="email.trim()">Check your email for a link to cancel or reschedule.</p>
      </section>

      <div v-else-if="profile" class="book-flow">
        <section class="book-step">
          <header class="book-step-head">
            <span>01</span>
            <div>
              <h2>Service</h2>
              <p>Choose what you want to book.</p>
            </div>
          </header>
          <div v-if="profile.services.length" class="book-choices">
            <button
              v-for="service in profile.services"
              :key="service.id"
              type="button"
              class="book-choice"
              :class="{ 'is-on': serviceId === service.id, 'is-plain': !showDuration && !showPrice }"
              :aria-pressed="serviceId === service.id"
              @click="serviceId = service.id"
            >
              <strong>{{ service.name }}</strong>
              <span v-if="showDuration">{{ service.durationMinutes }} min</span>
              <em v-if="showPrice">{{ formatMinor(service.priceAmountMinor, service.currency) }}</em>
            </button>
          </div>
          <p v-else class="book-empty">No services are open for booking yet.</p>
        </section>

        <section v-if="showStaffName" class="book-step">
          <header class="book-step-head">
            <span>02</span>
            <div>
              <h2>Person</h2>
              <p>Anyone free, or a specific person.</p>
            </div>
          </header>
          <div class="book-pills">
            <button
              type="button"
              class="book-pill"
              :class="{ 'is-on': staffId === '' }"
              :aria-pressed="staffId === ''"
              @click="staffId = ''"
            >
              <span class="book-avatar">All</span>
              Any available
            </button>
            <button
              v-for="member in staffChoices"
              :key="member.id"
              type="button"
              class="book-pill"
              :class="{ 'is-on': staffId === member.id }"
              :aria-pressed="staffId === member.id"
              @click="staffId = member.id"
            >
              <span class="book-avatar">{{ letters(member.name) }}</span>
              {{ member.name }}
            </button>
          </div>
        </section>

        <section class="book-step">
          <header class="book-step-head">
            <span>{{ whenStep }}</span>
            <div>
              <h2>When</h2>
              <p>Pick a day, then a free time.</p>
            </div>
          </header>
          <AppDateTimePicker
            v-model="date"
            class="book-date"
            label="Date"
            placeholder="Select a date"
            :config="dateConfig"
          />
          <div v-if="slots.length" class="book-times">
            <button
              v-for="slot in slots"
              :key="`${slot.staffId}-${slot.startAt}`"
              type="button"
              class="book-time"
              :class="{ 'is-on': chosen?.startAt === slot.startAt && chosen.staffId === slot.staffId }"
              :aria-pressed="chosen?.startAt === slot.startAt && chosen.staffId === slot.staffId"
              @click="pickSlot(slot)"
            >
              {{ formatSlot(slot.startAt, profile.timezone) }}
              <span v-if="showStaffName && staffChoices.length > 1">{{ slot.staffName }}</span>
            </button>
          </div>
          <p v-else class="book-empty">No open times on this day.</p>
        </section>

        <section v-if="chosen" class="book-step book-details">
          <header class="book-step-head">
            <span>{{ detailStep }}</span>
            <div>
              <h2>Your details</h2>
              <p>We use this to confirm the booking.</p>
            </div>
          </header>
          <p class="book-summary">{{ summary }}</p>
          <div class="book-names">
            <v-text-field v-model="firstName" label="First name" />
            <v-text-field v-model="lastName" label="Last name" />
          </div>
          <v-text-field v-model="email" label="Email" type="email" />
          <v-text-field v-model="phone" label="Phone" />
          <v-btn class="book-confirm" color="primary" size="large" :loading="busy" @click="confirm">
            Confirm booking
          </v-btn>
        </section>
      </div>

      <p v-else-if="!error" class="book-wait">Loading the booking page.</p>
    </main>

    <footer class="book-foot">
      <router-link to="/">
        <img :src="mark" alt="">
        Nexora
      </router-link>
    </footer>
  </div>
</template>
