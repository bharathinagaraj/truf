import { Store, useStore } from '@tanstack/react-store'

export const loginStore = new Store({
  tab: 'login',
  role: 'customer',
  form: { name: '', email: '', phone: '', password: '' },
  initialized: false,
})

export function setLoginTab(tab) {
  loginStore.setState((s) => ({ ...s, tab, initialized: true }))
}

export function setLoginRole(role) {
  loginStore.setState((s) => ({ ...s, role, initialized: true }))
}

export function setLoginFormField(key, value) {
  loginStore.setState((s) => ({ ...s, form: { ...s.form, [key]: value }, initialized: true }))
}

export function useLogin() {
  return useStore(loginStore, (s) => s)
}