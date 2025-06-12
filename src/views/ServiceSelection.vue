<template>
  <div>
    <div class="row">
      <div class="col-12">
        <div class="card">
          <div class="card-header">
            <h3 class="mb-0"><i class="fas fa-scissors me-2"></i>Select Services</h3>
          </div>
          <div class="card-body">
            <div v-for="(sectionServices, section) in groupedServices" :key="section" class="mb-4">
              <h4 class="mb-3 text-primary">{{ section }} Services</h4>
              <div class="row mb-4">
                <div v-for="service in sectionServices" :key="service.id" class="col-md-4 mb-3">
                  <ServiceCard
                    :service="service"
                    :selected="selectedServices.includes(service.id)"
                    @toggle="servicesStore.toggleService(service.id)"
                  />
                </div>
              </div>
            </div>

            <div class="row align-items-center">
              <div class="col-md-3">
                <button type="button" class="btn btn-secondary w-100" @click="goBack">
                  <i class="fas fa-arrow-left me-2"></i>Back
                </button>
              </div>
              <div class="col-md-6 text-center">
                <div class="card bg-light mx-auto" style="max-width: 300px">
                  <div class="card-body">
                    <h4 class="mb-1">Total: {{ totalPrice }} CH₣</h4>
                    <small class="text-muted">
                      {{ selectedServicesCount }} service(s) selected
                    </small>
                  </div>
                </div>
              </div>
              <div class="col-md-3">
                <button type="button" class="btn btn-primary w-100" @click="validateAndContinue">
                  Continue<i class="fas fa-arrow-right ms-2"></i>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useServicesStore } from '../stores/services'
import { useBookingStore } from '../stores/booking'
import ServiceCard from '../components/ServiceCard.vue'

export default defineComponent({
  name: 'ServiceSelection',
  components: {
    ServiceCard,
  },
  setup() {
    const router = useRouter()
    const servicesStore = useServicesStore()
    const bookingStore = useBookingStore()

    onMounted(() => {
      servicesStore.fetchServices()
    })

    const groupedServices = computed(() => servicesStore.groupedServices)
    const selectedServices = computed(() => servicesStore.selectedServices)
    const totalPrice = computed(() => servicesStore.totalPrice)
    const selectedServicesCount = computed(() => servicesStore.selectedServices.length)

    watch(
      () => servicesStore.selectedServices,
      (newVal) => {
        console.log('🟢 Services selected:', newVal)
      },
      { deep: true },
    )

    const goBack = () => {
      router.push('/booking/barber-selection')
    }

    const validateAndContinue = () => {
      if (servicesStore.selectedServices.length === 0) {
        bookingStore.showValidation('Please select at least one service.')
        return
      }
      router.push('/booking/form')
    }

    return {
      servicesStore,
      groupedServices,
      selectedServices,
      totalPrice,
      selectedServicesCount,
      goBack,
      validateAndContinue,
    }
  },
})
</script>
