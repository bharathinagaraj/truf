import { Store, useStore } from '@tanstack/react-store'

const KEY = 'truf_last_booking_result'

function readStored() {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export const cricketBookingResultStore = new Store({
  result: readStored(),
})

export function setCricketBookingResult(result) {
  try {
    localStorage.setItem(KEY, JSON.stringify(result))
  } catch {
    /* storage unavailable */
  }
  cricketBookingResultStore.setState((s) => ({ ...s, result }))
}

export function clearCricketBookingResult() {
  try {
    localStorage.removeItem(KEY)
  } catch {
    /* storage unavailable */
  }
  cricketBookingResultStore.setState((s) => ({ ...s, result: null }))
}

export function useCricketBookingResult() {
  return useStore(cricketBookingResultStore, (s) => s.result)
}