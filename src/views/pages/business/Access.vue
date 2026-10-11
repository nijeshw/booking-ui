<script setup lang="ts">
import { storeToRefs } from 'pinia'
import { computed, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useTabRoute } from '@/composables/useTabRoute'
import type { IBusinessUser } from '@/interfaces/tenant/tenant.interface'
import { useTenantStore } from '@/stores/tenant/tenant.store'

const route = useRoute()
const router = useRouter()
const slug = computed(() => String(route.params.slug))
const tenants = useTenantStore()
const { people, permissions, userTenants, busy } = storeToRefs(tenants)
const personName = ref('')
const personEmail = ref('')
const originalEmail = ref('')
const personRole = ref('')
const roleLabel = ref('')
const message = ref('')
const notice = ref('')
const { tab, tabTo } = useTabRoute('access', computed(() => ['people', 'roles']))
const addOpen = ref(false)
const editOpen = ref(false)
const removeOpen = ref(false)
const roleOpen = ref(false)
const removeRoleOpen = ref(false)
const editing = ref<IBusinessUser | null>(null)
const removing = ref<IBusinessUser | null>(null)
const selectedRole = ref('')
const permissionDrafts = ref<Record<string, string[]>>({})

const canManage = computed(() => (
  userTenants.value.some((link) => link.tenant.slug === slug.value && link.role === 'OWNER')
  || permissions.value.mine.includes('people.manage')
))

const assignableRoles = computed(() => permissions.value.roles.filter((role) => !role.locked))

const currentRole = computed(() => (
  permissions.value.roles.find((role) => role.role === selectedRole.value) ?? null
))

function roleTitle(role: string): string {
  return permissions.value.roles.find((item) => item.role === role)?.label
    ?? role.toLowerCase().replaceAll('_', ' ')
}

function hasPermission(key: string): boolean {
  if (currentRole.value?.locked) {
    return true
  }
  return permissionDrafts.value[selectedRole.value]?.includes(key) ?? false
}

function setPermission(key: string, enabled: boolean | null): void {
  const current = permissionDrafts.value[selectedRole.value] ?? []
  permissionDrafts.value[selectedRole.value] = enabled
    ? [...current.filter((item) => item !== key), key]
    : current.filter((item) => item !== key)
}

function openAdd(): void {
  message.value = ''
  notice.value = ''
  personName.value = ''
  personEmail.value = ''
  personRole.value = assignableRoles.value[0]?.role ?? ''
  addOpen.value = true
}

function openEdit(person: IBusinessUser): void {
  message.value = ''
  notice.value = ''
  editing.value = person
  personName.value = person.name ?? ''
  personEmail.value = person.email
  originalEmail.value = person.email
  personRole.value = person.role
  editOpen.value = true
}

function openRemove(person: IBusinessUser): void {
  message.value = ''
  notice.value = ''
  removing.value = person
  removeOpen.value = true
}

async function addPerson(): Promise<void> {
  message.value = ''
  notice.value = ''
  const name = personName.value.trim()
  const email = personEmail.value.trim()
  if (!name || !email || !personRole.value) {
    message.value = 'Enter a name, email, and role'
    return
  }
  const result = await tenants.grant(slug.value, { name, email, role: personRole.value })
  message.value = result
  if (!result) {
    addOpen.value = false
    notice.value = 'Person added'
  }
}

async function savePerson(): Promise<void> {
  if (!editing.value) {
    return
  }
  message.value = ''
  notice.value = ''
  const name = personName.value.trim()
  const email = personEmail.value.trim()
  if (!name || !email || !personRole.value) {
    message.value = 'Enter a name, email, and role'
    return
  }
  const result = await tenants.updatePerson(slug.value, {
    email: originalEmail.value,
    name,
    nextEmail: email,
    role: personRole.value,
  })
  message.value = result
  if (!result) {
    editOpen.value = false
    notice.value = 'Person updated'
  }
}

async function removePerson(): Promise<void> {
  if (!removing.value) {
    return
  }
  message.value = ''
  notice.value = ''
  const result = await tenants.removePerson(slug.value, removing.value.email)
  message.value = result
  if (!result) {
    removeOpen.value = false
    notice.value = 'Person removed'
  }
}

