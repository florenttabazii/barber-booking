<template>
  <div class="modal fade" id="validationModal" tabindex="-1" ref="modalElement">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header bg-warning">
          <h5 class="modal-title"><i class="fas fa-exclamation-triangle me-2"></i>Attention</h5>
          <button type="button" class="btn-close" @click="hideModal"></button>
        </div>
        <div class="modal-body">
          <p class="mb-0">{{ message }}</p>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-primary" @click="hideModal">OK</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, ref, computed, onMounted, watch } from 'vue'
import { useBookingStore } from '../stores/booking'
import { Modal } from 'bootstrap'

export default defineComponent({
  name: 'ValidationModal',
  setup() {
    const bookingStore = useBookingStore()
    const modalElement = ref(null)
    let modalInstance = null

    const message = computed(() => bookingStore.validationMessage)

    onMounted(() => {
      if (modalElement.value) {
        modalInstance = new Modal(modalElement.value)
      }
    })

    watch(
      () => bookingStore.showValidationModal,
      (newValue) => {
        if (newValue && modalInstance) {
          modalInstance.show()
        }
      },
    )

    const hideModal = () => {
      if (modalInstance) {
        modalInstance.hide()
      }
      bookingStore.hideValidationModal()
    }

    return {
      modalElement,
      message,
      hideModal,
    }
  },
})
</script>
