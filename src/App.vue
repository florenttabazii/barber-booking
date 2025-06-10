<template>
  <div id="app">
    <div class="container py-5">
      <!-- Page Header - ABOVE Progress Bar -->
      <div class="row mb-4">
        <div class="col-12 text-center">
          <h2 class="mb-2">{{ currentStepTitle }}</h2>
          <p class="text-muted">{{ currentStepSubtitle }}</p>
        </div>
      </div>

      <!-- Progress Bar Component -->
      <ProgressBar v-if="showProgressBar" />

      <!-- Main Content with Transitions -->
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </div>

    <!-- Confirmation Modal -->
    <ConfirmationModal />

    <!-- Validation Modal -->
    <ValidationModal />
  </div>
</template>

<script>
import { defineComponent, onMounted, computed } from 'vue'
import { useBookingStore } from './stores/booking'
import ProgressBar from './components/ProgressBar.vue'
import ConfirmationModal from './components/ConfirmationModal.vue'
import ValidationModal from './components/ValidationModal.vue'
import { useRoute } from 'vue-router'

export default defineComponent({
  name: 'App',
  components: {
    ProgressBar,
    ConfirmationModal,
    ValidationModal,
  },
  setup() {
    const bookingStore = useBookingStore()
    const route = useRoute()

    onMounted(() => {
      bookingStore.initializeFromStorage()
    })

    const currentStepTitle = computed(() => {
      switch (bookingStore.currentStep) {
        case 1:
          return 'Choose Your Barber'
        case 2:
          return 'Book Your Appointment'
        case 3:
          return 'Select Services'
        case 4:
          return 'Confirm Your Booking'
        default:
          return ''
      }
    })

    const currentStepSubtitle = computed(() => {
      switch (bookingStore.currentStep) {
        case 1:
          return 'Select from our experienced professionals'
        case 2:
          return 'Fill in your details and choose a time'
        case 3:
          return 'Choose the services you need'
        case 4:
          return 'Review and confirm your appointment'
        default:
          return ''
      }
    })

    const showProgressBar = computed(() => route.path.startsWith('/booking'))

    return {
      currentStepTitle,
      currentStepSubtitle,
      showProgressBar,
    }
  },
})
</script>
