const { Router } = require('express')
const { load, save, uid } = require('../db')
const { auth, optionalAuth } = require('../middleware')
const { applyCoupon, toHour } = require('../couponLogic')

const router = Router()

router.get('/offers', (req, res) => {
  const db = load()
  res.json(db.offers || [])
})

router.get('/', (req, res) => {
  const db = load()
  const { format, city } = req.query
  let list = db.cricketMatches || []
  if (format && format !== 'All') list = list.filter((m) => m.format === format)
  if (city) list = list.filter((m) => m.city.toLowerCase().includes(String(city).toLowerCase()))
  res.json(list)
})

router.get('/featured', (req, res) => {
  const db = load()
  const list = (db.cricketMatches || []).filter((m) => m.featured)
  res.json(list)
})

router.get('/user/bookings', auth, (req, res) => {
  const db = load()
  const bookings = (db.cricketBookings || []).filter((b) => b.userId === req.user.id)
  res.json(bookings)
})

router.get('/admin/bookings', auth, (req, res) => {
  const db = load()
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin only' })
  res.json(db.cricketBookings || [])
})

router.get('/user/reminders', auth, (req, res) => {
  const db = load()
  const reminders = (db.reminders || []).filter((r) => r.userId === req.user.id)
  res.json(reminders)
})

router.post('/user/reminders/:id/read', auth, (req, res) => {
  const db = load()
  const reminder = (db.reminders || []).find(
    (r) => r.id === req.params.id && r.userId === req.user.id,
  )
  if (reminder) {
    reminder.read = true
    save(db)
  }
  res.json({ ok: true })
})

router.get('/:id', (req, res) => {
  const db = load()
  const match = (db.cricketMatches || []).find((m) => m.id === req.params.id)
  if (!match) return res.status(404).json({ message: 'Match not found' })
  res.json(match)
})

router.get('/:id/slots', auth, (req, res) => {
  const db = load()
  const match = (db.cricketMatches || []).find((m) => m.id === req.params.id)
  if (!match) return res.status(404).json({ message: 'Match not found' })
  const slots = (match.timeSlots || []).map((s) => ({
    ...s,
    available: s.booked < s.capacity,
    remaining: s.capacity - s.booked,
  }))
  res.json(slots)
})

// Source of truth for pricing — used by the match page & checkout so totals always match /book
router.post('/:id/price', optionalAuth, (req, res) => {
  const db = load()
  const match = (db.cricketMatches || []).find((m) => m.id === req.params.id)
  if (!match) return res.status(404).json({ message: 'Match not found' })

  const { slotId, players = 1, couponCode, date } = req.body
  if (!slotId) return res.status(400).json({ message: 'Select a time slot' })

  const slot = match.timeSlots.find((s) => s.id === slotId)
  if (!slot) return res.status(400).json({ message: 'Invalid slot' })

  const playerCount = Math.min(6, Math.max(1, Number(players) || 1))
  const basePrice = match.entryFee * playerCount

  const couponResult = applyCoupon(db, {
    couponCode: couponCode || null,
    basePrice,
    date: date || new Date().toISOString().slice(0, 10),
    slotTime: slot.time,
    user: req.user || null,
  })

  res.json({
    matchId: match.id,
    date: date || new Date().toISOString().slice(0, 10),
    slotId,
    slotTime: slot.time,
    players: playerCount,
    basePrice,
    discount: couponResult.discount,
    total: basePrice - couponResult.discount,
    couponCode: couponResult.coupon?.code || null,
    couponLabel: couponResult.coupon?.label || null,
    couponEligible: couponResult.eligible,
    reason: couponResult.reason,
  })
})

function slotHour(slot) {
  return toHour(slot.time)
}

// AI-style smart slot pick — scores every free slot against the preferred style
router.post('/:id/recommend', optionalAuth, (req, res) => {
  const db = load()
  const match = (db.cricketMatches || []).find((m) => m.id === req.params.id)
  if (!match) return res.status(404).json({ message: 'Match not found' })

  const preferences = Array.isArray(req.body.preferences) ? req.body.preferences : []
  const wantEvening = preferences.includes('evening')
  const wantMorning = preferences.includes('morning')
  const wantCrowd = preferences.includes('leastcrowd')
  const wantValue = preferences.includes('value')

  const scored = (match.timeSlots || [])
    .map((s) => {
      const remaining = Math.max(0, s.capacity - s.booked)
      const h = slotHour(s)
      let score = 10 + remaining * 2
      const tags = []
      const reasons = []

      if (remaining <= 0) return null

      if (h !== null && h >= 17) {
        score += wantEvening ? 10 : 4
        tags.push('evening')
      }
      if (h !== null && h >= 17 && wantEvening) reasons.push('prime evening slot')
      if (h !== null && h >= 17 && !wantMorning) reasons.push('night floodlight vibes')

      if (h !== null && h >= 6 && h <= 11) {
        score += wantMorning ? 10 : 2
        tags.push('morning')
      }
      if (wantMorning && h !== null && h >= 6 && h <= 11) reasons.push('fresh morning session')

      if (wantCrowd) {
        score += remaining * 1.5
        reasons.push(`${remaining} spots open — play less crowded`)
      }

      if (wantValue) {
        score += remaining >= 4 ? 4 : 0
        if (remaining >= 4) reasons.push('great value with space to spare')
      }

      if (remaining <= 2) {
        score += 5
        tags.push('almost-full')
        reasons.push('only few spots left — book fast')
      }

      return {
        slotId: s.id,
        time: s.time,
        remaining,
        booked: s.booked,
        capacity: s.capacity,
        score: Math.round(score * 10) / 10,
        tags,
        reasons: reasons.slice(0, 2),
      }
    })
    .filter(Boolean)
    .sort((a, b) => b.score - a.score)

  const top = scored.slice(0, 5)
  const best = top[0] || null

  res.json({
    matchId: match.id,
    date: req.body.date || new Date().toISOString().slice(0, 10),
    preferences,
    best,
    picks: top,
    summary: best
      ? `AI suggests ${match.title} at ${best.time} — ${best.reasons.join(', ').toLowerCase()}`
      : 'No slots available right now',
  })
})

