<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { useTabRoute } from '@/composables/useTabRoute'
import type { IHourRange, IService, IStaff } from '@/interfaces/business/workspace.interface'
import { staticPrimaryColor } from '@/plugins/vuetify/theme'
import { useWorkspaceStore } from '@/stores/business/workspace.store'
import { useTenantStore } from '@/stores/tenant/tenant.store'
import {
  WEEKDAYS,
  formatMinor,
  formatZonedDateTime,
  zonedLocalToUtcIso,
  minutesToTime,
  priceToMinor,
  timeToMinutes,
} from '@/utils/booking'

const route = useRoute()
const slug = computed(() => String(route.params.slug))
const workspaceStore = useWorkspaceStore()
const tenants = useTenantStore()
const { workspace, error, busy } = storeToRefs(workspaceStore)
const { permissions, userTenants } = storeToRefs(tenants)

const name = ref('')
const category = ref('')
const locationType = ref<'PHYSICAL' | 'MOBILE' | 'ONLINE'>('PHYSICAL')
const timezone = ref('Europe/London')
const contactEmail = ref('')
const contactPhone = ref('')
const addressLine1 = ref('')
const city = ref('')
const postcode = ref('')
const country = ref('GB')
const openDays = ref<Record<number, boolean>>({ 1: true, 2: true, 3: true, 4: true, 5: true })
const dayStart = ref<Record<number, string>>({})
const dayEnd = ref<Record<number, string>>({})
const splitDays = ref<Record<number, boolean>>({})
const splitStart = ref<Record<number, string>>({})
const splitEnd = ref<Record<number, string>>({})
const serviceName = ref('')
const duration = ref('60')
const price = ref('40')
const bufferAfter = ref('0')

const newServiceName = ref('')
const newServiceDuration = ref('30')
const newServicePrice = ref('25')
const newStaffName = ref('')
const newStaffServices = ref<string[]>([])
const newStaffSchedule = ref<'business' | 'own'>('business')
const editStaffSchedule = ref<'business' | 'own'>('business')
const addServiceOpen = ref(false)
const addStaffOpen = ref(false)
const addTimeOffOpen = ref(false)
const timeOffStart = ref('')
const timeOffEnd = ref('')
const timeOffReason = ref('')
const brandingDescription = ref('')
const setupTabs = ['business', 'hours', 'service']
const readyTabs = ['branding', 'services', 'staff', 'hours', 'timeoff']
const workspaceTabs = computed(() => (workspace.value?.onboarded ? readyTabs : setupTabs))
const workspaceReady = computed(() => workspace.value !== null)
const { tab, tabTo } = useTabRoute('workspace', workspaceTabs, workspaceReady)
const brandingLogoUrl = ref('')
const editingService = ref<IService | null>(null)
const removingService = ref<IService | null>(null)
const editServiceName = ref('')
const editServiceDuration = ref('')
const editServicePrice = ref('')
const editingStaff = ref<IStaff | null>(null)
const removingStaff = ref<IStaff | null>(null)
const editStaffName = ref('')
const editStaffServices = ref<string[]>([])

const currentRole = computed(() => (
  userTenants.value.find((link) => link.tenant.slug === slug.value)?.role ?? ''
))

const canSetup = computed(() => (
  currentRole.value === 'OWNER' || permissions.value.mine.includes('setup.manage')
))

const canServices = computed(() => (
  currentRole.value === 'OWNER' || permissions.value.mine.includes('services.manage')
))

const canStaff = computed(() => (
  currentRole.value === 'OWNER' || permissions.value.mine.includes('staff.manage')
))

function openingHours(): IHourRange[] {
  return WEEKDAYS.flatMap((day) => {
    if (!openDays.value[day.weekday]) {
      return []
    }
    const ranges: IHourRange[] = []
    const start = timeToMinutes(dayStart.value[day.weekday] || '09:00')
    const end = timeToMinutes(dayEnd.value[day.weekday] || '17:00')
    if (start !== null && end !== null) {
      ranges.push({ weekday: day.weekday, startMinute: start, endMinute: end })
    }
    if (splitDays.value[day.weekday]) {
      const secondStart = timeToMinutes(splitStart.value[day.weekday] || '13:00')
      const secondEnd = timeToMinutes(splitEnd.value[day.weekday] || '17:00')
      if (secondStart !== null && secondEnd !== null) {
        ranges.push({
          weekday: day.weekday,
          startMinute: secondStart,
          endMinute: secondEnd,
        })
      }
    }
    return ranges
  })
}

