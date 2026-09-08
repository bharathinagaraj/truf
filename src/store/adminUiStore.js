import { Store, useStore } from '@tanstack/react-store'

export const adminUiStore = new Store({
  tab: 'overview',
  confirmCancelId: null,
  couponDialogOpen: false,
  couponForm: { code: '', value: '', type: 'regular', valueType: 'percent', label: '' },
})

export function setAdminTab(tab) {
  adminUiStore.setState((s) => ({ ...s, tab }))
}

export function setAdminConfirmCancelId(id) {
  adminUiStore.setState((s) => ({ ...s, confirmCancelId: id || null }))
}

export function setCouponDialogOpen(open) {
  adminUiStore.setState((s) => ({ ...s, couponDialogOpen: !!open }))
}

export function setCouponFormField(key, value) {
  adminUiStore.setState((s) => ({ ...s, couponForm: { ...s.couponForm, [key]: value } }))
}

export function resetCouponForm() {
  adminUiStore.setState((s) => ({
    ...s,
    couponForm: { code: '', value: '', type: 'regular', valueType: 'percent', label: '' },
  }))
}

export function useAdminUi() {
  return useStore(adminUiStore, (s) => s)
}