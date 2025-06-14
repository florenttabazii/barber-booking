<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h3 class="mb-0"><i class="fas fa-calendar me-2"></i>{{ $t('booking.title') }}</h3>
        </div>
        <div class="card-body">
          <!-- Personal Information -->
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.firstName') }} *</label>
              <input type="text" class="form-control" v-model="booking.firstName" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.lastName') }} *</label>
              <input type="text" class="form-control" v-model="booking.lastName" required />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.email') }} *</label>
              <input type="email" class="form-control" v-model="booking.email" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">{{ $t('booking.phone') }} *</label>
              <div class="input-group">
                <span class="input-group-text bg-light">+41</span>
                <input
                  type="tel"
                  class="form-control"
                  v-model="phoneNumber"
                  @input="validatePhone"
                  :placeholder="$t('booking.phonePlaceholder')"
                  maxlength="12"
                />
              </div>
              <small class="text-muted">{{ $t('booking.phoneHint') }}</small>
            </div>
          </div>

          <!-- Datepicker -->
          <div class="mb-3">
            <label class="form-label">{{ $t('booking.selectDate') }} *</label>
            <Datepicker
              v-model="booking.date"
              :min-date="new Date()"
              :max-date="maxDate"
              :disabled-dates="fullyBookedDates"
              :format="'dd.MM.yyyy'"
              auto-apply
              :placeholder="$t('booking.datePlaceholder')"
              @update:model-value="loadSlots"
            />
          </div>

          <!-- Time Slots -->
          <div v-if="booking.date" class="mb-3">
            <label class="form-label">{{ $t('booking.timeSlots') }} *</label>
            <div v-if="availableSlots.length === 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              {{ $t('booking.noSlots') }}
            </div>
            <div v-else>
              <div class="alert alert-info" v-if="!booking.timeSlot">
                <i class="fas fa-info-circle me-2"></i>
                {{ $t('booking.selectSlotPrompt') }}
              </div>
              <div class="row g-2">
                <div v-for="slot in availableSlots" :key="slot" class="col-md-3 col-sm-6">
                  <TimeSlot :slot="slot" />
                </div>
              </div>
              <div v-if="booking.timeSlot" class="alert alert-success mt-2">
                <i class="fas fa-check-circle me-2"></i>
                {{ $t('booking.selectedTime') }}: <strong>{{ booking.timeSlot }}</strong>
              </div>
            </div>
          </div>

          <!-- Navigation Buttons -->
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>{{ $t('buttons.back') }}
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :class="{ 'btn-success': isFormComplete }"
              @click="validateAndContinue"
            >
              <span v-if="isFormComplete">
                {{ $t('buttons.continue') }} <i class="fas fa-arrow-right ms-2"></i>
              </span>
              <span v-else>
                {{ $t('buttons.completeForm') }} <i class="fas fa-exclamation ms-2"></i>
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script>
import { defineComponent, computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import TimeSlot from '../components/TimeSlot.vue'
import { fetchAvailableHours } from '@/utils/fetchAvailableHours'
import Datepicker from '@vuepic/vue-datepicker'
import '@vuepic/vue-datepicker/dist/main.css'
import { supabase } from '@/supabaseClient'

export default defineComponent({
  name: 'BookingForm',
  components: { TimeSlot, Datepicker },
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()

    const booking = computed({
      get: () => bookingStore.booking,
      set: (val) => Object.entries(val).forEach(([k, v]) => bookingStore.updateBookingField(k, v)),
    })

    const availableSlots = computed(() => bookingStore.availableSlots)
    const isFormComplete = computed(() => bookingStore.isBookingFormComplete)
    const minDate = ref(new Date())
    const maxDate = ref(new Date(new Date().setMonth(new Date().getMonth() + 6)))
    const phoneNumber = ref('')
    const fullyBookedDates = ref([])

    const validatePhone = (e) => {
      let val = e.target.value.replace(/\D/g, '')
      phoneNumber.value =
        val.length <= 2
          ? val
          : val.length <= 5
            ? `${val.slice(0, 2)} ${val.slice(2)}`
            : val.length <= 7
              ? `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5)}`
              : `${val.slice(0, 2)} ${val.slice(2, 5)} ${val.slice(5, 7)} ${val.slice(7, 9)}`
      bookingStore.updateBookingField('phone', phoneNumber.value ? '+41 ' + phoneNumber.value : '')
    }

    watch(phoneNumber, (val) => {
      bookingStore.updateBookingField('phone', val ? '+41 ' + val : '')
    })

    const fetchFullyBookedDates = async () => {
      if (!booking.value.barber_id) return
      const { data } = await supabase
        .from('availability')
        .select('date, hour')
        .eq('barber_id', booking.value.barber_id)
        .eq('is_available', false)

      if (!data) return

      const grouped = data.reduce((acc, { date, hour }) => {
        acc[date] = acc[date] || []
        acc[date].push(hour)
        return acc
      }, {})

      for (const dateStr in grouped) {
        const slots = await fetchAvailableHours(booking.value.barber_id, dateStr)
        if (slots.length === 0) fullyBookedDates.value.push(new Date(dateStr))
      }
    }

    const loadSlots = async () => {
      if (!booking.value.barber_id || !booking.value.date) return
      const slots = await fetchAvailableHours(booking.value.barber_id, booking.value.date)
      bookingStore.setAvailableSlots(slots)
    }

    onMounted(() => {
      fetchFullyBookedDates()
    })

    const goBack = () => router.push('/booking/services')

    const validateAndContinue = () => {
      const b = booking.value
      const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

      if (!b.firstName) return bookingStore.showValidation('Enter your first name.')
      if (!b.lastName) return bookingStore.showValidation('Enter your last name.')
      if (!b.email) return bookingStore.showValidation('Enter your email.')
      if (!validEmail.test(b.email)) return bookingStore.showValidation('Invalid email.')
      if (!b.phone || b.phone === '+41 ' || b.phone.replace(/[^0-9]/g, '').length < 11)
        return bookingStore.showValidation('Enter valid Swiss phone number.')
      if (!b.date) return bookingStore.showValidation('Select appointment date.')
      if (availableSlots.value.length === 0)
        return bookingStore.showValidation('No slots for this date.')
      if (!b.timeSlot) return bookingStore.showValidation('Select a time slot.')

      router.push('/booking/confirmation')
    }

    return {
      booking,
      availableSlots,
      minDate,
      maxDate,
      fullyBookedDates,
      phoneNumber,
      validatePhone,
      loadSlots,
      isFormComplete,
      validateAndContinue,
      goBack,
    }
  },
})
</script>
