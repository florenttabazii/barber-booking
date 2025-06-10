<template>
  <div class="d-flex">
    <AdminSidebar />

    <div class="admin-main-content" :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Barber Management</h2>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Name</th>
              <th>Surname</th>
              <th>Phone</th>
              <th>Experience</th>
              <th>Rating</th>
              <th>Clients</th>
              <th>Photo</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="barber in barbers" :key="barber.id">
              <td>{{ barber.name }}</td>
              <td>{{ barber.surname }}</td>
              <td>{{ barber.phone_number }}</td>
              <td>{{ barber.experience }} yrs</td>
              <td>{{ barber.rating }}</td>
              <td>{{ barber.total_clients }}</td>
              <td>
                <img
                  :src="barber.avatar_url"
                  alt="Avatar"
                  width="40"
                  height="40"
                  class="rounded-circle"
                />
              </td>
              <td>
                <input
                  type="checkbox"
                  class="btn-check"
                  :id="`barber-status-${barber.id}`"
                  :checked="barber.is_active"
                  @change="toggleBarber(barber)"
                  autocomplete="off"
                />
                <label
                  class="btn btn-sm"
                  :class="barber.is_active ? 'btn-outline-success' : 'btn-outline-secondary'"
                  :for="`barber-status-${barber.id}`"
                >
                  {{ barber.is_active ? 'Active' : 'Inactive' }}
                </label>
              </td>
              <td>
                <button class="btn btn-sm btn-outline-primary me-1" @click="openEditModal(barber)">
                  Edit
                </button>
                <button class="btn btn-sm btn-outline-danger" @click="openDeleteModal(barber)">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <div class="mt-4">
          <button class="btn btn-dark w-100" @click="openAddModal">Add New Barber</button>
        </div>
      </div>
    </div>
  </div>

  <BarberModal
    v-if="showBarberModal"
    :barber="selectedBarber"
    :isEdit="!!selectedBarber?.id"
    @close="closeBarberModal"
    @save="handleSaveBarber"
  />

  <DeleteBarberModal
    v-if="showDeleteModal"
    :barber="selectedBarber"
    @close="closeDeleteModal"
    @confirmDelete="handleDeleteBarber"
  />
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import { useSidebarStore } from '@/stores/sidebar'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import BarberModal from '@/components/admin/BarberModal.vue'
import DeleteBarberModal from '@/components/admin/DeleteBarberModal.vue'

const sidebar = useSidebarStore()
const barbers = ref([])

const showBarberModal = ref(false)
const showDeleteModal = ref(false)
const selectedBarber = ref(null)

const loadBarbers = async () => {
  const { data, error } = await supabase
    .from('barbers')
    .select('*')
    .order('created_at', { ascending: false })
  if (!error) barbers.value = data
}

const openAddModal = () => {
  console.log('Opening modal') // check console
  selectedBarber.value = null
  showBarberModal.value = true
}

const openEditModal = (barber) => {
  selectedBarber.value = { ...barber }
  showBarberModal.value = true
}

const openDeleteModal = (barber) => {
  selectedBarber.value = { ...barber }
  showDeleteModal.value = true
}

const closeBarberModal = () => {
  showBarberModal.value = false
  selectedBarber.value = null
}

const closeDeleteModal = () => {
  showDeleteModal.value = false
  selectedBarber.value = null
}

const handleSaveBarber = async () => {
  await loadBarbers()
  closeBarberModal()
}

const handleDeleteBarber = async () => {
  await loadBarbers()
  closeDeleteModal()
}

const toggleBarber = async (barber) => {
  const { error } = await supabase
    .from('barbers')
    .update({ is_active: !barber.is_active })
    .eq('id', barber.id)
  if (!error) await loadBarbers()
}

onMounted(() => {
  loadBarbers()
})
</script>