async function finishOnboarding(): Promise<void> {
  error.value = ''
  const priceAmountMinor = priceToMinor(price.value)
  if (priceAmountMinor === null) {
    error.value = 'Enter a price of zero or more'
    return
  }
  await workspaceStore.onboard(slug.value, {
    name: name.value,
    category: category.value,
    locationType: locationType.value,
    timezone: timezone.value,
    currency: 'GBP',
    country: country.value || 'GB',
    email: contactEmail.value,
    phone: contactPhone.value,
    addressLine1: addressLine1.value,
    city: city.value,
    postcode: postcode.value,
    hours: openingHours(),
    service: {
      name: serviceName.value,
      durationMinutes: Number(duration.value),
      priceAmountMinor,
      currency: 'GBP',
      bufferBeforeMinutes: 0,
      bufferAfterMinutes: Number(bufferAfter.value) || 0,
      active: true,
    },
  })
}

async function saveBranding(): Promise<void> {
  const title = name.value.trim()
  if (!title) {
    error.value = 'Enter a title'
    return
  }
  await workspaceStore.saveBranding(slug.value, {
    name: title,
    description: brandingDescription.value,
    logoUrl: brandingLogoUrl.value,
    brandColor: '',
  })
}

function openAddService(): void {
  error.value = ''
  newServiceName.value = ''
  newServiceDuration.value = '30'
  newServicePrice.value = '25'
  addServiceOpen.value = true
}

async function addService(): Promise<void> {
  const priceAmountMinor = priceToMinor(newServicePrice.value)
  if (priceAmountMinor === null || !workspace.value?.onboarded) {
    error.value = 'Enter a price of zero or more'
    return
  }
  const saved = await workspaceStore.addService(slug.value, {
    name: newServiceName.value,
    durationMinutes: Number(newServiceDuration.value),
    priceAmountMinor,
    currency: workspace.value.profile.currency,
    bufferBeforeMinutes: 0,
    bufferAfterMinutes: 0,
    active: true,
  })
  if (saved) {
    newServiceName.value = ''
    addServiceOpen.value = false
  }
}

function openEditService(service: IService): void {
  error.value = ''
  editingService.value = service
  editServiceName.value = service.name
  editServiceDuration.value = String(service.durationMinutes)
  editServicePrice.value = String(service.priceAmountMinor / 100)
}

async function saveService(): Promise<void> {
  const service = editingService.value
  if (!service) {
    return
  }
  const priceAmountMinor = priceToMinor(editServicePrice.value)
  if (!editServiceName.value.trim() || priceAmountMinor === null) {
    error.value = 'Enter a name and price'
    return
  }
  const saved = await workspaceStore.updateService(slug.value, service.id, {
    name: editServiceName.value,
    durationMinutes: Number(editServiceDuration.value),
    priceAmountMinor,
    currency: service.currency,
    bufferBeforeMinutes: service.bufferBeforeMinutes,
    bufferAfterMinutes: service.bufferAfterMinutes,
    active: service.active,
  })
  if (saved) {
    editingService.value = null
  }
}

async function removeService(): Promise<void> {
  if (!removingService.value) {
    return
  }
  const saved = await workspaceStore.removeService(slug.value, removingService.value.id)
  if (saved) {
    removingService.value = null
  }
}

function openEditStaff(member: IStaff): void {
  error.value = ''
  editingStaff.value = member
  editStaffName.value = member.name
  editStaffServices.value = [...member.serviceIds]
  const current = workspace.value
  editStaffSchedule.value = current?.onboarded && current.staffHours.some((row) => row.staffId === member.id)
    ? 'own'
    : 'business'
}

async function saveStaff(): Promise<void> {
  const member = editingStaff.value
  if (!member || !editStaffName.value.trim()) {
    error.value = 'Enter a name'
    return
  }
  const current = workspace.value
  const hadOwnHours = current?.onboarded
    ? current.staffHours.some((row) => row.staffId === member.id)
    : false
  const saved = await workspaceStore.updateStaff(slug.value, member.id, {
    name: editStaffName.value,
    serviceIds: editStaffServices.value,
  })
  if (!saved) {
    return
  }
  const wantsOwnHours = editStaffSchedule.value === 'own'
  if (canSetup.value && wantsOwnHours !== hadOwnHours) {
    await workspaceStore.saveStaffHours(
      slug.value,
      member.id,
      wantsOwnHours ? openingHours() : [],
    )
  }
  editingStaff.value = null
}

