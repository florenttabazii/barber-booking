import { defineStore } from 'pinia'
import { supabase } from '@/supabaseClient'
import { useBookingStore } from './booking' // ✅ required for selection sync

export const useBarbersStore = defineStore('barbers', {
  state: () => ({
    barbers: [],
    selectedBarberId: null,
  }),

  getters: {
    selectedBarber: (state) => {
      return state.barbers.find((barber) => barber.id === state.selectedBarberId)
    },
  },

  actions: {
    async loadBarbers() {
      const { data, error } = await supabase
        .from('barbers')
        .select('*')
        .eq('is_active', true) // ✅ Only load active barbers
        .order('name', { ascending: true })

      if (error) {
        console.error('Failed to load barbers:', error)
        return
      }
      this.barbers = data
    },

    selectBarber(barberId) {
      this.selectedBarberId = barberId
      const bookingStore = useBookingStore()
      bookingStore.updateBookingField('barber_id', barberId)
      bookingStore.saveToStorage()
    },

    resetSelection() {
      this.selectedBarberId = null
    },
  },
})
