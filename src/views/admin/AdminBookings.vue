<template>
  <div class="d-flex">
    <AdminSidebar />

    <div class="admin-main-content" :style="{ marginLeft: sidebar.isCollapsed ? '80px' : '250px' }">
      <div class="d-flex justify-content-between align-items-center mb-4">
        <h2 class="mb-0">Booking Log</h2>
      </div>

      <!-- Filters -->
      <div class="row mb-4">
        <div class="col-md-3">
          <label class="form-label">From Date</label>
          <input v-model="fromDate" type="date" class="form-control" />
        </div>
        <div class="col-md-3">
          <label class="form-label">To Date</label>
          <input v-model="toDate" type="date" class="form-control" />
        </div>
      </div>

      <div class="table-responsive">
        <table class="table table-hover align-middle">
          <thead class="table-light">
            <tr>
              <th>Customer</th>
              <th>Email</th>
              <th>Phone</th>
              <th>Barber</th>
              <th>Date</th>
              <th>Hour</th>
              <th>Services</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="booking in filteredBookings" :key="booking.id">
              <td>{{ booking.customer_name }} {{ booking.customer_surname }}</td>
              <td>{{ booking.customer_email }}</td>
              <td>{{ booking.phone_number }}</td>
              <td>{{ booking.barberName || '—' }}</td>
              <td>{{ booking.date_appt }}</td>
              <td>{{ booking.hour }}</td>
              <td>
                <ul class="mb-0">
                  <li v-for="s in booking.serviceNames" :key="s">{{ s }}</li>
                </ul>
              </td>
            </tr>
          </tbody>
        </table>
        <button class="btn btn-dark w-100 col-12" @click="downloadCSV">
          <i class="fas fa-download me-2"></i>Export CSV
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from '@/supabaseClient'
import AdminSidebar from '@/components/admin/AdminSidebar.vue'
import { useSidebarStore } from '@/stores/sidebar'

const sidebar = useSidebarStore()

const bookings = ref([])
const fromDate = ref('')
const toDate = ref('')

const fetchBookings = async () => {
  const { data, error } = await supabase.from('booking_services').select(`
    booking:bookings (
      id,
      customer_name,
      customer_surname,
      customer_email,
      phone_number,
      date_appt,
      hour,
      barber:barbers (
        name,
        surname
      )
    ),
    service:services (
      name
    )
  `)

  if (error) {
    console.error('❌ Supabase error:', error)
    return
  }

  if (!data || data.length === 0) {
    console.warn('⚠️ No booking data returned.')
    return
  }

  const bookingMap = {}

  for (const entry of data) {
    const b = entry.booking
    const s = entry.service?.name

    if (!b || !b.id) continue

    if (!bookingMap[b.id]) {
      bookingMap[b.id] = {
        ...b,
        barberName: b.barber ? `${b.barber.name} ${b.barber.surname}` : '',
        serviceNames: [],
      }
    }

    if (s) {
      bookingMap[b.id].serviceNames.push(s)
    }
  }

  bookings.value = Object.values(bookingMap).sort(
    (a, b) => new Date(b.date_appt) - new Date(a.date_appt),
  )
}

const filteredBookings = computed(() => {
  return bookings.value.filter((b) => {
    const date = new Date(b.date_appt)
    const from = fromDate.value ? new Date(fromDate.value) : null
    const to = toDate.value ? new Date(toDate.value) : null
    return (!from || date >= from) && (!to || date <= to)
  })
})

const downloadCSV = () => {
  const rows = [
    ['Customer', 'Email', 'Phone', 'Barber', 'Date', 'Hour', 'Services'],
    ...filteredBookings.value.map((b) => [
      `${b.customer_name} ${b.customer_surname}`,
      b.customer_email,
      b.phone_number,
      b.barberName,
      b.date_appt,
      b.hour,
      b.serviceNames.join(', '),
    ]),
  ]

  const csvContent = rows.map((r) => r.map((v) => `"${v}"`).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.setAttribute('href', url)
  link.setAttribute('download', `bookings_${new Date().toISOString()}.csv`)
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

onMounted(fetchBookings)
</script>