async function removeStaff(): Promise<void> {
  if (!removingStaff.value) {
    return
  }
  const saved = await workspaceStore.removeStaff(slug.value, removingStaff.value.id)
  if (saved) {
    removingStaff.value = null
  }
}

function openAddStaff(): void {
  error.value = ''
  newStaffName.value = ''
  newStaffServices.value = []
  newStaffSchedule.value = 'business'
  addStaffOpen.value = true
}

async function addStaff(): Promise<void> {
  const created = await workspaceStore.addStaff(slug.value, {
    name: newStaffName.value,
    serviceIds: newStaffServices.value,
  })
  if (!created) {
    return
  }
  if (canSetup.value && newStaffSchedule.value === 'own') {
    await workspaceStore.saveStaffHours(slug.value, created.id, openingHours())
  }
  newStaffName.value = ''
  newStaffServices.value = []
  newStaffSchedule.value = 'business'
  addStaffOpen.value = false
}

async function saveHours(): Promise<void> {
  await workspaceStore.saveHours(slug.value, openingHours())
}

function openAddTimeOff(): void {
  error.value = ''
  timeOffStart.value = ''
  timeOffEnd.value = ''
  timeOffReason.value = ''
  addTimeOffOpen.value = true
}

async function addTimeOff(): Promise<void> {
  if (!timeOffStart.value || !timeOffEnd.value) {
    error.value = 'Choose a start and end'
    return
  }
  const saved = await workspaceStore.addTimeOff(slug.value, {
    startsAt: zonedLocalToUtcIso(timeOffStart.value, workspace.value?.onboarded ? workspace.value.profile.timezone : timezone.value),
    endsAt: zonedLocalToUtcIso(timeOffEnd.value, workspace.value?.onboarded ? workspace.value.profile.timezone : timezone.value),
    reason: timeOffReason.value || undefined,
  })
  if (saved) {
    timeOffStart.value = ''
    timeOffEnd.value = ''
    timeOffReason.value = ''
    addTimeOffOpen.value = false
  }
}

async function removeTimeOff(id: string): Promise<void> {
  await workspaceStore.removeTimeOff(slug.value, id)
}

function fillHours(hours: IHourRange[]): void {
  for (const day of WEEKDAYS) {
    const ranges = hours
      .filter((item) => item.weekday === day.weekday)
      .sort((left, right) => left.startMinute - right.startMinute)
    const [first, second] = ranges
    openDays.value[day.weekday] = Boolean(first)
    dayStart.value[day.weekday] = minutesToTime(first?.startMinute ?? 9 * 60)
    dayEnd.value[day.weekday] = minutesToTime(first?.endMinute ?? 17 * 60)
    splitDays.value[day.weekday] = Boolean(second)
    splitStart.value[day.weekday] = minutesToTime(second?.startMinute ?? 13 * 60)
    splitEnd.value[day.weekday] = minutesToTime(second?.endMinute ?? 17 * 60)
  }
}

onMounted(async () => {
  for (const day of WEEKDAYS) {
    dayStart.value[day.weekday] = '09:00'
    dayEnd.value[day.weekday] = '17:00'
  }
  await workspaceStore.fetch(slug.value)
  await tenants.fetchUserTenants(true)
  const created = tenants.userTenants.find((link) => link.tenant.slug === slug.value)
  if (created) {
    contactEmail.value = created.tenant.email ?? ''
    contactPhone.value = created.tenant.phone ?? ''
    addressLine1.value = created.tenant.addressLine1 ?? ''
    city.value = created.tenant.city ?? ''
    postcode.value = created.tenant.postcode ?? ''
    country.value = created.tenant.country ?? 'GB'
  }
  if (workspace.value?.onboarded) {
    name.value = workspace.value.profile.name
    brandingDescription.value = workspace.value.profile.description ?? ''
    brandingLogoUrl.value = workspace.value.profile.logoUrl ?? ''
    fillHours(workspace.value.hours)
  }
})
</script>

