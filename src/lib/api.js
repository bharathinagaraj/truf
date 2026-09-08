const TOKEN_KEY = 'truf_token'

export function getToken() {
  return localStorage.getItem(TOKEN_KEY)
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token)
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY)
}

async function request(path, { method = 'GET', body, auth = false } = {}) {
  const headers = { 'Content-Type': 'application/json' }
  if (auth) {
    const token = getToken()
    if (token) headers.Authorization = `Bearer ${token}`
  }
  const res = await fetch(`/api${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.message || 'Something went wrong')
  }
  return data
}

export const api = {
  // auth
  register: (body) => request('/auth/register', { method: 'POST', body }),
  login: (body) => request('/auth/login', { method: 'POST', body }),
  me: () => request('/auth/me', { auth: true }),

  // cricket offers
  offers: () => request('/cricket/offers'),

  // coupons
  coupons: () => request('/coupons'),
  validateCoupons: () => request('/coupons/validate', { auth: true }),
  createCoupon: (body) => request('/coupons', { method: 'POST', auth: true, body }),
  updateCoupon: (id, body) => request(`/coupons/${id}`, { method: 'PATCH', auth: true, body }),
  deleteCoupon: (id) => request(`/coupons/${id}`, { method: 'DELETE', auth: true }),

  // cricket
  cricketMatches: (params = {}) => {
    const q = new URLSearchParams(params).toString()
    return request(`/cricket${q ? '?' + q : ''}`)
  },
  cricketFeatured: () => request('/cricket/featured'),
  cricketMatch: (id) => request(`/cricket/${id}`),
  cricketSlots: (id) => request(`/cricket/${id}/slots`, { auth: true }),
  cricketPrice: (id, body) => request(`/cricket/${id}/price`, { method: 'POST', auth: true, body }),
  cricketRecommend: (id, body) => request(`/cricket/${id}/recommend`, { method: 'POST', auth: true, body }),
  cricketBook: (id, body) => request(`/cricket/${id}/book`, { method: 'POST', auth: true, body }),
  cricketCancelBooking: (matchId, bookingId) => request(`/cricket/${matchId}/cancel/${bookingId}`, { method: 'POST', auth: true }),
  cricketUserBookings: () => request('/cricket/user/bookings', { auth: true }),
  cricketAdminBookings: () => request('/cricket/admin/bookings', { auth: true }),
  cricketReminders: () => request('/cricket/user/reminders', { auth: true }),
  cricketReadReminder: (id) => request(`/cricket/user/reminders/${id}/read`, { method: 'POST', auth: true }),
}
