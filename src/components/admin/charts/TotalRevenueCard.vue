<template>
  <div class="card mb-4 h-100">
    <div class="card-header d-flex justify-content-between align-items-center">
      <div class="d-flex align-items-center gap-2">
        <i class="fas fa-franc-sign text-warning"></i>
        <span class="text-muted small">Estimated Revenue</span>
      </div>
      <select v-model="filter" class="form-select form-select-sm" style="width: 180px">
        <option value="today">Today</option>
        <option value="week">This Week</option>
        <option value="month">This Month</option>
      </select>
    </div>
    <div class="card-body">
      <h3 class="fw-bold text-dark mb-0">CHF {{ revenue }}</h3>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch } from 'vue'
import { supabase } from '@/supabaseClient'

const revenue = ref('—')
const filter = ref('today')

const getStartDate = () => {
  const now = new Date()
  switch (filter.value) {
    case 'today':
      now.setHours(0, 0, 0, 0)
      return now.toISOString()
    case 'week': {
      const day = now.getDay()
      const diff = now.getDate() - day + (day === 0 ? -6 : 1) // get Monday
      const monday = new Date(now.setDate(diff))
      monday.setHours(0, 0, 0, 0)
      return monday.toISOString()
    }
    case 'month':
      const first = new Date(now.getFullYear(), now.getMonth(), 1)
      first.setHours(0, 0, 0, 0)
      return first.toISOString()
  }
}

const fetchRevenue = async () => {
  revenue.value = '—'

  const { data: bookings, error: bookingsErr } = await supabase
    .from('bookings')
    .select('id, created_at')
    .not('status', 'eq', 'no-show')

  if (bookingsErr) {
    console.error('Error fetching bookings:', bookingsErr)
    return
  }

  const startDate = getStartDate()
  const filteredBookings = bookings.filter((b) => new Date(b.created_at) >= new Date(startDate))
  const validBookingIds = filteredBookings.map((b) => b.id)

  if (validBookingIds.length === 0) {
    revenue.value = '0.00'
    return
  }

  const { data: bookingServices, error: bsErr } = await supabase
    .from('booking_services')
    .select('service:services (price), booking_id')

  if (bsErr) {
    console.error('Error fetching services:', bsErr)
    return
  }

  const total = bookingServices.reduce((sum, row) => {
    if (validBookingIds.includes(row.booking_id)) {
      return sum + (row.service?.price || 0)
    }
    return sum
  }, 0)

  revenue.value = total.toFixed(2)
}

onMounted(fetchRevenue)
watch(filter, fetchRevenue)
</script>
