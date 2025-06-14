import { supabase } from '@/supabaseClient'

export async function fetchAvailableHours(barberId, date, totalDuration = 30) {
  const selectedDate = new Date(date)
  const dayNumber = selectedDate.getDay() // 0 = Sunday, 6 = Saturday

  // 1️⃣ Get interval from barbers table
  const { data: barberData, error: barberError } = await supabase
    .from('barbers')
    .select('slot_interval_minutes')
    .eq('id', barberId)
    .single()

  if (barberError || !barberData?.slot_interval_minutes) {
    console.error('❌ Failed to fetch barber interval:', barberError)
    return []
  }

  const intervalMinutes = barberData.slot_interval_minutes

  // 2️⃣ Get working hours for the correct weekday
  const { data: hoursData, error: hoursError } = await supabase
    .from('barber_working_hours')
    .select('start_time, end_time')
    .eq('barber_id', barberId)
    .eq('weekday', dayNumber)
    .single()

  if (hoursError || !hoursData?.start_time || !hoursData?.end_time) {
    console.warn('⚠️ No working hours found for this day.')
    return []
  }

  const start = hoursData.start_time
  const end = hoursData.end_time

  // 3️⃣ Generate slot times
  function generateSlots(startTime, endTime, interval) {
    const slots = []
    const [sh, sm] = startTime.split(':').map(Number)
    const [eh, em] = endTime.split(':').map(Number)

    let current = new Date(date)
    current.setHours(sh, sm, 0, 0)

    const endTimeObj = new Date(date)
    endTimeObj.setHours(eh, em, 0, 0)

    while (current < endTimeObj) {
      const hh = current.getHours().toString().padStart(2, '0')
      const mm = current.getMinutes().toString().padStart(2, '0')
      slots.push(`${hh}:${mm}`)
      current.setMinutes(current.getMinutes() + interval)
    }

    return slots
  }

  const baseSlots = generateSlots(start, end, intervalMinutes)

  // 4️⃣ Fetch taken/unavailable hours
  const formattedDate = new Date(date).toISOString().split('T')[0]

  const { data: takenData, error: takenError } = await supabase
    .from('availability')
    .select('hour')
    .eq('barber_id', barberId)
    .eq('date', formattedDate)
    .eq('is_available', false)

  const normalizeTime = (t) => {
    const [h, m] = t.trim().split(':').map(Number)
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`
  }

  const takenHours = takenError
    ? []
    : takenData.map((item) => normalizeTime(item.hour))

  // 5️⃣ Filter available slots
  const now = new Date()
  const isToday = now.toDateString() === selectedDate.toDateString()
  const slotsNeeded = Math.ceil(totalDuration / intervalMinutes)
  const availableSlots = []

  for (let i = 0; i <= baseSlots.length - slotsNeeded; i++) {
    const chunk = baseSlots.slice(i, i + slotsNeeded)

    if (chunk.some((slot) => takenHours.includes(slot))) continue

    if (isToday) {
      const [h, m] = baseSlots[i].split(':').map(Number)
      const slotTime = new Date(date)
      slotTime.setHours(h, m, 0, 0)
      if (slotTime <= now) continue
    }

    availableSlots.push(baseSlots[i])
  }

  return availableSlots
}
