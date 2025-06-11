import { supabase } from '@/supabaseClient'

export async function fetchAvailableHours(barberId, date, totalDuration, intervalMinutes) {
  const { data: slotData, error: slotError } = await supabase
    .from('time_slots')
    .select('slots')
    .single()

  if (slotError || !slotData?.slots) {
    console.error('Failed to fetch global time slots:', slotError)
    return []
  }

  const baseHours = slotData.slots

  const { data: takenData, error: takenError } = await supabase
    .from('availability')
    .select('hour')
    .eq('barber_id', barberId)
    .eq('date', date)
    .eq('is_available', false)

  const takenHours = takenError ? [] : takenData.map((item) => item.hour)

  const now = new Date()
  const selectedDate = new Date(date)
  const isToday = now.toDateString() === selectedDate.toDateString()

  const slotsNeeded = Math.ceil(totalDuration / intervalMinutes)
  const availableSlots = []

  for (let i = 0; i < baseHours.length; i++) {
    const chunk = baseHours.slice(i, i + slotsNeeded)

    if (chunk.length < slotsNeeded) continue
    if (chunk.some((slot) => takenHours.includes(slot))) continue

    if (isToday) {
      const [h, m] = baseHours[i].split(':').map(Number)
      const slotTime = new Date(date)
      slotTime.setHours(h, m, 0, 0)
      if (slotTime <= now) continue
    }

    availableSlots.push(baseHours[i])
  }

  return availableSlots
}
