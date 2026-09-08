import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  MapPin,
  Clock,
  Star,
  Users,
  CalendarDays,
  ShieldCheck,
  Tag,
  ArrowRight,
  Timer,
  CheckCircle2,
  Lock,
  Trophy,
  Zap,
  CircleDot,
  CalendarRange,
  ChevronLeft,
  ChevronRight,
  Flame,
  Sparkles,
  Loader2,
  X,
} from 'lucide-react'
import { useCricketMatch, useCricketSlots, useCricketPrice, useValidateCoupons, useCricketRecommend } from '@/hooks/queries'
import { useAuthUser } from '@/store/authStore'
import {
  startCricketBooking,
  setCricketSlot,
  setCricketCoupon,
  setCricketCouponText,
  setCricketDate,
  setCricketPlayers,
  useCricketBooking,
} from '@/store/cricketBookingStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/Toast'

export const Route = createFileRoute('/cricket/$matchId')({
  component: CricketMatchDetail,
})

const MAX_PLAYERS = 6

function CricketMatchDetail() {
  const { matchId } = Route.useParams()
  const navigate = useNavigate()
  const user = useAuthUser()
  const booking = useCricketBooking()
  const { data: match, isLoading } = useCricketMatch(matchId)
  const { data: slots } = useCricketSlots(matchId)
  const { data: validCoupons } = useValidateCoupons()
  const recommend = useCricketRecommend()

  const dates = getDateRange(new Date())

  const priceParams =
    user && booking.slotId
      ? {
          date: booking.date,
          slotId: booking.slotId,
          players: booking.players,
          couponCode: booking.coupon?.code || '',
        }
      : null
  const { data: price, isFetching: priceFetching } = useCricketPrice(matchId, priceParams)

  if (isLoading || !match) {
    return <div className="mx-auto max-w-6xl px-4 py-16 text-center text-zinc-500">Loading...</div>
  }

  const players = booking.players || 1
  const basePrice = match.entryFee * players
  const total = price?.total ?? basePrice
  const couponApplied = !!booking.coupon && price?.couponEligible
  const couponRejected = !!booking.coupon && price && !price.couponEligible
  const filled = match.totalSpots - match.spotsLeft
  const full = Math.min(100, Math.round((filled / match.totalSpots) * 100))

  const selectedSlot = slots?.find((s) => s.id === booking.slotId)
  const slotRemaining = selectedSlot ? selectedSlot.capacity - selectedSlot.booked : 0
  const maxForSlot = Math.min(MAX_PLAYERS, slotRemaining) || MAX_PLAYERS

  const selectSlot = (s) => {
    setCricketSlot(s.id, s.time)
    if (players > Math.min(MAX_PLAYERS, s.capacity - s.booked)) {
      setCricketPlayers(Math.min(MAX_PLAYERS, s.capacity - s.booked))
    }
  }

  const changePlayers = (delta) => {
    setCricketPlayers(Math.min(maxForSlot, Math.max(1, players + delta)))
  }

  const shiftDate = (delta) => {
    const idx = dates.findIndex((d) => d.value === booking.date)
    const next = dates[Math.min(dates.length - 1, Math.max(0, idx + delta))]
    setCricketDate(next.value, delta)
  }

  const applyCoupon = () => {
    const found = (validCoupons || []).find((c) => c.code.toLowerCase() === booking.couponText.toLowerCase())
    if (!found) {
      toast('Invalid coupon code', 'error')
      setCricketCoupon(null)
      setCricketCouponText('')
      return
    }
    setCricketCoupon(found)
    toast(`Coupon ${found.code} applied — checking eligibility`, 'success')
  }

  const pickChip = (c) => {
    setCricketCouponText(c.code)
    setCricketCoupon(c)
  }

  const askAi = () => {
    if (!user) return toast('Login to get AI slot picks', 'info')
    recommend.mutate(
      {
        matchId,
        date: booking.date,
        preferences: ['evening', 'leastcrowd'],
      },
      {
        onError: (e) => toast(e.message, 'error'),
      },
    )
  }

  const proceed = () => {
    if (!user) {
      toast('Please login to book your slot', 'info')
      navigate({ to: '/login' })
      return
    }
    if (!booking.slotId) return toast('Pick a time slot first', 'warn')
    if (players > maxForSlot) return toast(`Only ${maxForSlot} spots left in this slot`, 'warn')
    if (couponRejected) return toast(price?.reason || 'Coupon cannot be applied', 'warn')
    startCricketBooking(match, booking.slotId, selectedSlot?.time || booking.slotTime || null, players)
    navigate({ to: '/cricket-checkout' })
  }

  const aiPick = recommend.data?.best

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link to="/cricket" className="mb-5 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-green-400">
        <CircleDot className="h-4 w-4" /> Back to cricket matches
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_420px]">
        {/* LEFT */}
        <div>
          <div className="relative h-64 overflow-hidden rounded-2xl sm:h-80">
            <img src={match.image} alt={match.title} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/20 to-transparent" />
            <div className="absolute bottom-4 left-4">
              <Badge variant="success">{match.format}</Badge>
              <h1 className="mt-2 font-display text-2xl font-extrabold sm:text-3xl">{match.title}</h1>
            </div>
            <div className="absolute right-4 top-4 rounded-lg bg-black/60 px-3 py-1.5 text-sm font-bold text-green-300 backdrop-blur">
              {match.prizePool}
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
            <InfoTile icon={MapPin} label="Venue" value={`${match.venue}, ${match.city}`} />
            <InfoTile icon={Clock} label="Duration" value={match.duration} />
            <InfoTile icon={Star} label="Rating" value={`${match.rating} / 5`} />
            <InfoTile icon={Users} label="Capacity" value={`${filled}/${match.totalSpots}`} />
          </div>

          {/* Teams */}
          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Teams</h3>
              <div className="flex items-center justify-around gap-4">
                {match.teams.map((team) => (
                  <div key={team.name} className="text-center">
                    <div className="text-5xl">{team.logo}</div>
                    <div className="mt-2 font-display text-lg font-bold text-white">{team.name}</div>
                    <div className="text-sm text-zinc-400">Captain: {team.captain}</div>
                  </div>
                ))}
                <div className="font-display text-3xl font-extrabold text-green-400">VS</div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6">
            <CardContent className="p-6">
              <h3 className="mb-2 font-display text-lg font-bold">About this match</h3>
              <p className="text-zinc-300">{match.description}</p>
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-sm text-zinc-400">
                  <span>Spots filling</span>
                  <span>{filled}/{match.totalSpots}</span>
                </div>
                <Progress value={full} />
              </div>
              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {(match.benefits || []).map((b, i) => (
                  <Benefit
                    key={i}
                    icon={i === 0 ? ShieldCheck : i === 1 ? Timer : i === 2 ? Trophy : CalendarDays}
                    text={b}
                  />
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* RIGHT — BOOKING */}
        <div className="space-y-5">
          <Card className="sticky top-20 border-2 border-green-500/40">
            <CardContent className="p-6">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="font-display text-lg font-bold">Book your slot</h3>
                <Badge variant="default">{match.prizePool} prize</Badge>
              </div>

              {/* 24/7 Badge */}
              <div className="mb-4 flex items-center gap-2 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-2">
                <Zap className="h-4 w-4 text-green-400" />
                <span className="text-sm font-medium text-green-300">24/7 Available — Book any time!</span>
              </div>

              {/* DATE picker (pre-book up to 30 days) */}
              <label className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-zinc-300">
                <CalendarRange className="h-4 w-4 text-green-400" /> Choose your match day
              </label>
              <div className="mb-5 flex items-center gap-1">
                <button
                  onClick={() => shiftDate(-1)}
                  className="h-9 w-9 shrink-0 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                  aria-label="Previous day"
                >
                  <ChevronLeft className="mx-auto h-4 w-4" />
                </button>
                <div className="scroll-smooth flex flex-1 gap-1 overflow-x-auto pb-1" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {dates.map((d) => {
                    const isSel = booking.date === d.value
                    const isToday = d.value === toDateString(new Date())
                    return (
                      <button
                        key={d.value}
                        onClick={() => setCricketDate(d.value)}
                        className={`flex min-w-[52px] flex-col items-center rounded-xl border px-1 py-2 transition ${
                          isSel
                            ? 'scale-105 border-green-500 bg-green-500/15 text-green-200 shadow-lg shadow-green-500/20'
                            : 'border-white/10 bg-white/[0.03] hover:border-green-500/40'
                        } ${booking.dateDir === 1 && isSel ? 'animate-slide-in-right' : booking.dateDir === -1 && isSel ? 'animate-slide-in-left' : ''}`}
                      >
                        <span className={`text-[9px] uppercase ${isSel ? 'text-green-300' : 'text-zinc-500'}`}>
                          {d.weekday}
                        </span>
                        <span className="text-sm font-bold">{d.day}</span>
                        <span className={`text-[9px] uppercase ${isSel ? 'text-green-300' : 'text-zinc-500'}`}>
                          {d.month}
                        </span>
                        {isToday && !isSel && (
                          <span className="mt-0.5 text-[9px] font-semibold text-green-400">TODAY</span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <button
                  onClick={() => shiftDate(1)}
                  className="h-9 w-9 shrink-0 rounded-lg border border-white/15 bg-white/5 hover:bg-white/10"
                  aria-label="Next day"
                >
                  <ChevronRight className="mx-auto h-4 w-4" />
                </button>
              </div>
              <p className="-mt-3 mb-5 flex items-center gap-1 text-[11px] text-zinc-500">
                <Flame className="h-3 w-3 text-orange-400" /> Pre-book up to 30 days ahead — lock your slot now
              </p>

              {/* Players */}
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Players
                {selectedSlot && <span className="ml-1 text-xs text-zinc-500">(max {maxForSlot} for this slot)</span>}
              </label>
              <div className="mb-5 flex items-center gap-3">
                <button
                  onClick={() => changePlayers(-1)}
                  className="h-9 w-9 rounded-lg border border-white/15 bg-white/5 font-bold hover:bg-white/10"
                >
                  -
                </button>
                <span className="w-8 text-center text-xl font-bold">{players}</span>
                <button
                  onClick={() => changePlayers(1)}
                  disabled={players >= maxForSlot}
                  className="h-9 w-9 rounded-lg border border-white/15 bg-white/5 font-bold hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  +
                </button>
                {selectedSlot && players >= maxForSlot && (
                  <span className="text-xs font-medium text-amber-400">Max for this slot</span>
                )}
              </div>

              {/* AI slot picker */}
              <div className="mb-5">
                {!aiPick ? (
                  <button
                    onClick={askAi}
                    disabled={recommend.isPending}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-4 py-2.5 text-sm font-semibold text-violet-300 transition hover:bg-violet-500/20 disabled:opacity-60"
                  >
                    {recommend.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    {recommend.isPending ? 'AI thinking…' : user ? 'AI pick my best slot' : 'Login to get AI slot picks'}
                  </button>
                ) : (
                  <div className="rounded-xl border border-violet-500/40 bg-violet-500/10 p-4">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 text-sm font-bold text-violet-200">
                        <Sparkles className="h-4 w-4 text-violet-300" /> AI recommends {aiPick.time}
                      </div>
                      <button onClick={() => recommend.reset()} className="rounded-full p-1 text-violet-300/70 hover:bg-white/10" aria-label="Dismiss AI pick">
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                    <p className="mt-1 text-xs text-violet-300/80">{aiPick.reasons?.join(' · ')}</p>
                    <div className="mt-3 flex gap-2">
                      <Button size="sm" className="flex-1 bg-violet-600 hover:bg-violet-700" onClick={() => selectSlot(aiPick)}>
                        Pick {aiPick.time} <ArrowRight className="h-3.5 w-3.5" />
                      </Button>
                      <Button size="sm" variant="outline" onClick={() => recommend.reset()}>
                        Skip
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              {/* Slots */}
              <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                Choose a time slot (24/7)
              </label>
              {!user ? (
                <div className="mb-4 rounded-xl border border-dashed border-green-500/30 bg-green-500/5 p-4 text-center text-sm text-zinc-300">
                  <Lock className="mx-auto mb-1 h-5 w-5 text-green-400" />
                  <p className="font-semibold text-green-300">Login to see live slot availability & book</p>
                  <p className="mt-1 text-xs text-zinc-400">Demo: player@truf.com / player123</p>
                  <Link to="/login" className="mt-3 inline-block">
                    <Button size="sm" className="bg-green-600 hover:bg-green-700">
                      Login / Register <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="mb-5 grid grid-cols-3 gap-2">
                  {(slots || []).map((s) => {
                    const isSel = booking.slotId === s.id
                    const sRemaining = s.capacity - s.booked
                    const sPct = Math.round((s.booked / s.capacity) * 100)
                    const isPick = aiPick?.slotId === s.id
                    return (
                      <button
                        key={s.id}
                        onClick={() => selectSlot(s)}
                        disabled={!s.available}
                        className={`group relative flex flex-col items-center rounded-xl border p-2 transition ${
                          isSel
                            ? 'border-green-500 bg-green-500/15 text-green-200 shadow-lg shadow-green-500/20'
                            : isPick
                              ? 'border-violet-500 bg-violet-500/15 text-violet-200'
                              : s.available
                                ? 'border-white/15 bg-white/5 hover:border-green-500/50'
                                : 'cursor-not-allowed border-white/5 bg-white/[0.02] opacity-40'
                        }`}
                      >
                        {isPick && !isSel && (
                          <span className="absolute -top-2 -right-2 rounded-full bg-violet-500 px-1.5 py-0.5 text-[9px] font-bold text-white">
                            AI
                          </span>
                        )}
                        <span className="text-xs font-bold">{s.time}</span>
                        <span className={`text-[10px] ${isSel ? 'text-green-300' : isPick ? 'text-violet-300' : sRemaining <= 2 ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {s.available ? (
                            sRemaining <= 2 ? (
                              <span className="flex items-center gap-0.5">
                                <Flame className="h-2.5 w-2.5" /> {sRemaining} left
                              </span>
                            ) : (
                              `${sRemaining} left`
                            )
                          ) : (
                            'Full'
                          )}
                        </span>
                        {/* capacity fill bar */}
                        <div className="mt-1.5 h-1 w-full overflow-hidden rounded-full bg-white/10">
                          <div
                            className={`h-full rounded-full ${isSel ? 'bg-green-400' : isPick ? 'bg-violet-400' : sPct > 80 ? 'bg-amber-400' : sPct > 50 ? 'bg-green-500/70' : 'bg-green-500/40'}`}
                            style={{ width: `${sPct}%` }}
                          />
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}

              {/* Coupon */}
              {user && (
                <div className="mb-5">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">
                    <Tag className="mr-1 inline h-3.5 w-3.5" /> Coupon / promo code
                  </label>
                  <div className="flex gap-2">
                    <input
                      value={booking.couponText}
                      onChange={(e) => setCricketCouponText(e.target.value)}
                      placeholder="e.g. CRICKET25"
                      className="h-10 flex-1 rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50"
                    />
                    <Button size="sm" variant="outline" onClick={applyCoupon} disabled={priceFetching && !!booking.coupon}>
                      Apply
                    </Button>
                  </div>

                  {couponApplied && price?.discount > 0 && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-emerald-400">
                      <CheckCircle2 className="h-3.5 w-3.5" /> {price.couponCode} applied — you save ₹{price.discount}
                    </p>
                  )}
                  {couponRejected && (
                    <p className="mt-2 flex items-center gap-1 text-xs font-medium text-amber-400">
                      <X className="h-3.5 w-3.5" /> {price.reason}
                      <button
                        className="ml-1 underline hover:text-white"
                        onClick={() => {
                          setCricketCoupon(null)
                          setCricketCouponText('')
                        }}
                      >
                        Remove
                      </button>
                    </p>
                  )}

                  {(validCoupons || []).length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {validCoupons
                        .filter((c) => c.type === 'first' || c.type === 'regular' || c.type === 'weekend' || c.type === 'weekday' || c.type === 'festival')
                        .slice(0, 5)
                        .map((c) => (
                          <button
                            key={c.code}
                            onClick={() => pickChip(c)}
                            className="rounded-full border border-green-500/40 bg-green-500/10 px-2.5 py-1 text-xs font-semibold text-green-300 hover:bg-green-500/20"
                          >
                            {c.code}
                          </button>
                        ))}
                    </div>
                  )}
                </div>
              )}

              <Separator className="my-4" />

              {/* Price — live from server */}
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>₹{match.entryFee} x {players} player{players > 1 ? 's' : ''}</span>
                  <span>₹{basePrice}</span>
                </div>
                {priceFetching && booking.slotId && (
                  <div className="flex items-center justify-end gap-1 text-xs text-zinc-500">
                    <Loader2 className="h-3 w-3 animate-spin" /> Calculating best price…
                  </div>
                )}
                {!priceFetching && price?.discount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Coupon {price.couponCode}</span>
                    <span>- ₹{price.discount}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold">
                  <span>Total to pay</span>
                  <span className="text-green-300">₹{total}</span>
                </div>
              </div>

              <Button size="lg" className="mt-5 w-full bg-green-600 hover:bg-green-700" onClick={proceed} disabled={couponRejected}>
                {user ? 'Proceed to payment' : 'Login to book'} <ArrowRight className="h-4 w-4" />
              </Button>
              <p className="mt-3 flex items-center justify-center gap-1 text-center text-xs text-zinc-500">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> Free cancellation up to 24h before
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function toDateString(d) {
  return d.toISOString().slice(0, 10)
}

function getDateRange(start) {
  const dates = []
  const base = new Date(start)
  base.setHours(0, 0, 0, 0)
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
  for (let i = 0; i < 30; i++) {
    const d = new Date(base)
    d.setDate(base.getDate() + i)
    dates.push({
      value: toDateString(d),
      weekday: DAYS[d.getDay()],
      day: d.getDate(),
      month: MONTHS[d.getMonth()],
    })
  }
  return dates
}

function InfoTile({ icon: Icon, label, value }) {
  return (
    <div className="card-glass rounded-xl p-3">
      <Icon className="mb-1 h-4 w-4 text-green-400" />
      <div className="text-[11px] uppercase tracking-wide text-zinc-500">{label}</div>
      <div className="text-sm font-semibold text-zinc-200">{value}</div>
    </div>
  )
}

function Benefit({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 text-sm text-zinc-300">
      <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-green-500/15">
        <Icon className="h-4 w-4 text-green-400" />
      </span>
      {text}
    </div>
  )
}