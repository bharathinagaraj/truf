import { Store, useStore } from '@tanstack/react-store'

export const homeStore = new Store({
  offerIndex: 0,
  offerCount: 0,
})

export function setOfferCount(count) {
  homeStore.setState((s) => ({ ...s, offerCount: count }))
}

export function advanceOffer() {
  homeStore.setState((s) => ({
    ...s,
    offerIndex: s.offerCount > 1 ? (s.offerIndex + 1) % s.offerCount : 0,
  }))
}

export function useHome() {
  return useStore(homeStore, (s) => s)
}