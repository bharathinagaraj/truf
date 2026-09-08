import { Store, useStore } from '@tanstack/react-store'
import { getToken, setToken, clearToken } from '@/lib/api'

export const authStore = new Store({
  user: null,
  token: null,
  hydrated: false,
})

export function hydrateAuth(user) {
  authStore.setState((s) => ({ ...s, user, token: user ? getToken() : null, hydrated: true }))
}

export function setAuthedUser(user, token) {
  setToken(token)
  authStore.setState((s) => ({ ...s, user, token, hydrated: true }))
}

export function logout() {
  clearToken()
  authStore.setState((s) => ({ ...s, user: null, token: null }))
}

export function useAuthUser() {
  return useStore(authStore, (s) => s.user)
}

export function useIsAdmin() {
  return useStore(authStore, (s) => s.user?.role === 'admin')
}

export function useIsAuthed() {
  return useStore(authStore, (s) => !!s.user)
}
