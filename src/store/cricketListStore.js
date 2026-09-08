import { Store, useStore } from '@tanstack/react-store'

export const cricketListStore = new Store({
  format: 'All',
})

export function setCricketListFormat(format) {
  cricketListStore.setState((s) => ({ ...s, format }))
}

export function useCricketListFormat() {
  return useStore(cricketListStore, (s) => s.format)
}