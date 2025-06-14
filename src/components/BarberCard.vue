<template>
  <div
    class="card barber-card h-100"
    :class="{ 'border-primary': isSelected }"
    @click="selectBarber"
    style="cursor: pointer"
  >
    <div class="card-body text-center p-4">
      <img :src="barber.avatar_url" :alt="barber.name" class="profile-img mb-3" />
      <h4 class="card-title mb-2">{{ barber.name }} {{ barber.surname }}</h4>
      <p class="card-text text-muted mb-3" style="font-size: 0.9em">
        {{ barber.description }}
      </p>

      <div class="row mb-3">
        <div class="col-4">
          <div class="text-center">
            <i class="fas fa-star text-warning fa-lg mb-1"></i>
            <div class="fw-bold">{{ barber.rating }}</div>
            <small class="text-muted">{{ $t('barberCard.rating') }}</small>
          </div>
        </div>
        <div class="col-4">
          <div class="text-center">
            <i class="fas fa-scissors text-primary fa-lg mb-1"></i>
            <div class="fw-bold">{{ barber.experience }}y</div>
            <small class="text-muted">{{ $t('barberCard.experience') }}</small>
          </div>
        </div>
        <div class="col-4">
          <div class="text-center">
            <i class="fas fa-users text-success fa-lg mb-1"></i>
            <div class="fw-bold">{{ barber.total_clients }}+</div>
            <small class="text-muted">{{ $t('barberCard.clients') }}</small>
          </div>
        </div>
      </div>

      <button
        class="btn w-100"
        :class="isSelected ? 'btn-primary' : 'btn-outline-primary'"
        @click.stop="selectBarber"
      >
        <i class="fas" :class="isSelected ? 'fa-check' : 'fa-calendar'"></i>
        {{ $t(isSelected ? 'barberCard.selected' : 'barberCard.select') }}
      </button>
    </div>
  </div>
</template>

<script>
import { defineComponent, computed } from 'vue'
import { useBarbersStore } from '../stores/barbers'

export default defineComponent({
  name: 'BarberCard',
  props: {
    barber: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const barbersStore = useBarbersStore()

    const isSelected = computed(() => {
      return barbersStore.selectedBarberId === props.barber.id
    })

    const selectBarber = () => {
      barbersStore.selectBarber(props.barber.id)
    }

    return {
      isSelected,
      selectBarber,
    }
  },
})
</script>