router.post('/:id/book', auth, (req, res) => {
  const db = load()
  const match = (db.cricketMatches || []).find((m) => m.id === req.params.id)
  if (!match) return res.status(404).json({ message: 'Match not found' })

  const { slotId, players = 1, paymentMethod, couponCode, date, payerName, phone, upiId, cardNumber, cardExpiry } = req.body
  if (!slotId) return res.status(400).json({ message: 'Select a time slot' })

  const slot = match.timeSlots.find((s) => s.id === slotId)
  if (!slot) return res.status(400).json({ message: 'Invalid slot' })

  const usedDate = date || new Date().toISOString().slice(0, 10)
  const playerCount = Math.min(6, Math.max(1, Number(players) || 1))
  const remaining = slot.capacity - slot.booked
  if (playerCount > remaining)
    return res.status(400).json({ message: `Only ${remaining} slot${remaining === 1 ? '' : 's'} left in this time slot` })

  const basePrice = match.entryFee * playerCount

  const couponResult = applyCoupon(db, {
    couponCode: couponCode || null,
    basePrice,
    date: usedDate,
    slotTime: slot.time,
    user: req.user,
  })
  if (couponCode && !couponResult.eligible) {
    return res.status(400).json({ message: couponResult.reason || 'Coupon cannot be applied' })
  }
  const discount = couponResult.discount
  const total = basePrice - discount
  slot.booked += playerCount

  const booking = {
    id: 'CB-' + uid(''),
    matchId: match.id,
    matchName: match.title,
    format: match.format,
    matchImage: match.image,
    userId: req.user.id,
    userName: req.user.name || 'Player',
    slotId,
    slotTime: slot.time,
    players: playerCount,
    paymentMethod: paymentMethod || 'gpay',
    payerName: payerName || req.user.name || 'Player',
    phone: phone || '',
    upiId: upiId || null,
    cardLast4: cardNumber ? String(cardNumber).slice(-4) : null,
    cardExpiry: cardExpiry || null,
    couponCode: couponResult.coupon ? couponResult.coupon.code : null,
    discount,
    total,
    basePrice,
    date: usedDate,
    bookingDate: new Date().toISOString(),
    status: 'confirmed',
    venue: match.venue,
    city: match.city,
  }

  if (!db.cricketBookings) db.cricketBookings = []
  db.cricketBookings.push(booking)

  if (match.spotsLeft > 0) match.spotsLeft = Math.max(0, match.spotsLeft - playerCount)

  const reminder = {
    id: 'REM-' + uid(''),
    userId: req.user.id,
    type: 'bookingConfirmation',
    title: 'Cricket Booking Confirmed!',
    message: `Your slot for ${match.title} on ${usedDate} at ${slot.time} is confirmed! See you at ${match.venue}!`,
    matchId: match.id,
    read: false,
    createdAt: Date.now(),
  }
  if (!db.reminders) db.reminders = []
  db.reminders.push(reminder)

  save(db)
  res.json(booking)
})

router.post('/:id/cancel/:bookingId', auth, (req, res) => {
  const db = load()
  const booking = (db.cricketBookings || []).find((b) => b.id === req.params.bookingId)
  if (!booking) return res.status(404).json({ message: 'Booking not found' })
  if (booking.status === 'cancelled') return res.status(400).json({ message: 'Already cancelled' })

  const isOwner = booking.userId === req.user.id
  const isAdmin = req.user.role === 'admin'
  if (!isOwner && !isAdmin) return res.status(403).json({ message: 'You can only cancel your own bookings' })

  booking.status = 'cancelled'

  const match = (db.cricketMatches || []).find((m) => m.id === booking.matchId)
  if (match) {
    const slot = match.timeSlots.find((s) => s.id === booking.slotId)
    if (slot) slot.booked = Math.max(0, slot.booked - booking.players)
    match.spotsLeft = Math.min(match.totalSpots, (match.spotsLeft || 0) + booking.players)
  }

  const reminder = {
    id: 'REM-' + uid(''),
    userId: booking.userId,
    type: 'cancellation',
    title: 'Booking Cancelled',
    message: `Your booking for ${booking.matchName} has been cancelled. Refund will be processed in 3-5 business days.`,
    matchId: booking.matchId,
    read: false,
    createdAt: Date.now(),
  }
  if (!db.reminders) db.reminders = []
  db.reminders.push(reminder)

  save(db)
  res.json(booking)
})

module.exports = router