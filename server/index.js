const express = require('express')
const cors = require('cors')

const authRoutes = require('./routes/auth')
const couponRoutes = require('./routes/coupons')
const cricketRoutes = require('./routes/cricket')

const app = express()

app.use(cors())
app.use(express.json())

app.use('/api/auth', authRoutes)
app.use('/api/coupons', couponRoutes)
app.use('/api/cricket', cricketRoutes)

app.get('/api/health', (req, res) => res.json({ ok: true }))

app.use((err, req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Server error' })
})

const PORT = process.env.PORT || 5010
app.listen(PORT, () => {
  console.log(`Truf API running on http://localhost:${PORT}`)
})
