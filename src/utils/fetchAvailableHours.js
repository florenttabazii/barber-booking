// ✅ fetchAvailableHours.js
import { supabase } from '@/supabaseClient'

export async function fetchAvailableHours(barberId, date) {
  // STEP 1: Fetch base hours from time_slots table
  const { data: slotData, error: slotError } = await supabase
    .from('time_slots')
    .select('slots')
    .single()

  if (slotError || !slotData?.slots) {
    console.error('Failed to fetch global time slots:', slotError)
    return [] // return nothing if base slots can't load
  }

  const baseHours = slotData.slots

  // STEP 2: Fetch taken hours from availability table
  const { data: takenData, error: takenError } = await supabase
    .from('availability')
    .select('hour')
    .eq('barber_id', barberId)
    .eq('date', date)
    .eq('is_available', false)

  if (takenError) {
    console.error('Failed to fetch blocked hours:', takenError)
    return baseHours // fallback: return all slots as available
  }

  const takenHours = takenData.map((item) => item.hour)

  // STEP 3: Filter out unavailable times
  return baseHours.filter((hour) => !takenHours.includes(hour))
}