<template>
  <v-container fluid class="nx-workspace-page py-4">
    <header class="nx-pagehead">
      <h1>{{ workspace?.onboarded ? (name || workspace.profile.name) : 'Setup' }}</h1>
      <p v-if="workspace?.onboarded" class="nx-lead">
        {{ workspace.profile.category }} · {{ workspace.profile.timezone }}
      </p>
      <p v-else-if="workspace" class="nx-lead">
        Tell customers what you offer, when you are open, and your first service.
      </p>
    </header>
    <v-alert v-if="error" type="error" class="mb-4">{{ error }}</v-alert>
    <v-progress-linear v-if="!workspace" indeterminate />

    <template v-else-if="!workspace.onboarded">
      <div class="nx-panel">
        <v-tabs :model-value="tab" color="primary" class="nx-tabs">
          <v-tab value="business" :to="tabTo('business')">Business</v-tab>
          <v-tab value="hours" :to="tabTo('hours')">Hours</v-tab>
          <v-tab value="service" :to="tabTo('service')">First service</v-tab>
        </v-tabs>
        <v-tabs-window :model-value="tab">
          <v-tabs-window-item value="business">
            <div class="nx-panel-body">
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="name" label="Business name" /></v-col>
                <v-col cols="12" md="6">
                  <v-text-field v-model="category" label="Category" hint="For example tutor, cleaner, or mechanic" persistent-hint />
                </v-col>
                <v-col cols="12" md="6">
                  <v-select
                    v-model="locationType"
                    label="Where you work"
                    :items="[
                      { title: 'At your premises', value: 'PHYSICAL' },
                      { title: 'You travel to the customer', value: 'MOBILE' },
                      { title: 'Online', value: 'ONLINE' },
                    ]"
                  />
                </v-col>
                <v-col cols="12" md="6"><v-text-field v-model="timezone" label="Timezone" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="contactEmail" label="Email" type="email" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="contactPhone" label="Phone" /></v-col>
                <v-col cols="12"><v-text-field v-model="addressLine1" label="Address" /></v-col>
                <v-col cols="12" md="5"><v-text-field v-model="city" label="City" /></v-col>
                <v-col cols="6" md="4"><v-text-field v-model="postcode" label="Postcode" /></v-col>
                <v-col cols="6" md="3"><v-text-field v-model="country" label="Country" maxlength="2" /></v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="hours">
            <div class="nx-panel-body nx-hours">
              <div v-for="day in WEEKDAYS" :key="day.weekday">
                <div class="nx-hour-row">
                  <v-checkbox v-model="openDays[day.weekday]" :label="day.label" hide-details />
                  <v-text-field v-model="dayStart[day.weekday]" type="time" label="Opens" hide-details :disabled="!openDays[day.weekday]" />
                  <v-text-field v-model="dayEnd[day.weekday]" type="time" label="Closes" hide-details :disabled="!openDays[day.weekday]" />
                </div>
                <div v-if="openDays[day.weekday]" class="nx-hour-split">
                  <v-checkbox v-model="splitDays[day.weekday]" label="Split shift" hide-details />
                  <v-text-field v-if="splitDays[day.weekday]" v-model="splitStart[day.weekday]" type="time" label="Opens again" hide-details />
                  <v-text-field v-if="splitDays[day.weekday]" v-model="splitEnd[day.weekday]" type="time" label="Closes again" hide-details />
                </div>
              </div>
            </div>
          </v-tabs-window-item>
          <v-tabs-window-item value="service">
            <div class="nx-panel-body">
              <v-row>
                <v-col cols="12" md="6"><v-text-field v-model="serviceName" label="Service name" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="duration" label="Minutes" type="number" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="price" label="Price" type="number" /></v-col>
                <v-col cols="12" md="6"><v-text-field v-model="bufferAfter" label="Buffer minutes" type="number" /></v-col>
              </v-row>
            </div>
          </v-tabs-window-item>
        </v-tabs-window>
        <div class="nx-panel-foot">
          <v-btn variant="flat" color="primary" :loading="busy" @click="finishOnboarding">Save</v-btn>
        </div>
      </div>
    </template>

    <div v-else class="nx-panel">
      <v-tabs :model-value="tab" color="primary" class="nx-tabs">
        <v-tab value="branding" :to="tabTo('branding')">Branding</v-tab>
        <v-tab value="services" :to="tabTo('services')">Services</v-tab>
        <v-tab value="staff" :to="tabTo('staff')">Staff</v-tab>
        <v-tab value="hours" :to="tabTo('hours')">Hours</v-tab>
        <v-tab value="timeoff" :to="tabTo('timeoff')">Time off</v-tab>
      </v-tabs>
      <v-tabs-window :model-value="tab">
        <v-tabs-window-item value="branding">
          <div class="nx-panel-body">
            <div class="nx-setup">
              <div>
                <v-text-field v-model="name" label="Title" />
                <v-textarea v-model="brandingDescription" label="Description" rows="3" />
                <v-text-field v-model="brandingLogoUrl" label="Logo URL" />
                <v-btn class="mb-3" variant="flat" color="primary" :loading="busy" @click="saveBranding">Save</v-btn>
              </div>
              <aside class="nx-preview">
                <div class="nx-preview-bar" :style="{ background: staticPrimaryColor }" />
                <img v-if="brandingLogoUrl" :src="brandingLogoUrl" alt="">
                <h2>{{ name || workspace.profile.name }}</h2>
                <p>{{ brandingDescription || 'Description shows on the booking page.' }}</p>
              </aside>
            </div>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="services">
          <div class="nx-panel-body">
            <div v-if="canServices" class="nx-toolbar">
              <p class="nx-meta">Services customers can book.</p>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddService">Add</v-btn>
            </div>
            <v-table v-if="workspace.services.length" class="nx-table mb-4">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Duration</th>
                  <th>Price</th>
                  <th>Buffer</th>
                  <th v-if="canServices" class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in workspace.services" :key="service.id">
                  <td>{{ service.name }}</td>
                  <td>{{ service.durationMinutes }} min</td>
                  <td>{{ formatMinor(service.priceAmountMinor, service.currency) }}</td>
                  <td>{{ service.bufferAfterMinutes ? `${service.bufferAfterMinutes} min` : '—' }}</td>
                  <td v-if="canServices" class="text-end">
                    <div class="d-flex justify-end">
                    <div>
                      <v-btn color="primary" icon="mdi-pencil-outline" class="mx-2 rounded" variant="outlined" rounded @click="openEditService(service)" />
                      <v-tooltip activator="parent">Edit</v-tooltip>
                    </div>
                    <div>
                      <v-btn color="error" icon="mdi-delete-outline" class="mx-2 rounded" variant="outlined" rounded @click="removingService = service" />
                      <v-tooltip activator="parent">Remove</v-tooltip>
                    </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta mb-4">No services yet.</p>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="staff">
          <div class="nx-panel-body">
            <div v-if="canStaff" class="nx-toolbar">
              <p class="nx-meta">People who take bookings.</p>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddStaff">Add</v-btn>
            </div>
            <v-table v-if="workspace.staff.length" class="nx-table mb-4">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Services</th>
                  <th>Schedule</th>
                  <th v-if="canStaff" class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="member in workspace.staff" :key="member.id">
                  <td>{{ member.name }}</td>
                  <td>{{ member.serviceIds.length }}</td>
                  <td>{{ workspace.staffHours.some((row) => row.staffId === member.id) ? 'Own hours' : 'Same as business' }}</td>
                  <td v-if="canStaff" class="text-end">
                    <div class="d-flex justify-end align-center">
                    <div v-if="canStaff">
                      <v-btn color="primary" icon="mdi-pencil-outline" class="mx-2 rounded" variant="outlined" rounded @click="openEditStaff(member)" />
                      <v-tooltip activator="parent">Edit</v-tooltip>
                    </div>
                    <div v-if="canStaff">
                      <v-btn color="error" icon="mdi-delete-outline" class="mx-2 rounded" variant="outlined" rounded @click="removingStaff = member" />
                      <v-tooltip activator="parent">Remove</v-tooltip>
                    </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta mb-4">No staff yet.</p>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="hours">
          <div class="nx-panel-body nx-hours">
            <p class="nx-meta mb-3">Leave a day unchecked to close it.</p>
            <div v-for="day in WEEKDAYS" :key="`edit-${day.weekday}`">
              <div class="nx-hour-row">
                <v-checkbox v-model="openDays[day.weekday]" :label="day.label" hide-details />
                <v-text-field v-model="dayStart[day.weekday]" type="time" label="Opens" hide-details :disabled="!openDays[day.weekday]" />
                <v-text-field v-model="dayEnd[day.weekday]" type="time" label="Closes" hide-details :disabled="!openDays[day.weekday]" />
              </div>
              <div v-if="openDays[day.weekday]" class="nx-hour-split">
                <v-checkbox v-model="splitDays[day.weekday]" label="Split shift" hide-details />
                <v-text-field v-if="splitDays[day.weekday]" v-model="splitStart[day.weekday]" type="time" label="Opens again" hide-details />
                <v-text-field v-if="splitDays[day.weekday]" v-model="splitEnd[day.weekday]" type="time" label="Closes again" hide-details />
              </div>
            </div>
            <v-btn class="mt-4 mb-3" variant="flat" color="primary" :loading="busy" @click="saveHours">Save</v-btn>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="timeoff">
          <div class="nx-panel-body">
            <div v-if="canSetup" class="nx-toolbar">
              <p class="nx-meta">Closures and time away from bookings.</p>
              <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddTimeOff">Add</v-btn>
            </div>
            <v-table v-if="workspace.timeOff.length" class="nx-table mb-4">
              <thead>
                <tr>
                  <th>Reason</th>
                  <th>Starts</th>
                  <th>Ends</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in workspace.timeOff" :key="item.id">
                  <td>{{ item.reason || 'Time off' }}</td>
                  <td>{{ formatZonedDateTime(item.startsAt, workspace.profile.timezone) }}</td>
                  <td>{{ formatZonedDateTime(item.endsAt, workspace.profile.timezone) }}</td>
                  <td class="text-end">
                    <div>
                      <v-btn color="error" icon="mdi-delete-outline" class="mx-2 rounded" variant="outlined" rounded @click="removeTimeOff(item.id)" />
                      <v-tooltip activator="parent">Remove</v-tooltip>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta mb-4">No time off yet.</p>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <v-dialog v-model="addTimeOffOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add time off</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="timeOffStart" label="Starts" type="datetime-local" />
          <v-text-field v-model="timeOffEnd" label="Ends" type="datetime-local" />
          <v-text-field v-model="timeOffReason" label="Reason" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="addTimeOffOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="addTimeOff">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addServiceOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add service</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="newServiceName" label="Service" />
          <v-text-field v-model="newServiceDuration" label="Minutes" type="number" />
          <v-text-field v-model="newServicePrice" label="Price" type="number" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="addServiceOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="addService">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="editingService !== null" max-width="480" @update:model-value="(open) => { if (!open) editingService = null }">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Edit service</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="editServiceName" label="Service" />
          <v-text-field v-model="editServiceDuration" label="Minutes" type="number" />
          <v-text-field v-model="editServicePrice" label="Price" type="number" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="editingService = null">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="saveService">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="removingService !== null" max-width="480" @update:model-value="(open) => { if (!open) removingService = null }">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Remove service</v-card-title>
        <v-divider />
        <v-card-text class="py-4 text-body-2">{{ removingService?.name }} will be removed. A service that already has bookings cannot be removed.</v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="removingService = null">Cancel</v-btn>
          <v-btn variant="flat" color="error" :loading="busy" @click="removeService">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="addStaffOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add staff</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="newStaffName" label="Name" />
          <v-select
            v-model="newStaffServices"
            :items="workspace?.onboarded ? workspace.services.map((service) => ({ title: service.name, value: service.id })) : []"
            label="Services"
            multiple
            chips
          />
          <template v-if="canSetup">
            <v-radio-group v-model="newStaffSchedule" label="Schedule" hide-details>
              <v-radio label="Same as business" value="business" />
              <v-radio label="Own hours" value="own" />
            </v-radio-group>
            <p class="nx-meta mb-4">Same as business follows the Hours tab. Own hours keeps a separate copy.</p>
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="addStaffOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="addStaff">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="editingStaff !== null" max-width="480" @update:model-value="(open) => { if (!open) editingStaff = null }">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Edit staff</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="editStaffName" label="Name" />
          <v-select
            v-model="editStaffServices"
            :items="workspace?.onboarded ? workspace.services.map((service) => ({ title: service.name, value: service.id })) : []"
            label="Services"
            multiple
            chips
          />
          <template v-if="canSetup">
            <v-radio-group v-model="editStaffSchedule" label="Schedule" hide-details>
              <v-radio label="Same as business" value="business" />
              <v-radio label="Own hours" value="own" />
            </v-radio-group>
            <p class="nx-meta mb-4">Same as business follows the Hours tab. Own hours keeps a separate copy.</p>
          </template>
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="editingStaff = null">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="saveStaff">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog :model-value="removingStaff !== null" max-width="480" @update:model-value="(open) => { if (!open) removingStaff = null }">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Remove staff</v-card-title>
        <v-divider />
        <v-card-text class="py-4 text-body-2">{{ removingStaff?.name }} will be removed. Someone who already has bookings cannot be removed.</v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="removingStaff = null">Cancel</v-btn>
          <v-btn variant="flat" color="error" :loading="busy" @click="removeStaff">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
