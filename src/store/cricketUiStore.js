import { Store, useStore } from '@tanstack/react-store'

export const cricketUiStore = new Store({
  confirmCancelId: null,
})

export function setConfirmCancelId(id) {
  cricketUiStore.setState((s) => ({ ...s, confirmCancelId: id || null }))
}

export function useCricketUi() {
  return useStore(cricketUiStore, (s) => s)
}