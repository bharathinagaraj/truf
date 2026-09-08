const { Router } = require('express')
const bcrypt = require('bcryptjs')
const { load, save, uid } = require('../db')
const { sign, auth } = require('../middleware')

const router = Router()

function publicUser(u) {
  return { id: u.id, name: u.name, email: u.email, phone: u.phone, role: u.role }
}

router.post('/register', async (req, res, next) => {
  try {
    const { name, email, phone, password } = req.body
    if (!name || !email || !password) {
      return res.status(400).json({ message: 'Name, email and password are required' })
    }
    const db = load()
    if (db.users.find((u) => u.email.toLowerCase() === email.toLowerCase())) {
      return res.status(409).json({ message: 'Email already registered' })
    }
    const user = {
      id: 'U-' + uid(),
      name,
      email,
      phone: phone || '',
      password: bcrypt.hashSync(password, 10),
      role: 'customer',
    }
    db.users.push(user)
    save(db)
    res.status(201).json({ token: sign(user), user: publicUser(user) })
  } catch (e) {
    next(e)
  }
})

router.post('/login', (req, res) => {
  const { email, password } = req.body
  const db = load()
  const user = db.users.find((u) => u.email.toLowerCase() === String(email || '').toLowerCase())
  if (!user || !bcrypt.compareSync(String(password || ''), user.password)) {
    return res.status(401).json({ message: 'Invalid email or password' })
  }
  res.json({ token: sign(user), user: publicUser(user) })
})

router.get('/me', auth, (req, res) => {
  const db = load()
  const user = db.users.find((u) => u.id === req.user.id)
  if (!user) return res.status(404).json({ message: 'User not found' })
  res.json(publicUser(user))
})

module.exports = router
