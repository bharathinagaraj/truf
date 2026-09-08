const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

function toHour(slotTime) {
  if (!slotTime) return null
  const m = String(slotTime).match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i)
  if (!m) return null
  let h = Number(m[1]) % 12
  if (m[3].toUpperCase() === 'PM') h += 12
  return h + Number(m[2]) / 60
}

function weekdayOf(date) {
  if (!date) return null
  const d = new Date(date + 'T12:00:00')
  if (isNaN(d.getTime())) return null
  return DAY_NAMES[d.getDay()]
}

function advanceDays(date) {
  if (!date) return null
  const start = new Date()
  start.setHours(0, 0, 0, 0)
  const d = new Date(date + 'T00:00:00')
  if (isNaN(d.getTime())) return null
  return Math.round((d.getTime() - start.getTime()) / 86400000)
}

function inferValueType(coupon) {
  if (coupon && (coupon.valueType === 'flat' || coupon.valueType === 'percent')) {
    return coupon.valueType
  }
  const code = String(coupon?.code || '')
  const label = String(coupon?.label || '')
  if (code.startsWith('FESTIVE') || code.startsWith('VIP') || /flat/i.test(label) || /₹\d+\s*off/i.test(label)) {
    return 'flat'
  }
  return 'percent'
}

function couponMeta(coupon) {
  if (!coupon) return null
  return {
    code: coupon.code,
    type: coupon.type,
    value: coupon.value,
    valueType: inferValueType(coupon),
    label: coupon.label,
    minSubtotal: coupon.minSubtotal || undefined,
    advanceDays: coupon.advanceDays || undefined,
    dayFilter: coupon.dayFilter || undefined,
    slotHourMin: coupon.slotHourMin || undefined,
  }
}

function computeDiscount(coupon, basePrice) {
  if (!coupon) return 0
  if (inferValueType(coupon) === 'flat') {
    return Math.min(basePrice, Math.max(0, Number(coupon.value) || 0))
  }
  return Math.min(basePrice, Math.round((Number(coupon.value) || 0) / 100 * basePrice))
}

function applyCoupon(db, { couponCode, basePrice, date, slotTime, user }) {
  const noCoupon = { coupon: null, discount: 0, eligible: true, reason: null }
  if (!couponCode) return noCoupon

  const coupon = (db.coupons || []).find(
    (c) => c.code && c.code.toLowerCase() === String(couponCode).toLowerCase() && c.active,
  )
  if (!coupon) {
    return { coupon: null, discount: 0, eligible: false, reason: `${couponCode} is not a valid coupon` }
  }

  const hasBooking = (db.cricketBookings || []).some((b) => user && b.userId === user.id)
  let reason = null

  if (coupon.type === 'first' && hasBooking) {
    reason = `${coupon.code} is only valid for first-time bookings`
  }
  if (!reason && coupon.advanceDays) {
    const days = advanceDays(date)
    if (days === null || days < coupon.advanceDays) {
      reason = `Book ${coupon.advanceDays}+ days early to use ${coupon.code}`
    }
  }
  if (!reason && coupon.dayFilter && coupon.dayFilter.length) {
    const dow = weekdayOf(date)
    if (!coupon.dayFilter.includes(dow)) {
      reason = `${coupon.code} is valid only on ${coupon.dayFilter.join(', ')}`
    }
  }
  if (!reason && coupon.slotHourMin) {
    const h = toHour(slotTime)
    if (h === null || h < coupon.slotHourMin) {
      reason = `${coupon.code} is valid for evening slots (${coupon.slotHourMin * 1} onwards)`
    }
  }
  if (!reason && coupon.minSubtotal && basePrice < coupon.minSubtotal) {
    reason = `Spend ₹${coupon.minSubtotal} or more to use ${coupon.code}`
  }
  if (reason) {
    return { coupon: couponMeta(coupon), discount: 0, eligible: false, reason }
  }

  const discount = computeDiscount(coupon, basePrice)
  return { coupon: couponMeta(coupon), discount, eligible: true, reason: null }
}

module.exports = { applyCoupon, computeDiscount, couponMeta, inferValueType, toHour, weekdayOf, advanceDays }