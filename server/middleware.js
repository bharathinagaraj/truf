const jwt = require('jsonwebtoken')

const SECRET = process.env.JWT_SECRET || 'truf-super-secret-key-2026'

function sign(user) {
  return jwt.sign({ id: user.id, role: user.role, name: user.name, phone: user.phone || '' }, SECRET, { expiresIn: '7d' })
}

function extractUser(req) {
  const header = req.headers.authorization || ''
  const token = header.startsWith('Bearer ') ? header.slice(7) : null
  if (!token) return null
  try {
    return jwt.verify(token, SECRET)
  } catch {
    return null
  }
}

function auth(req, res, next) {
  const user = extractUser(req)
  if (!user) return res.status(401).json({ message: 'Not authenticated' })
  req.user = user
  next()
}

function optionalAuth(req, _res, next) {
  const user = extractUser(req)
  if (user) req.user = user
  next()
}

function adminOnly(req, res, next) {
  if (!req.user || req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required' })
  }
  next()
}

module.exports = { sign, auth, optionalAuth, adminOnly, SECRET }