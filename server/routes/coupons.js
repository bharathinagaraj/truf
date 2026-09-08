const { Router } = require('express')
const { load, save, uid } = require('../db')
const { auth, optionalAuth, adminOnly } = require('../middleware')
const { couponMeta, inferValueType } = require('../couponLogic')

const router = Router()

router.get('/', (req, res) => {
  const db = load()
  res.json((db.coupons || []).map(couponMeta))
})

router.get('/validate', optionalAuth, (req, res) => {
  const db = load()
  const hasBooking = (db.cricketBookings || []).some((b) => req.user && b.userId === req.user.id)
  const isFirstTime = !hasBooking
  const valid = (db.coupons || []).filter((c) => {
    if (!c.active) return false
    if (c.type === 'first' && !isFirstTime) return false
    return true
  })
  res.json(valid.map((c) => ({ ...couponMeta(c), valueType: inferValueType(c) })))
})

router.post('/', auth, adminOnly, (req, res) => {
  const db = load()
  const { code, type, value, valueType, label, minSubtotal, advanceDays, dayFilter, slotHourMin } = req.body
  if (!code || !value) return res.status(400).json({ message: 'code and value required' })
  const coupon = {
    id: 'C' + uid(),
    code: String(code).toUpperCase(),
    type: type || 'regular',
    value: Number(value),
    valueType: valueType === 'flat' ? 'flat' : 'percent',
    label: label || '',
    minSubtotal: minSubtotal ? Number(minSubtotal) : undefined,
    advanceDays: advanceDays ? Number(advanceDays) : undefined,
    dayFilter: Array.isArray(dayFilter) ? dayFilter : undefined,
    slotHourMin: slotHourMin ? Number(slotHourMin) : undefined,
    active: true,
  }
  db.coupons.push(coupon)
  save(db)
  res.status(201).json(couponMeta(coupon))
})

router.route('/:id')
  .patch(auth, adminOnly, (req, res) => {
    const db = load()
    const c = db.coupons.find((x) => x.id === req.params.id)
    if (!c) return res.status(404).json({ message: 'Coupon not found' })
    Object.assign(c, req.body)
    save(db)
    res.json(c)
  })
  .delete(auth, adminOnly, (req, res) => {
    const db = load()
    db.coupons = db.coupons.filter((x) => x.id !== req.params.id)
    save(db)
    res.json({ ok: true })
  })

module.exports = router
