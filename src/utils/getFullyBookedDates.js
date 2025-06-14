// utils/getFullyBookedDates.js
import { supabase } from '@/supabaseClient'

export async function getFullyBookedDates(barberId, intervalMinutes, totalDuration = 30) {
  const { data, error } = await supabase
    .from('availability')
    .select('date, hour')
    .eq('barber_id', barberId)
    .eq('is_available', false)

  if (error) {
    console.error('❌ Error fetching availability:', error)
    return []
  }

  // Group by date
  const grouped = {}
  data.forEach(({ date, hour }) => {
    if (!grouped[date]) grouped[date] = []
    grouped[date].push(hour)
  })

  // Now check if there are enough taken hours on each day to block any full slot of `totalDuration`
  const fullyBooked = []

  for (const [date, hours] of Object.entries(grouped)) {
    const slots = hours.sort()
    const slotsNeeded = Math.ceil(totalDuration / intervalMinutes)
    const uniqueSlots = [...new Set(slots)]

    for (let i = 0; i <= uniqueSlots.length - slotsNeeded; i++) {
      const chunk = uniqueSlots.slice(i, i + slotsNeeded)
      const isContiguous = chunk.every((time, idx, arr) => {
        if (idx === 0) return true
        const [h1, m1] = arr[idx - 1].split(':').map(Number)
        const [h2, m2] = time.split(':').map(Number)
        const prev = h1 * 60 + m1
        const curr = h2 * 60 + m2
        return curr - prev === intervalMinutes
      })

      if (isContiguous) {
        fullyBooked.push(date)
        break
      }
    }
  }

  return fullyBooked
}
