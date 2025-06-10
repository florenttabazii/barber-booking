<template>
  <div
    class="modal fade"
    id="confirmationModal"
    tabindex="-1"
    data-bs-backdrop="static"
    ref="modalElement"
  >
    <div class="modal-dialog">
      <div class="modal-content">
        <div class="modal-header bg-success text-white">
          <h5 class="modal-title"><i class="fas fa-check-circle me-2"></i>Booking Confirmed!</h5>
          <button type="button" class="btn-close btn-close-white" @click="handleClose"></button>
        </div>
        <div class="modal-body text-center">
          <i class="fas fa-calendar-check text-success fa-3x mb-3"></i>
          <h4>Your appointment has been booked successfully!</h4>
          <p class="mb-3">
            Booking ID: <strong>{{ bookingId }}</strong>
          </p>
          <p>You will receive a confirmation email shortly.</p>
          <p class="text-muted">Please arrive 5 minutes before your appointment time.</p>
        </div>
        <div class="modal-footer justify-content-center">
          <button type="button" class="btn btn-outline-secondary me-2" @click="handleClose">
            <i class="fas fa-times me-2"></i>Close
          </button>
          <button type="button" class="btn btn-success" @click="handleNewBooking">
            <i class="fas fa-plus me-2"></i>New Booking
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useBookingStore } from '../stores/booking'
import { useRouter } from 'vue-router'
import { Modal } from 'bootstrap'

export default defineComponent({
  name: 'ConfirmationModal',
  setup() {
    const bookingStore = useBookingStore()
    const router = useRouter()
    const modalElement = ref(null)
    let modalInstance = null

    const bookingId = computed(() => bookingStore.bookingId)

    watch(
      () => bookingStore.showConfirmationModal,
      (newValue) => {
        if (newValue) {
          showModal()
        } else {
          hideModal()
        }
      },
    )

    onMounted(() => {
      // Initialize Bootstrap modal
      if (modalElement.value) {
        modalInstance = new Modal(modalElement.value)
      }
    })

    const showModal = () => {
      if (modalInstance) {
        modalInstance.show()
      }
    }

    const hideModal = () => {
      if (modalInstance) {
        modalInstance.hide()
      }
    }

    const handleClose = () => {
      hideModal()
    }

    const handleNewBooking = () => {
      hideModal()
      // Wait for modal to hide
      setTimeout(() => {
        bookingStore.resetBooking()
        router.push('/booking/barber-selection')
      }, 300)
    }

    // Expose showModal method to be called from parent
    return {
      modalElement,
      bookingId,
      handleClose,
      handleNewBooking,
      showModal,
    }
  },
})
</script>
