import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { api } from '@/lib/api'
import { useAuthUser } from '@/store/authStore'

export function useOffers() {
  return useQuery({
    queryKey: ['offers'],
    queryFn: () => api.offers(),
  })
}

export function useCoupons() {
  return useQuery({
    queryKey: ['coupons'],
    queryFn: () => api.coupons(),
  })
}

export function useValidateCoupons() {
  const user = useAuthUser()
  return useQuery({
    queryKey: ['validate-coupons'],
    queryFn: () => api.validateCoupons(),
    enabled: !!user,
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (body) => api.createCoupon(body),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  })
}

export function useToggleCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, active }) => api.updateCoupon(id, { active }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  })
}

export function useDeleteCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.deleteCoupon(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['coupons'] }),
  })
}

export function useCricketMatches(params) {
  return useQuery({
    queryKey: ['cricket-matches', params],
    queryFn: () => api.cricketMatches(params),
  })
}

export function useCricketFeatured() {
  return useQuery({
    queryKey: ['cricket-featured'],
    queryFn: () => api.cricketFeatured(),
  })
}

export function useCricketMatch(id) {
  return useQuery({
    queryKey: ['cricket-match', id],
    queryFn: () => api.cricketMatch(id),
    enabled: !!id,
  })
}

export function useCricketSlots(id) {
  const user = useAuthUser()
  return useQuery({
    queryKey: ['cricket-slots', id],
    queryFn: () => api.cricketSlots(id),
    enabled: !!id && !!user,
  })
}

export function useCricketPrice(id, params) {
  const user = useAuthUser()
  const enabled = !!id && !!params && !!user
  return useQuery({
    queryKey: ['cricket-price', id, params],
    queryFn: () => api.cricketPrice(id, params),
    enabled,
    staleTime: 10 * 1000,
  })
}

export function useCricketRecommend() {
  return useMutation({
    mutationFn: ({ matchId, ...body }) => api.cricketRecommend(matchId, body),
  })
}

export function useCricketBook() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, ...body }) => api.cricketBook(matchId, body),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cricket-matches'] })
      qc.invalidateQueries({ queryKey: ['cricket-featured'] })
      qc.invalidateQueries({ queryKey: ['cricket-user-bookings'] })
      qc.invalidateQueries({ queryKey: ['cricket-admin-bookings'] })
      qc.invalidateQueries({ queryKey: ['cricket-reminders'] })
    },
  })
}

export function useCricketCancelBooking() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ matchId, bookingId }) => api.cricketCancelBooking(matchId, bookingId),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['cricket-user-bookings'] })
      qc.invalidateQueries({ queryKey: ['cricket-admin-bookings'] })
      qc.invalidateQueries({ queryKey: ['cricket-matches'] })
      qc.invalidateQueries({ queryKey: ['cricket-reminders'] })
    },
  })
}

export function useCricketUserBookings() {
  const user = useAuthUser()
  return useQuery({
    queryKey: ['cricket-user-bookings'],
    queryFn: () => api.cricketUserBookings(),
    enabled: !!user,
  })
}

export function useCricketAdminBookings() {
  const user = useAuthUser()
  return useQuery({
    queryKey: ['cricket-admin-bookings'],
    queryFn: () => api.cricketAdminBookings(),
    enabled: user?.role === 'admin',
  })
}

export function useCricketReminders() {
  const user = useAuthUser()
  return useQuery({
    queryKey: ['cricket-reminders'],
    queryFn: () => api.cricketReminders(),
    enabled: !!user,
  })
}

export function useCricketReadReminder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id) => api.cricketReadReminder(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['cricket-reminders'] }),
  })
}