async function saveRolePermissions(): Promise<void> {
  if (!currentRole.value || currentRole.value.locked) {
    return
  }
  message.value = ''
  notice.value = ''
  const result = await tenants.savePermissions(
    slug.value,
    currentRole.value.role,
    permissionDrafts.value[currentRole.value.role] ?? [],
  )
  message.value = result
  if (!result) {
    notice.value = 'Permissions saved'
  }
}

async function addRole(): Promise<void> {
  message.value = ''
  notice.value = ''
  const label = roleLabel.value.trim()
  if (label.length < 2) {
    message.value = 'Enter a role name'
    return
  }
  const result = await tenants.createRole(slug.value, label)
  message.value = result
  if (!result) {
    const created = permissions.value.roles.find((role) => role.label === label)
    if (created) {
      selectedRole.value = created.role
    }
    roleOpen.value = false
    roleLabel.value = ''
    notice.value = 'Role added'
    void router.push(tabTo('roles'))
  }
}

function askRemoveRole(): void {
  if (!currentRole.value || currentRole.value.system) {
    return
  }
  removeRoleOpen.value = true
}

async function removeRole(): Promise<void> {
  if (!currentRole.value || currentRole.value.system) {
    return
  }
  message.value = ''
  notice.value = ''
  const result = await tenants.deleteRole(slug.value, currentRole.value.role)
  message.value = result
  if (!result) {
    removeRoleOpen.value = false
    selectedRole.value = permissions.value.roles[0]?.role ?? ''
    notice.value = 'Role removed'
  }
}

watch(permissions, (value) => {
  const drafts: Record<string, string[]> = {}
  for (const row of value.roles) {
    drafts[row.role] = [...row.permissions]
  }
  permissionDrafts.value = drafts
  if (!value.roles.some((row) => row.role === selectedRole.value)) {
    selectedRole.value = value.roles.find((row) => !row.locked)?.role ?? value.roles[0]?.role ?? ''
  }
}, { immediate: true })

onMounted(async () => {
  await tenants.fetchUserTenants(true)
  message.value = await tenants.fetchPermissions(slug.value)
  if (canManage.value) {
    const peopleMessage = await tenants.fetchPeople(slug.value)
    if (peopleMessage) {
      message.value = peopleMessage
    }
  }
})
</script>

