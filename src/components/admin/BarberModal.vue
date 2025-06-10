<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5>{{ isEdit ? 'Edit Barber' : 'Add Barber' }}</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="modal-content-box">
        <div class="mb-2" v-for="field in fields" :key="field.key">
          <label class="form-label">{{ field.label }}</label>
          <input
            v-model="form[field.key]"
            :type="field.type"
            class="form-control"
            :placeholder="field.placeholder"
          />
        </div>

        <div class="mb-2">
          <label class="form-label">Description</label>
          <textarea
            v-model="form.description"
            class="form-control"
            rows="3"
            placeholder="Enter at least 45 words"
          ></textarea>
          <small :class="wordCount < 45 ? 'text-danger' : 'text-muted'">
            {{ wordCount }} words
          </small>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="$emit('close')">Cancel</button>
          <button class="btn btn-dark" @click="submitBarber" :disabled="wordCount < 45">
            {{ isEdit ? 'Save Changes' : 'Add Barber' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { supabase } from '@/supabaseClient'

const props = defineProps({
  barber: Object,
  isEdit: Boolean,
})

const emit = defineEmits(['close', 'save'])

const fields = [
  { key: 'name', label: 'First Name', placeholder: 'Enter name', type: 'text' },
  { key: 'surname', label: 'Surname', placeholder: 'Enter surname', type: 'text' },
  { key: 'phone_number', label: 'Phone Number', placeholder: 'Enter phone number', type: 'text' },
  { key: 'experience', label: 'Experience', placeholder: 'Years of experience', type: 'number' },
  { key: 'rating', label: 'Rating', placeholder: 'Barber rating', type: 'number' },
  { key: 'total_clients', label: 'Total Clients', placeholder: 'Total clients', type: 'number' },
  { key: 'avatar_url', label: 'Avatar URL', placeholder: 'Link to avatar image', type: 'text' },
]

const form = ref({
  name: '',
  surname: '',
  phone_number: '',
  experience: 0,
  rating: 0,
  total_clients: 0,
  avatar_url: '',
  description: '',
  is_active: true,
})

const resetForm = () => {
  form.value = {
    name: '',
    surname: '',
    phone_number: '',
    experience: 0,
    rating: 0,
    total_clients: 0,
    avatar_url: '',
    description: '',
    is_active: true,
  }
}

watch(
  () => props.barber,
  (val) => {
    if (val && props.isEdit) {
      form.value = { ...val }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const wordCount = computed(() => form.value.description.trim().split(/\s+/).filter(Boolean).length)

const submitBarber = async () => {
  const payload = { ...form.value }
  let error = null

  if (props.isEdit && props.barber?.id) {
    const res = await supabase.from('barbers').update(payload).eq('id', props.barber.id)
    error = res.error
  } else {
    const res = await supabase.from('barbers').insert([payload])
    error = res.error
  }

  if (error) {
    alert(error.message)
    return
  }

  emit('save')
}
</script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  z-index: 1050;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}
.admin-modal {
  background: white;
  padding: 2rem;
  width: 600px;
  border-radius: 8px;
  max-width: 95vw;
}
</style>
