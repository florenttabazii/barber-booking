<template>
  <div>
    <div class="row">
      <div v-for="barber in barbers" :key="barber.id" class="col-md-4 mb-4">
        <BarberCard :barber="barber" />
      </div>
    </div>

    <div class="row" v-if="selectedBarberId">
      <div class="col-12 text-center">
        <button class="btn btn-success btn-lg px-5" @click="continueToBooking">
          <i class="fas fa-arrow-right me-2"></i>Continue to Booking
        </button>
      </div>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useBarbersStore } from '../stores/barbers'
import BarberCard from '../components/BarberCard.vue'

export default defineComponent({
  name: 'BarberSelection',
  components: {
    BarberCard,
  },
  setup() {
    const router = useRouter()
    const barbersStore = useBarbersStore()

    const barbers = computed(() => barbersStore.barbers)
    const selectedBarberId = computed(() => barbersStore.selectedBarberId)

    // ✅ Load barbers from Supabase when this page opens
    onMounted(() => {
      barbersStore.loadBarbers()
    })

    const continueToBooking = () => {
      if (!selectedBarberId.value) {
        alert('Please select a barber to continue.')
        return
      }
      router.push('/booking/services')
    }

    return {
      barbers,
      selectedBarberId,
      continueToBooking,
    }
  },
})
</script>