<template>
  <v-container fluid class="nx-access-page py-4">
    <header class="nx-pagehead nx-pagehead-row">
      <div>
        <h1>Access</h1>
        <p class="nx-lead">People, roles, and what each role can do in this business.</p>
      </div>
    </header>
    <v-alert v-if="message" type="error" class="mb-4">{{ message }}</v-alert>
    <v-alert v-else-if="notice" type="success" class="mb-4">{{ notice }}</v-alert>
    <v-alert v-if="!canManage" type="info">You cannot change access for this business.</v-alert>

    <div v-else class="nx-panel">
      <v-tabs :model-value="tab" color="primary" class="nx-tabs">
        <v-tab value="people" :to="tabTo('people')">People</v-tab>
        <v-tab value="roles" :to="tabTo('roles')">Roles</v-tab>
      </v-tabs>
      <v-tabs-window :model-value="tab">
        <v-tabs-window-item value="people">
          <div class="nx-panel-body">
            <div class="nx-toolbar">
              <p class="nx-meta">Add someone by email. If they are new to Appointiva, they get a link to set a password.</p>
              <v-btn color="primary" prepend-icon="mdi-account-plus-outline" @click="openAdd">Add</v-btn>
            </div>
            <v-table v-if="people.length" class="nx-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th class="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="person in people" :key="person.email">
                  <td>{{ person.name || '—' }}</td>
                  <td>{{ person.email }}</td>
                  <td class="nx-role-name">{{ roleTitle(person.role) }}</td>
                  <td class="text-end">
                    <div v-if="person.role !== 'OWNER'" class="d-flex justify-end">
                      <div>
                        <v-btn color="primary" icon="mdi-pencil-outline" class="mx-2 rounded" variant="outlined" rounded @click="openEdit(person)" />
                        <v-tooltip activator="parent">Edit</v-tooltip>
                      </div>
                      <div>
                        <v-btn color="error" icon="mdi-delete-outline" class="mx-2 rounded" variant="outlined" rounded @click="openRemove(person)" />
                        <v-tooltip activator="parent">Remove</v-tooltip>
                      </div>
                    </div>
                  </td>
                </tr>
              </tbody>
            </v-table>
            <p v-else class="nx-meta">No one else has access yet.</p>
          </div>
        </v-tabs-window-item>
        <v-tabs-window-item value="roles">
          <div class="nx-panel-body">
            <div class="nx-access">
              <div>
                <div class="nx-toolbar">
                  <p class="nx-meta">Every role in this business.</p>
                  <v-btn color="primary" variant="tonal" prepend-icon="mdi-plus" @click="roleOpen = true">Add</v-btn>
                </div>
                <div class="nx-role-list">
                  <button
                    v-for="role in permissions.roles"
                    :key="role.role"
                    type="button"
                    class="nx-role"
                    :class="{ 'is-selected': role.role === selectedRole }"
                    @click="selectedRole = role.role"
                  >
                    <span>{{ role.label }}</span>
                    <span v-if="role.system" class="nx-role-tag">Built in</span>
                  </button>
                </div>
              </div>
              <div v-if="currentRole" class="nx-role-editor">
                <h2>{{ currentRole.label }}</h2>
                <p v-if="currentRole.locked" class="nx-meta">The owner always has every permission, so this role stays locked.</p>
                <p v-else class="nx-meta">These permissions apply to everyone with this role.</p>
                <v-checkbox
                  v-for="item in permissions.catalog"
                  :key="`${currentRole.role}-${item.key}`"
                  :model-value="hasPermission(item.key)"
                  :label="item.label"
                  :disabled="currentRole.locked"
                  hide-details
                  density="compact"
                  @update:model-value="setPermission(item.key, $event)"
                />
                <div class="nx-toolbar mt-4">
                  <v-btn
                    v-if="!currentRole.locked"
                    variant="flat"
                    color="primary"
                    :loading="busy"
                    @click="saveRolePermissions"
                  >
                    Save
                  </v-btn>
                  <v-btn
                    v-if="!currentRole.system"
                    variant="outlined"
                    color="error"
                    :loading="busy"
                    @click="askRemoveRole"
                  >
                    Remove
                  </v-btn>
                </div>
              </div>
            </div>
          </div>
        </v-tabs-window-item>
      </v-tabs-window>
    </div>

    <v-dialog v-model="addOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add person</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="personName" label="Name" />
          <v-text-field v-model="personEmail" label="Email" type="email" />
          <v-select
            v-model="personRole"
            label="Role"
            :items="assignableRoles"
            item-title="label"
            item-value="role"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="addOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="addPerson">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="editOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Edit person</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="personName" label="Name" />
          <v-text-field v-model="personEmail" label="Email" type="email" />
          <v-select
            v-model="personRole"
            label="Role"
            :items="assignableRoles"
            item-title="label"
            item-value="role"
          />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="editOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="savePerson">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Remove person</v-card-title>
        <v-divider />
        <v-card-text class="py-4 text-body-2">
          {{ removing?.email }} will no longer be able to open this business.
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="removeOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="error" :loading="busy" @click="removePerson">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="removeRoleOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Remove role</v-card-title>
        <v-divider />
        <v-card-text class="py-4 text-body-2">
          {{ currentRole?.label }} will be removed. People using it need another role first.
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="removeRoleOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="error" :loading="busy" @click="removeRole">Remove</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="roleOpen" max-width="480">
      <v-card>
        <v-card-title class="text-h6 px-4 py-3">Add role</v-card-title>
        <v-divider />
        <v-card-text class="pt-4 pb-0">
          <v-text-field v-model="roleLabel" label="Role name" placeholder="Front desk" />
        </v-card-text>
        <v-divider />
        <v-card-actions class="px-4 py-3">
          <v-spacer />
          <v-btn variant="outlined" @click="roleOpen = false">Cancel</v-btn>
          <v-btn variant="flat" color="primary" :loading="busy" @click="addRole">Add</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>
