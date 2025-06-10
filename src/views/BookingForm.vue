<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h3 class="mb-0"><i class="fas fa-calendar me-2"></i>Book Your Appointment</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">First Name *</label>
              <input type="text" class="form-control" v-model="booking.firstName" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Last Name *</label>
              <input type="text" class="form-control" v-model="booking.lastName" required />
            </div>
          </div>
          <div class="row">
            <div class="col-md-6 mb-3">
              <label class="form-label">Email *</label>
              <input type="email" class="form-control" v-model="booking.email" required />
            </div>
            <div class="col-md-6 mb-3">
              <label class="form-label">Phone Number *</label>
              <div class="input-group">
                <span class="input-group-text bg-light">+41</span>
                <input
                  type="tel"
                  class="form-control"
                  v-model="phoneNumber"
                  @input="validatePhone"
                  placeholder="79 123 45 67"
                  maxlength="12"
                />
              </div>
              <small class="text-muted">Swiss mobile number</small>
            </div>
          </div>

          <div class="mb-3">
            <label class="form-label">Select Date *</label>
            <input
              type="date"
              class="form-control"
              v-model="booking.date"
              @change="loadSlots"
              :min="minDate"
              required
            />
          </div>

          <div v-if="booking.date" class="mb-3">
            <label class="form-label">Available Time Slots *</label>
            <div v-if="availableSlots.length === 0" class="alert alert-warning">
              <i class="fas fa-exclamation-triangle me-2"></i>
              No available slots for this date. Please choose another date.
            </div>
            <div v-else>
              <div class="alert alert-info" v-if="!booking.timeSlot">
                <i class="fas fa-info-circle me-2"></i>
                Please select a time slot to continue.
              </div>
              <div class="row g-2">
                <div v-for="slot in availableSlots" :key="slot" class="col-md-3 col-sm-6">
                  <TimeSlot :slot="slot" />
                </div>
              </div>
              <div v-if="booking.timeSlot" class="alert alert-success mt-2">
                <i class="fas fa-check-circle me-2"></i>
                Selected time: <strong>{{ booking.timeSlot }}</strong>
              </div>
            </div>
          </div>

          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>Back
            </button>
            <button
              type="button"
              class="btn btn-primary"
              :class="{ 'btn-success': isFormComplete }"
              @click="validateAndContinue"
            >
              <span v-if="isFormComplete"> Continue<i class="fas fa-arrow-right ms-2"></i> </span>
              <span v-else> Complete Form<i class="fas fa-exclamation ms-2"></i> </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import TimeSlot from '../components/TimeSlot.vue'
import { fetchAvailableHours } from '@/utils/fetchAvailableHours'

export default defineComponent({
  name: 'BookingForm',
  components: {
    TimeSlot,
  },
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()

    const booking = computed({
      get: () => bookingStore.booking,
      set: (value) => {
        Object.keys(value).forEach((key) => {
          bookingStore.updateBookingField(key, value[key])
        })
      },
    })

    const availableSlots = computed(() => bookingStore.availableSlots)
    const minDate = computed(() => bookingStore.minDate)
    const isFormComplete = computed(() => bookingStore.isBookingFormComplete)

    const phoneNumber = ref('')

    // Phone validation function
    const validatePhone = (event) => {
      // Remove all non-numeric characters
      let value = event.target.value.replace(/\D/g, '')

      // Format as XX XXX XX XX
      if (value.length > 0) {
        if (value.length <= 2) {
          phoneNumber.value = value
        } else if (value.length <= 5) {
          phoneNumber.value = value.slice(0, 2) + ' ' + value.slice(2)
        } else if (value.length <= 7) {
          phoneNumber.value = value.slice(0, 2) + ' ' + value.slice(2, 5) + ' ' + value.slice(5)
        } else {
          phoneNumber.value =
            value.slice(0, 2) +
            ' ' +
            value.slice(2, 5) +
            ' ' +
            value.slice(5, 7) +
            ' ' +
            value.slice(7, 9)
        }
      } else {
        phoneNumber.value = ''
      }

      // Update the store with full number including +41
      bookingStore.updateBookingField('phone', phoneNumber.value ? '+41 ' + phoneNumber.value : '')
    }

    // Watch for changes to sync with store
    watch(phoneNumber, (newValue) => {
      bookingStore.updateBookingField('phone', newValue ? '+41 ' + newValue : '')
    })

    const loadSlots = async () => {
      if (!booking.value.barber_id || !booking.value.date) return

      const slots = await fetchAvailableHours(booking.value.barber_id, booking.value.date)
      bookingStore.setAvailableSlots(slots)

      console.log('BARBER ID:', booking.value.barber_id)
    }

    const goBack = () => {
      router.push('/booking/barber-selection')
    }

    const validateAndContinue = () => {
      // Validate each field
      if (!booking.value.firstName) {
        bookingStore.showValidation('Please enter your first name.')
        return
      }
      if (!booking.value.lastName) {
        bookingStore.showValidation('Please enter your last name.')
        return
      }
      if (!booking.value.email) {
        bookingStore.showValidation('Please enter your email address.')
        return
      }
      // Email format validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      if (!emailRegex.test(booking.value.email)) {
        bookingStore.showValidation('Please enter a valid email address (example: name@email.com)')
        return
      }
      if (
        !booking.value.phone ||
        booking.value.phone === '+41 ' ||
        booking.value.phone.replace(/[^0-9]/g, '').length < 11
      ) {
        bookingStore.showValidation('Please enter a valid Swiss phone number.')
        return
      }
      if (!booking.value.date) {
        bookingStore.showValidation('Please select a date for your appointment.')
        return
      }
      if (availableSlots.value.length === 0) {
        bookingStore.showValidation(
          'No time slots are available for the selected date. Please choose a different date.',
        )
        return
      }
      if (!booking.value.timeSlot) {
        bookingStore.showValidation('Please select a time slot from the available options.')
        return
      }

      // All validation passed
      router.push('/booking/services')
    }

    return {
      booking,
      availableSlots,
      minDate,
      isFormComplete,
      loadSlots,
      goBack,
      validateAndContinue,
      phoneNumber,
      validatePhone,
    }
  },
})
</script>
