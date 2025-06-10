<template>
  <div class="d-flex">
    <AdminSidebar />

    <div
      class="flex-grow-1 p-4 transition-all"
      :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }"
    >
      <h2 class="mb-4">Welcome to Admin Dashboard</h2>

      <!-- Today's Info -->
      <div class="col-12">
        <TotalRevenueCard />
      </div>

      <div class="row mb-4">
        <div class="col-md-12">
          <TodayBookings />
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="row mb-4">
        <div class="col-md-4">
          <DashboardStat
            label="Total Bookings Today"
            :value="bookingsToday"
            icon="calendar"
            variant="primary"
            type="total-bookings"
          />
        </div>
        <div class="col-md-4">
          <DashboardStat
            label="Attended Today"
            :value="attendedToday"
            icon="check-circle"
            variant="success"
            type="attended"
          />
        </div>
        <div class="col-md-4">
          <DashboardStat
            label="Not Showed Today"
            :value="noShowsToday"
            icon="user-xmark"
            variant="danger"
            type="no-shows"
          />
        </div>
      </div>

      <!-- Time Slots Management -->
      <AdminTimeSlots ref="timeSlotsRef" class="mb-4" @edit="handleEdit" />

      <!-- Charts -->
      <div class="row mb-4">
        <div class="col-md-6">
          <BarberBookingsChart />
        </div>
        <div class="col-md-6">
          <TopServicesChart />
        </div>
      </div>
      <div class="row mb-4">
        <div class="col-md-12">
          <BookingTrendChart />
        </div>
      </div>

      <!-- System Usage -->
      <DatabaseUsageBar class="mb-3" />
    </div>
  </div>

  <!-- Global Modal Outside Layout Grid -->
  <AdminTimeSlotsModal
    v-if="modalVisible"
    :slot="editedSlot"
    :index="editIndex"
    @close="modalVisible = false"
    @save="handleSave"
    @delete="handleDelete"
  />
</template>

<script setup>
import { ref } from 'vue'
import { useSidebarStore } from '@/stores/sidebar'

import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import DatabaseUsageBar from '@/components/admin/DatabaseUsageBar.vue'
import StorageUsageBar from '@/components/admin/StorageUsageBar.vue'
import BarberBookingsChart from '@/components/admin/charts/BarberBookingsChart.vue'
import TopServicesChart from '@/components/admin/charts/TopServicesChart.vue'
import DashboardStat from '@/components/admin/charts/DashboardStat.vue'
import BookingTrendChart from '@/components/admin/charts/BookingTrendChart.vue'
import TodayBookings from '@/components/admin/charts/TodayBookings.vue'
import TotalRevenueCard from '@/components/admin/charts/TotalRevenueCard.vue'
import AdminTimeSlots from '@/components/admin/AdminTimeSlots.vue'
import AdminTimeSlotsModal from '@/components/admin/AdminTimeSlotsModal.vue'

const sidebar = useSidebarStore()

const timeSlotsRef = ref(null)
const modalVisible = ref(false)
const editedSlot = ref('')
const editIndex = ref(null)

const handleEdit = (slot, index) => {
  editedSlot.value = slot
  editIndex.value = index
  modalVisible.value = true
}

const handleSave = async (updated, index) => {
  if (!timeSlotsRef.value) return
  timeSlotsRef.value.slots[index] = updated
  await timeSlotsRef.value.saveSlots()
  modalVisible.value = false
}

const handleDelete = async (index) => {
  if (!timeSlotsRef.value) return
  timeSlotsRef.value.slots.splice(index, 1)
  await timeSlotsRef.value.saveSlots()
  modalVisible.value = false
}
</script>

<style scoped>
.transition-all {
  transition: margin-left 0.3s ease;
}
</style>
