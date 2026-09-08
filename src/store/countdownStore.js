import { Store, useStore } from '@tanstack/react-store'

export const countdownStore = new Store({ now: Date.now() })

export function useNow() {
  return useStore(countdownStore, (s) => s.now)
}