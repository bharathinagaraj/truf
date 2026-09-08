import { Store, useStore } from '@tanstack/react-store'

export const cricketCheckoutStore = new Store({
  payerName: null,
  phone: null,
  upiId: '',
  card: { number: '', name: '', expiry: '', cvv: '' },
  processing: false,
})

export function setCheckoutField(key, value) {
  cricketCheckoutStore.setState((s) => ({ ...s, [key]: value }))
}

export function setCheckoutCard(field, value) {
  cricketCheckoutStore.setState((s) => ({ ...s, card: { ...s.card, [field]: value } }))
}

export function setCheckoutProcessing(processing) {
  cricketCheckoutStore.setState((s) => ({ ...s, processing }))
}

export function resetCricketCheckout() {
  cricketCheckoutStore.setState((s) => ({
    ...s,
    payerName: null,
    phone: null,
    upiId: '',
    card: { number: '', name: '', expiry: '', cvv: '' },
    processing: false,
  }))
}

export function useCricketCheckout() {
  return useStore(cricketCheckoutStore, (s) => s)
}