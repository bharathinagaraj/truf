import { Store, useStore } from '@tanstack/react-store'

export const cricketBookingStore = new Store({
  match: null,
  slotId: null,
  slotTime: null,
  players: 1,
  coupon: null,
  couponText: '',
  date: new Date().toISOString().slice(0, 10),
  dateDir: null,
  paymentMethod: null,
})

export function startCricketBooking(match, slotId, slotTime, players) {
  cricketBookingStore.setState((s) => ({
    ...s,
    match,
    slotId: slotId || null,
    slotTime: slotTime || null,
    players: Math.max(1, Math.min(6, players || s.players || 1)),
    coupon: s.coupon || null,
    couponText: s.coupon ? s.coupon.code : s.couponText || '',
    paymentMethod: null,
    dateDir: null,
  }))
}

export function setCricketSlot(slotId, slotTime) {
  cricketBookingStore.setState((s) => ({ ...s, slotId, slotTime }))
}

export function setCricketDate(date, dir = null) {
  cricketBookingStore.setState((s) => ({ ...s, date, dateDir: dir }))
}

export function setCricketPlayers(players) {
  cricketBookingStore.setState((s) => ({
    ...s,
    players: Math.max(1, Math.min(6, Number(players) || 1)),
  }))
}

export function setCricketCoupon(coupon) {
  cricketBookingStore.setState((s) => ({
    ...s,
    coupon,
    couponText: coupon ? coupon.code : s.couponText,
  }))
}

export function setCricketCouponText(text) {
  cricketBookingStore.setState((s) => ({ ...s, couponText: text }))
}

export function setCricketPaymentMethod(paymentMethod) {
  cricketBookingStore.setState((s) => ({ ...s, paymentMethod }))
}

export function resetCricketBooking() {
  cricketBookingStore.setState((s) => ({
    ...s,
    slotId: null,
    slotTime: null,
    players: 1,
    coupon: null,
    couponText: '',
    dateDir: null,
    paymentMethod: null,
  }))
}

export function useCricketBooking() {
  return useStore(cricketBookingStore, (s) => s)
}