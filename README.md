# 🏟️ TRUF — Tournament Booking Platform

An impressive full-stack tournament slot-booking platform with **festival / weekend / weekday offers**, **time-slot booking**, **pre-booking**, **coupon codes**, **multi-method payments** and separate **Customer + Admin** dashboards.

Built with the modern TanStack suite + React + Node.js + Tailwind CSS v4 + shadcn-style UI — all with **zero custom hooks in route components** (logic lives in TanStack Query hooks + TanStack Store).

---

## ✨ Features

### 🎁 Offers & Coupons
- **Festival Time** — up to ₹50 OFF (live countdown banner)
- **Weekend Offer** — 20% OFF (Sat/Sun)
- **Weekday Offer** — 15% OFF (Mon–Fri)
- **First-time user** coupon `WELCOME10` (10% off)
- **Regular/loyal** coupon `VIP300` (₹300 off over ₹1500)
- Auto-rotating offer carousel with animated countdown timer

### 📅 Booking
- Browse tournaments with images, prize pools, ratings & seat-filling progress
- **Pick a live time slot** (7 slots per tournament) with real remaining-seat availability
- **Pre-booking** flow, player-count selector, coupon application
- **Book / Cancel anytime** (cancellation is reflected live in availability)

### 💳 Payments — pay your way
- Google Pay · PhonePe · UPI · Net Banking · Debit/Credit Card · **Cash on Delivery**
- Secure checkout with booking summary, live price breakdown & discount

### 👥 Auth (Customer + Admin)
- Register / login with role selection
- Admin dashboard: overview stats, all-bookings management, **coupon CRUD** (create / enable-disable / delete)

### 🧠 Tech stack
| Layer | Tech |
|---|---|
| UI | React 19, Tailwind CSS v4, shadcn-style components (Radix primitives) |
| Data fetching | **TanStack Query** (hooks) |
| Client state | **TanStack Store** (auth + booking stores) |
| Routing | **TanStack Router** (file-based, codegen) |
| Backend | Node.js + Express (REST API) |
| Auth | JWT + bcrypt |

---

## 🚀 Getting Started

### 1. Install dependencies
```bash
npm install
```

### 2. Run the full stack (client + server together)
```bash
npm run dev
```
- Client → http://localhost:5173
- API   → http://localhost:5000

> The Vite dev server proxies `/api` to the backend automatically.

### 3. Build for production
```bash
npm run build
```

---

## 🔑 Demo Accounts

| Role | Email | Password |
|---|---|---|
| Admin | `admin@truf.com` | `admin123` |
| Customer | `player@truf.com` | `player123` |

**Sample coupon codes:** `WELCOME10` (first time), `FESTIVE50`, `WEEKEND20`, `WEEKDAY15`, `VIP300`

---

## 📂 Project Structure

```
├── server/                  # Node.js + Express REST API
│   ├── index.js             # app + routes
│   ├── db.js                # JSON seed store (tournaments, offers, coupons, users)
│   ├── middleware.js        # JWT auth + admin guard
│   └── routes/
│       ├── auth.js          # register / login / me
│       ├── tournaments.js   # list/detail + offers
│       ├── bookings.js      # create / list / cancel / slots
│       └── coupons.js       # validate + admin CRUD
│
└── src/
    ├── main.jsx             # QueryClient + Router providers
    ├── index.css            # Tailwind v4 theme + shadcn tokens
    ├── lib/
    │   ├── api.js           # fetch client (token-aware)
    │   └── utils.js         # cn() helper
    ├── store/               # TanStack Store
    │   ├── authStore.js
    │   └── bookingStore.js
    ├── hooks/queries.js     # TanStack Query hooks + mutations
    ├── components/
    │   ├── ui/              # shadcn-style primitives
    │   └── layout/          # Navbar, Footer
    └── routes/              # TanStack Router file-based routes
        ├── __root.jsx
        ├── index.jsx            # Home (hero + offers + featured)
        ├── login.jsx            # Customer / Admin auth
        ├── tournaments.jsx      # listing
        ├── tournament.$tournamentId.jsx  # detail + slot booking
        ├── checkout.jsx         # payment
        ├── my-bookings.jsx      # bookings + cancel
        └── admin.jsx            # admin dashboard + coupons
```

---

## 🛠️ Scripts

| Script | Purpose |
|---|---|
| `npm run dev` | Run client + server together |
| `npm run dev:client` | Vite dev server only |
| `npm run dev:server` | Backend with auto-reload |
| `npm run build` | Production build |
| `npm run lint` | ESLint |
| `npm run preview` | Preview production build |
