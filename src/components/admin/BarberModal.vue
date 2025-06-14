<template>
  <div class="modal-backdrop" @click.self="$emit('close')">
    <div class="admin-modal">
      <div class="modal-header d-flex justify-content-between align-items-center mb-3">
        <h5>{{ isEdit ? $t('barber.editTitle') : $t('barber.addTitle') }}</h5>
        <button class="btn-close" @click="$emit('close')"></button>
      </div>

      <div class="modal-content-box">
        <div class="mb-2" v-for="field in fields" :key="field.key">
          <label class="form-label">{{ $t(`barber.fields.${field.key}`) }}</label>
          <input
            v-model="form[field.key]"
            :type="field.type"
            class="form-control"
            :placeholder="$t(`barber.placeholders.${field.key}`)"
          />
        </div>

        <div class="mb-2">
          <label class="form-label">{{ $t('barber.fields.description') }}</label>
          <textarea
            v-model="form.description"
            class="form-control"
            rows="3"
            :placeholder="$t('barber.placeholders.description')"
          ></textarea>
          <small :class="wordCount < 45 ? 'text-danger' : 'text-muted'">
            {{ wordCount }} {{ $t('barber.words') }}
          </small>
        </div>

        <!-- Slot Interval Picker -->
        <div class="mb-2">
          <label class="form-label">{{ $t('barber.fields.slotInterval') }}</label>
          <select v-model="form.slot_interval_minutes" class="form-select">
            <option disabled value="">{{ $t('barber.selectInterval') }}</option>
            <option v-for="interval in [10, 15, 20, 30, 60]" :key="interval" :value="interval">
              {{ interval }} {{ $t('barber.minutes') }}
            </option>
          </select>
        </div>

        <!-- Weekly Working Hours -->
        <div class="mb-3">
          <label class="form-label">{{ $t('barber.fields.workingHours') }}</label>
          <div
            v-for="(day, index) in weekdays"
            :key="index"
            class="d-flex align-items-center gap-2 mb-2"
          >
            <span class="w-25">{{ $t(`weekdays.${day.label.toLowerCase()}`) }}</span>
            <input type="time" class="form-control" v-model="day.start_time" />
            <input type="time" class="form-control" v-model="day.end_time" />
          </div>
        </div>

        <div class="d-flex justify-content-between mt-4">
          <button class="btn btn-secondary" @click="$emit('close')">{{ $t('common.cancel') }}</button>
          <button class="btn btn-dark" @click="submitBarber" :disabled="wordCount < 45">
            {{ isEdit ? $t('barber.saveChanges') : $t('barber.addBarber') }}
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
  { key: 'experience', label: 'Experience', placeholder: 'Years of experience', type: 'number' },
  { key: 'rating', label: 'Rating', placeholder: 'Barber rating', type: 'number' },
  { key: 'total_clients', label: 'Total Clients', placeholder: 'Total clients', type: 'number' },
  { key: 'avatar_url', label: 'Avatar URL', placeholder: 'Link to avatar image', type: 'text' },
  { key: 'phone_number', label: 'Phone Number', placeholder: 'Enter phone number', type: 'text' },
]

// Weekday setup (Sunday = 0)
const weekdays = ref([
  { label: 'Su', weekday: 0, start_time: '', end_time: '' },
  { label: 'Mo', weekday: 1, start_time: '', end_time: '' },
  { label: 'Tu', weekday: 2, start_time: '', end_time: '' },
  { label: 'We', weekday: 3, start_time: '', end_time: '' },
  { label: 'Th', weekday: 4, start_time: '', end_time: '' },
  { label: 'Fr', weekday: 5, start_time: '', end_time: '' },
  { label: 'Sa', weekday: 6, start_time: '', end_time: '' },
])

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
  slot_interval_minutes: null,
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
  async (val) => {
    if (val && props.isEdit) {
      form.value = { ...val }

      // 🕒 Load working hours for this barber
      const { data, error } = await supabase
        .from('barber_working_hours')
        .select('weekday, start_time, end_time')
        .eq('barber_id', val.id)

      if (data) {
        // Clear first
        weekdays.value.forEach((day) => {
          day.start_time = ''
          day.end_time = ''
        })

        // Populate with existing data
        data.forEach((entry) => {
          const day = weekdays.value.find((d) => d.weekday === entry.weekday)
          if (day) {
            day.start_time = entry.start_time
            day.end_time = entry.end_time
          }
        })
      }
    } else {
      resetForm()
    }
  },
  { immediate: true },
)

const wordCount = computed(() => form.value.description.trim().split(/\s+/).filter(Boolean).length)

const submitBarber = async () => {
  const payload = { ...form.value }
  delete payload.id

  let error = null

  // ✅ Edit mode
  if (props.isEdit && props.barber?.id) {
    const res = await supabase.from('barbers').update(payload).eq('id', props.barber.id)
    error = res.error

    if (!error) {
      const barberId = props.barber.id

      await supabase.from('barber_working_hours').delete().eq('barber_id', barberId)

      const hoursToInsert = weekdays.value
        .filter((d) => d.start_time && d.end_time)
        .map((d) => ({
          barber_id: barberId,
          weekday: d.weekday,
          start_time: d.start_time,
          end_time: d.end_time,
        }))

      if (hoursToInsert.length > 0) {
        const whRes = await supabase.from('barber_working_hours').insert(hoursToInsert)
        if (whRes.error) {
          alert('Working hours update failed: ' + whRes.error.message)
        }
      }
    }
  }

  // ✅ Add mode
  if (!props.isEdit) {
    const { data: inserted, error: insertError } = await supabase
      .from('barbers')
      .insert(payload)
      .select()
      .single()

    if (insertError) {
      alert('Failed to add barber: ' + insertError.message)
      return
    }

    const barberId = inserted.id

    const hoursToInsert = weekdays.value
      .filter((d) => d.start_time && d.end_time)
      .map((d) => ({
        barber_id: barberId,
        weekday: d.weekday,
        start_time: d.start_time,
        end_time: d.end_time,
      }))

    if (hoursToInsert.length > 0) {
      const whRes = await supabase.from('barber_working_hours').insert(hoursToInsert)
      if (whRes.error) {
        alert('Working hours creation failed: ' + whRes.error.message)
      }
    }

    emit('save')
    return
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
