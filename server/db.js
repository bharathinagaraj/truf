const fs = require('fs')
const path = require('path')
const bcrypt = require('bcryptjs')

const DB_PATH = path.join(__dirname, '../data/db.json')

function uid(prefix = '') {
  return prefix + Math.random().toString(36).slice(2, 10).toUpperCase()
}

function buildSeed() {
  const now = Date.now()
  const day = 24 * 60 * 60 * 1000

  const cricketTimeSlots = [
    { id: 'slot-01', time: '06:00 AM', booked: 2, capacity: 8 },
    { id: 'slot-02', time: '07:00 AM', booked: 4, capacity: 8 },
    { id: 'slot-03', time: '08:00 AM', booked: 3, capacity: 8 },
    { id: 'slot-04', time: '09:00 AM', booked: 5, capacity: 8 },
    { id: 'slot-05', time: '10:00 AM', booked: 6, capacity: 8 },
    { id: 'slot-06', time: '11:00 AM', booked: 2, capacity: 8 },
    { id: 'slot-07', time: '12:00 PM', booked: 1, capacity: 8 },
    { id: 'slot-08', time: '01:00 PM', booked: 0, capacity: 8 },
    { id: 'slot-09', time: '02:00 PM', booked: 3, capacity: 8 },
    { id: 'slot-10', time: '03:00 PM', booked: 4, capacity: 8 },
    { id: 'slot-11', time: '04:00 PM', booked: 7, capacity: 8 },
    { id: 'slot-12', time: '05:00 PM', booked: 6, capacity: 8 },
    { id: 'slot-13', time: '06:00 PM', booked: 5, capacity: 8 },
    { id: 'slot-14', time: '07:00 PM', booked: 8, capacity: 8 },
    { id: 'slot-15', time: '08:00 PM', booked: 7, capacity: 8 },
    { id: 'slot-16', time: '09:00 PM', booked: 4, capacity: 8 },
    { id: 'slot-17', time: '10:00 PM', booked: 2, capacity: 8 },
  ]

  const cricketMatches = [
    {
      id: 'CRI-1',
      title: 'Chennai Super Strikes T10',
      format: 'T10',
      image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=1200&q=80',
      teams: [
        { name: 'Chennai Warriors', captain: 'Ravi Kumar', logo: '🏏' },
        { name: 'Marina Dolphins', captain: 'Suresh Raj', logo: '🐬' },
      ],
      venue: 'Truf Cricket Ground, Velachery',
      city: 'Chennai',
      date: now + 3 * day,
      matchTime: '09:00 AM',
      entryFee: 299,
      prizePool: '₹25,000',
      overs: 10,
      status: 'upcoming',
      featured: true,
      spotsLeft: 12,
      totalSpots: 22,
      rating: 4.8,
      duration: '3 hours',
      description: 'Fast-paced T10 action with power hitting and tight bowling. Join now for an adrenaline-packed morning!',
      benefits: [
        'Professional umpires & certified gear',
        'Live score tracking & highlights',
        'Winner takes ₹25,000 cash prize',
        'Pre-book up to 30 days ahead',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-1-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-2',
      title: 'Weekend T20 Bash',
      format: 'T20',
      image: 'https://images.unsplash.com/photo-1540747913346-19e32dc3e97e?w=1200&q=80',
      teams: [
        { name: 'Anna Nagar Kings', captain: 'Vikram Singh', logo: '👑' },
        { name: 'T Nagar Tigers', captain: 'Karthik Dev', logo: '🐯' },
      ],
      venue: 'Green Arena, Anna Nagar',
      city: 'Chennai',
      date: now + 5 * day,
      matchTime: '04:00 PM',
      entryFee: 499,
      prizePool: '₹50,000',
      overs: 20,
      status: 'upcoming',
      featured: true,
      spotsLeft: 8,
      totalSpots: 22,
      rating: 4.9,
      duration: '6 hours',
      description: 'Saturday evening T20 showdown under floodlights. Team strategies, big sixes and intense finishes guaranteed!',
      benefits: [
        'Floodlit stadium with live commentary',
        'DJI camera highlights reel',
        'Winner takes ₹50,000 + trophy',
        'Free team jerseys for all players',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-2-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-3',
      title: 'Corporate Cricket Cup',
      format: 'ODI',
      image: 'https://images.unsplash.com/photo-1675693303492-9a5bc898bf94?w=1200&q=80',
      teams: [
        { name: 'Tech Titans', captain: 'Arun M', logo: '💻' },
        { name: 'Finance Foxes', captain: 'Deepak R', logo: '🦊' },
      ],
      venue: 'Sports Village, OMR',
      city: 'Chennai',
      date: now + 7 * day,
      matchTime: '07:00 AM',
      entryFee: 599,
      prizePool: '₹75,000',
      overs: 50,
      status: 'upcoming',
      featured: false,
      spotsLeft: 16,
      totalSpots: 44,
      rating: 4.6,
      duration: 'Full day',
      description: 'Corporate teams battle it out in a full-day ODI format. Networking meets cricket — play hard, connect harder.',
      benefits: [
        'Full-day corporate cricket experience',
        'Networking lunch included',
        'Winner takes ₹75,000 + corporate shield',
        'Professional photography & drone shots',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-3-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-4',
      title: 'Beach Cricket 6s',
      format: 'T6',
      image: 'https://images.unsplash.com/photo-1750716413444-c8a957fcf35c?w=1200&q=80',
      teams: [
        { name: 'ECR Sharks', captain: 'Prakash V', logo: '🦈' },
        { name: 'Bay Breakers', captain: 'Mohan S', logo: '🌊' },
      ],
      venue: 'ECR Beach Ground',
      city: 'Chennai',
      date: now + 2 * day,
      matchTime: '06:00 AM',
      entryFee: 199,
      prizePool: '₹10,000',
      overs: 6,
      status: 'upcoming',
      featured: false,
      spotsLeft: 4,
      totalSpots: 12,
      rating: 4.7,
      duration: '90 mins',
      description: 'Sunrise beach cricket — just bat, bowl and have fun. Sand between your toes, cricket in your heart.',
      benefits: [
        'Beach-side cricket with sunrise view',
        'Just 6 overs of pure fun',
        'Winner takes ₹10,000 cash',
        'Free breakfast after the match',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-4-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-5',
      title: 'Night Cricket League',
      format: 'T8',
      image: 'https://images.unsplash.com/photo-1611195974226-a6a9be9dd763?w=1200&q=80',
      teams: [
        { name: 'Velachery Vipers', captain: 'Rajesh K', logo: '🐍' },
        { name: 'Porur Panthers', captain: 'Sanjay P', logo: '🐆' },
      ],
      venue: 'Truf Arena, Velachery',
      city: 'Chennai',
      date: now + 4 * day,
      matchTime: '07:00 PM',
      entryFee: 349,
      prizePool: '₹30,000',
      overs: 8,
      status: 'upcoming',
      featured: true,
      spotsLeft: 6,
      totalSpots: 16,
      rating: 4.8,
      duration: '2.5 hours',
      description: 'Under-the-lights T8 league. Cool evening breeze, floodlit action and fierce rivalries — every ball counts!',
      benefits: [
        'Premium floodlit arena',
        'LED scoreboards & live ball tracking',
        'Winner takes ₹30,000 cash',
        'Post-match dinner for all players',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-5-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-6',
      title: 'Sunday Smash Cricket',
      format: 'T5',
      image: 'https://images.unsplash.com/photo-1774168062260-b0a1b63026ba?w=1200&q=80',
      teams: [
        { name: 'Adyar Aces', captain: 'Kiran J', logo: '♠️' },
        { name: 'Nungambakkam Ninjas', captain: 'Aakash T', logo: '🥷' },
      ],
      venue: 'City Sports Complex, T Nagar',
      city: 'Chennai',
      date: now + 6 * day,
      matchTime: '10:00 AM',
      entryFee: 149,
      prizePool: '₹8,000',
      overs: 5,
      status: 'upcoming',
      featured: false,
      spotsLeft: 2,
      totalSpots: 10,
      rating: 4.5,
      duration: '1 hour',
      description: 'Quick-hit Sunday morning cricket. 5 overs of pure fun — perfect for weekend warriors and cricket lovers.',
      benefits: [
        'Quick 5-over cricket for busy people',
        'Beginner friendly — all skill levels',
        'Winner takes ₹8,000 cash',
        'Free cricket bat & ball provided',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-6-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-7',
      title: 'TRUF Premier League T12',
      format: 'T12',
      image: 'https://images.unsplash.com/photo-1771909713995-d793a0c93660?w=1200&q=80',
      teams: [
        { name: 'Chennai Super Kings XI', captain: 'Arjun Patel', logo: '🦁' },
        { name: 'Mumbai Mavericks', captain: 'Kiran Sharma', logo: '🏏' },
      ],
      venue: 'TRUF Premier Ground, OMR',
      city: 'Chennai',
      date: now + 10 * day,
      matchTime: '03:00 PM',
      entryFee: 699,
      prizePool: '₹1,00,000',
      overs: 12,
      status: 'upcoming',
      featured: true,
      spotsLeft: 18,
      totalSpots: 22,
      rating: 4.9,
      duration: '4 hours',
      description: 'The flagship TRUF Premier League! Premium T12 cricket with professional setup, live streaming and massive prize pool.',
      benefits: [
        'Live-streamed on TRUF YouTube',
        'Professional commentary team',
        'Winner takes ₹1,00,000 + trophy',
        'Man of the Match gets ₹5,000 bonus',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-7-' + s.id })),
      bookedSlots: {},
    },
    {
      id: 'CRI-8',
      title: 'Powerplay T4 Blitz',
      format: 'T4',
      image: 'https://images.unsplash.com/photo-1750716413381-1c9a0d94db84?w=1200&q=80',
      teams: [
        { name: 'Guindy Gladiators', captain: 'Mohammed Ali', logo: '⚔️' },
        { name: 'Chetpet Chargers', captain: 'Venkat Reddy', logo: '⚡' },
      ],
      venue: 'TRUF Blitz Arena, Guindy',
      city: 'Chennai',
      date: now + 1 * day,
      matchTime: '05:30 PM',
      entryFee: 99,
      prizePool: '₹5,000',
      overs: 4,
      status: 'upcoming',
      featured: false,
      spotsLeft: 3,
      totalSpots: 8,
      rating: 4.4,
      duration: '45 mins',
      description: 'Ultra-short T4 powerplay blitz! Every ball is a boundary attempt — 4 overs of absolute mayhem.',
      benefits: [
        'Quickest cricket format — just 45 mins',
        'Perfect after work cricket fix',
        'Winner takes ₹5,000 cash',
        'No experience needed — just vibes',
      ],
      timeSlots: cricketTimeSlots.map((s) => ({ ...s, id: 'CRI-8-' + s.id })),
      bookedSlots: {},
    },
  ]

  const coupons = [
    {
      id: 'C1',
      code: 'WELCOME10',
      type: 'first',
      value: 10,
      valueType: 'percent',
      label: 'First time users get 10% off',
      active: true,
    },
    {
      id: 'C2',
      code: 'FESTIVE50',
      type: 'festival',
      value: 50,
      valueType: 'flat',
      label: 'Festival Special — flat ₹50 off on cricket bookings',
      active: true,
    },
    {
      id: 'C3',
      code: 'WEEKEND20',
      type: 'weekend',
      value: 20,
      valueType: 'percent',
      label: 'Weekend offer — 20% off Saturday & Sunday slots',
      dayFilter: ['Sat', 'Sun'],
      active: true,
    },
    {
      id: 'C4',
      code: 'WEEKDAY15',
      type: 'weekday',
      value: 15,
      valueType: 'percent',
      label: 'Weekday offer — 15% off Mon-Fri mornings',
      dayFilter: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      active: true,
    },
    {
      id: 'C5',
      code: 'VIP300',
      type: 'regular',
      value: 300,
      valueType: 'flat',
      label: 'Loyal customer — ₹300 off (over ₹1500)',
      minSubtotal: 1500,
      active: true,
    },
    {
      id: 'C6',
      code: 'CRICKET25',
      type: 'first',
      value: 25,
      valueType: 'percent',
      label: 'Cricket debut — 25% off your first cricket booking',
      active: true,
    },
    {
      id: 'C7',
      code: 'NIGHTOWL',
      type: 'weekday',
      value: 20,
      valueType: 'percent',
      label: 'Night owl special — 20% off evening slots (7PM-10PM)',
      slotHourMin: 19,
      active: true,
    },
    {
      id: 'C8',
      code: 'PREBOOK30',
      type: 'regular',
      value: 30,
      valueType: 'percent',
      label: 'Pre-book champion — 30% off when you book 7+ days early',
      advanceDays: 7,
      active: true,
    },
  ]

  const offers = [
    {
      id: 'O1',
      type: 'festival',
      title: 'Festival Cricket Mania',
      subtitle: 'Celebrate with up to ₹50 OFF on every cricket tournament booking',
      badge: 'HURRY',
      discount: 50,
      gradient: 'from-orange-500 via-pink-500 to-rose-500',
      active: true,
    },
    {
      id: 'O2',
      type: 'weekend',
      title: 'Weekend T20 Offer',
      subtitle: 'Grab 20% OFF on Saturday & Sunday cricket slots',
      badge: 'SAT-SUN',
      discount: 20,
      gradient: 'from-cyan-500 via-blue-500 to-indigo-500',
      active: true,
    },
    {
      id: 'O3',
      type: 'weekday',
      title: 'Weekday Cricket Deal',
      subtitle: 'Skip the crowd — 15% OFF on weekday morning cricket sessions',
      badge: 'MON-FRI',
      discount: 15,
      gradient: 'from-emerald-500 via-teal-500 to-green-500',
      active: true,
    },
    {
      id: 'O4',
      type: 'prebooking',
      title: 'Early Bird Cricket',
      subtitle: 'Book 7+ days early and save 30% on entry fee',
      badge: 'PRE-BOOK',
      discount: 30,
      gradient: 'from-violet-500 via-purple-500 to-fuchsia-500',
      active: true,
    },
  ]

  const users = [
    {
      id: 'U-ADMIN',
      name: 'Admin',
      email: 'admin@truf.com',
      password: bcrypt.hashSync('admin123', 10),
      role: 'admin',
    },
    {
      id: 'U-DEMO',
      name: 'Demo Player',
      email: 'player@truf.com',
      password: bcrypt.hashSync('player123', 10),
      role: 'customer',
      phone: '9876543210',
    },
  ]

  const cricketBookings = []

  const reminders = [
    {
      id: 'REM-1',
      userId: 'U-DEMO',
      type: 'matchReminder',
      title: 'Match Tomorrow!',
      message: 'Chennai Super Strikes T10 starts at 09:00 AM. Don\'t forget your gear!',
      matchId: 'CRI-1',
      read: false,
      createdAt: now - 1 * day,
    },
    {
      id: 'REM-2',
      userId: 'U-DEMO',
      type: 'offerReminder',
      title: 'Festival Offer Ending Soon!',
      message: 'Use code FESTIVE50 and save ₹50 on your next cricket booking. Offer ends in 2 days!',
      read: false,
      createdAt: now - 2 * day,
    },
    {
      id: 'REM-3',
      userId: 'U-DEMO',
      type: 'bookingConfirmation',
      title: 'Booking Confirmed!',
      message: 'Your slot for Night Cricket League is confirmed. See you at Truf Arena, Velachery!',
      matchId: 'CRI-5',
      read: true,
      createdAt: now - 3 * day,
    },
  ]

  return { users, coupons, offers, cricketMatches, cricketBookings, reminders }
}

const COUPON_RULES = {
  WELCOME10: { valueType: 'percent' },
  FESTIVE50: { valueType: 'flat' },
  WEEKEND20: { valueType: 'percent', dayFilter: ['Sat', 'Sun'] },
  WEEKDAY15: { valueType: 'percent', dayFilter: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'] },
  VIP300: { valueType: 'flat', minSubtotal: 1500 },
  CRICKET25: { valueType: 'percent' },
  NIGHTOWL: { valueType: 'percent', slotHourMin: 19 },
  PREBOOK30: { valueType: 'percent', advanceDays: 7 },
}

function normalize(db) {
  if (!db) db = {}
  db.users = db.users || []
  db.coupons = db.coupons || []
  db.offers = db.offers || []
  db.cricketMatches = db.cricketMatches || []
  db.cricketBookings = db.cricketBookings || []
  db.reminders = db.reminders || []
  let changed = false
  db.coupons.forEach((c) => {
    const rules = COUPON_RULES[String(c.code || '').toUpperCase()] || {}
    let patch = {}
    if (!c.valueType) patch.valueType = rules.valueType || 'percent'
    if (rules.minSubtotal && c.minSubtotal === undefined) patch.minSubtotal = rules.minSubtotal
    if (rules.dayFilter && !c.dayFilter) patch.dayFilter = rules.dayFilter
    if (rules.slotHourMin && !c.slotHourMin) patch.slotHourMin = rules.slotHourMin
    if (rules.advanceDays && !c.advanceDays) patch.advanceDays = rules.advanceDays
    if (Object.keys(patch).length) {
      Object.assign(c, patch)
      changed = true
    }
  })
  db.cricketMatches.forEach((m) => {
    let mChanged = false
    if (!m.timeSlots) {
      m.timeSlots = []
      mChanged = true
    }
    if (m.bookedSlots === undefined) {
      m.bookedSlots = {}
      mChanged = true
    }
    if (m.spotsLeft === undefined && m.totalSpots !== undefined) {
      m.spotsLeft = m.totalSpots
      mChanged = true
    }
    if (mChanged) changed = true
  })
  return { db, changed }
}

function load() {
  if (!fs.existsSync(DB_PATH)) {
    const db = buildSeed()
    save(db)
    return db
  }
  try {
    const raw = JSON.parse(fs.readFileSync(DB_PATH, 'utf8'))
    const { db, changed } = normalize(raw)
    if (changed) save(db)
    return db
  } catch {
    const db = buildSeed()
    save(db)
    return db
  }
}

function save(db) {
  fs.mkdirSync(path.dirname(DB_PATH), { recursive: true })
  fs.writeFileSync(DB_PATH, JSON.stringify(db, null, 2))
}

module.exports = { load, save, uid }
