<template>
  <div class="row justify-content-center">
    <div class="col-md-8">
      <div class="card">
        <div class="card-header">
          <h3 class="mb-0"><i class="fas fa-check-circle me-2"></i>Confirm Your Booking</h3>
        </div>
        <div class="card-body">
          <div class="row">
            <div class="col-md-6">
              <h5>Personal Information</h5>
              <p><strong>Name:</strong> {{ booking.firstName }} {{ booking.lastName }}</p>
              <p><strong>Email:</strong> {{ booking.email }}</p>
              <p><strong>Phone:</strong> {{ booking.phone }}</p>
            </div>
            <div class="col-md-6">
              <h5>Appointment Details</h5>
              <p><strong>Date:</strong> {{ formattedDate }}</p>
              <p><strong>Time:</strong> {{ booking.timeSlot }}</p>
              <p><strong>Barber:</strong> {{ barberName }}</p>
            </div>
          </div>

          <hr />

          <h5>Selected Services</h5>
          <div class="table-responsive">
            <table class="table">
              <thead>
                <tr>
                  <th>Service</th>
                  <th>Duration</th>
                  <th>Price</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="service in selectedServicesDetails" :key="service.id">
                  <td>{{ service.name }}</td>
                  <td>{{ service.duration }}</td>
                  <td>${{ service.price }}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr class="fw-bold">
                  <td colspan="2">Total</td>
                  <td>${{ totalPrice }}</td>
                </tr>
              </tfoot>
            </table>
            <p class="text-muted small mt-3">
              By confirming this booking you also agree to our
              <a href="#" @click.prevent="showPolicyModal = true">privacy policy</a>.
            </p>

            <div class="form-check mt-3">
              <input
                class="form-check-input"
                type="checkbox"
                id="privacyAcceptMain"
                v-model="privacyAccepted"
              />
              <label class="form-check-label text-muted small" for="privacyAcceptMain">
                I have read and accept the privacy policy
              </label>
            </div>
          </div>

          <div class="d-flex justify-content-between mt-4">
            <button type="button" class="btn btn-secondary" @click="goBack">
              <i class="fas fa-arrow-left me-2"></i>Back
            </button>
            <button
              type="button"
              class="btn btn-dark"
              @click="confirmBooking"
              :disabled="!privacyAccepted"
            >
              <i class="fas fa-check me-2"></i>Confirm Booking
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Privacy Policy Modal -->
  <PrivacyPolicyModal v-if="showPolicyModal" @close="showPolicyModal = false" />
</template>

<script>
import { defineComponent, computed, getCurrentInstance, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useBookingStore } from '../stores/booking'
import { useBarbersStore } from '../stores/barbers'
import { useServicesStore } from '../stores/services'
import PrivacyPolicyModal from '@/components/PrivacyPolicyModal.vue'

export default defineComponent({
  name: 'BookingConfirmation',
  components: {
    PrivacyPolicyModal,
  },
  setup() {
    const router = useRouter()
    const bookingStore = useBookingStore()
    const barbersStore = useBarbersStore()
    const servicesStore = useServicesStore()

    // This will be used to show the privacy policy modal
    const showPolicyModal = ref(false)
    const privacyAccepted = ref(false)

    // Get the app instance to access the modal
    const instance = getCurrentInstance()

    const booking = computed(() => bookingStore.booking)
    const formattedDate = computed(() => {
      return bookingStore.formatDate(booking.value.date)
    })
    const barberName = computed(() => {
      return barbersStore.selectedBarber ? barbersStore.selectedBarber.name : 'Not selected'
    })
    const selectedServicesDetails = computed(() => servicesStore.selectedServicesDetails)
    const totalPrice = computed(() => servicesStore.totalPrice)

    const goBack = () => {
      router.push('/booking/services')
    }

    const onPrivacyAccepted = (isAccepted) => {
      privacyAccepted.value = isAccepted
    }

    const confirmBooking = () => {
      // Generate booking ID and save
      bookingStore.confirmBooking()
      bookingStore.toggleConfirmationModal(true)

      // Show the confirmation modal
      // We need to access the modal component from the root
      const modalComponent = instance.appContext.app._instance.refs.confirmationModal
      if (modalComponent && modalComponent.showModal) {
        modalComponent.showModal()
      }
    }

    return {
      booking,
      formattedDate,
      barberName,
      selectedServicesDetails,
      totalPrice,
      goBack,
      confirmBooking,
      showPolicyModal,
      privacyAccepted,
      onPrivacyAccepted,
    }
  },
})
</script>
