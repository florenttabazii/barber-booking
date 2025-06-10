<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal text-center">
      <h5 class="mb-3">Delete Barber</h5>
      <p>
        Are you sure you want to delete <strong>{{ barber.name }} {{ barber.surname }}</strong
        >?
      </p>
      <div class="d-flex justify-content-between mt-4">
        <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
        <button class="btn btn-danger" @click="confirmDelete">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { supabase } from '@/supabaseClient'

const props = defineProps({
  barber: Object,
})

const emit = defineEmits(['close', 'confirmDelete'])

const confirmDelete = async () => {
  const { error } = await supabase.from('barbers').delete().eq('id', props.barber.id)

  if (error) {
    alert(error.message)
    return
  }

  emit('confirmDelete')
}
</script>
