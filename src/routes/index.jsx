import { useEffect } from 'react'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  Trophy,
  ArrowRight,
  Clock,
  MapPin,
  Star,
  Zap,
  CalendarCheck,
  CreditCard,
  Users,
  Sparkles,
  CircleDot,
  ShieldCheck,
  Flame,
  CalendarDays,
} from 'lucide-react'
import { useOffers, useCricketMatches } from '@/hooks/queries'
import { useHome, setOfferCount } from '@/store/homeStore'
import { Countdown } from '@/components/Countdown'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Card, CardContent } from '@/components/ui/card'

export const Route = createFileRoute('/')({
  component: Home,
})

const OFFER_GRADIENT = {
  festival: 'from-orange-500 via-pink-500 to-rose-500',
  weekend: 'from-cyan-500 via-blue-500 to-indigo-500',
  weekday: 'from-emerald-500 via-teal-500 to-green-500',
}

function OfferCarousel({ offers }) {
  const { offerIndex: index, offerCount } = useHome()

  useEffect(() => {
    if (offers && offerCount !== offers.length) setOfferCount(offers.length)
  }, [offers, offerCount])

  const today = new Date()

  return (
    <div className="relative h-[340px] sm:h-[300px]">
      {offers.map((o, i) => {
        const target =
          o.type === 'weekend' ? today.getTime() + 7 * 24 * 3600 * 1000 : today.getTime() + 3 * 24 * 3600 * 1000
        return (
          <div
            key={o.id}
            className={`absolute inset-0 overflow-hidden rounded-3xl bg-gradient-to-br ${OFFER_GRADIENT[o.type]} p-[1px] transition-all duration-700 ${i === index ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none'}`}
          >
            <div className="relative flex h-full flex-col justify-between overflow-hidden rounded-3xl bg-zinc-950/60 p-8 sm:flex-row sm:items-center">
              <div className="grid-bg absolute inset-0 opacity-40" />
              <div className="relative z-10 max-w-md">
                <Badge variant={o.type} className="mb-3">
                  {o.badge}
                </Badge>
                <h3 className="font-display text-3xl font-extrabold sm:text-4xl">{o.title}</h3>
                <p className="mt-2 text-zinc-200">{o.subtitle}</p>
                <Link to="/cricket" className="mt-5 inline-block">
                  <Button variant="brand" className="bg-white/20 backdrop-blur shadow-none hover:bg-white/30">
                    Book now <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
              <div className="relative z-10 mt-8 sm:mt-0">
                <p className="mb-2 text-center text-xs uppercase tracking-widest text-white/80">Offer ends in</p>
                <Countdown target={target} />
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

function Home() {
  const { data: offers } = useOffers()
  const { data: cricketMatches, isLoading } = useCricketMatches({})

  const featured = (cricketMatches || []).filter((m) => m.featured)
  const list = featured.length ? featured.slice(0, 6) : cricketMatches

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="grid-bg absolute inset-0" />
        <div className="pointer-events-none absolute -top-40 left-1/2 h-96 w-96 -translate-x-1/2 rounded-full bg-green-500/20 blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-0 h-72 w-72 rounded-full bg-emerald-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 pt-16 pb-12 text-center sm:px-6 sm:pt-24">
          <div className="mx-auto inline-flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm font-medium text-green-300">
            <Sparkles className="h-4 w-4" />
            Play · Compete · Win big
          </div>
          <h1 className="mt-6 font-display text-4xl font-extrabold leading-tight sm:text-6xl">
            Book Cricket Slots.
            <br />
            <span className="text-gradient">Own The Crease.</span>
          </h1>
          <p className="mx-auto mt-5 max-w-xl text-lg text-zinc-400">
            Pre-book your cricket turf slot, pick a time, grab festival offers and pay the way you want.
            Your pitch time, your rules.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link to="/cricket">
              <Button size="lg" className="bg-green-600 hover:bg-green-700">
                <CircleDot className="h-5 w-5" /> Explore cricket matches
              </Button>
            </Link>
            <Link to="/cricket">
              <Button size="lg" variant="outline">
                See live offers <Zap className="h-4 w-4 text-green-400" />
              </Button>
            </Link>
          </div>

          {/* stats */}
          <div className="mx-auto mt-14 grid max-w-3xl grid-cols-2 gap-4 sm:grid-cols-4">
            {[
              { icon: Trophy, value: '8', label: 'Formats' },
              { icon: Users, value: '500+', label: 'Players' },
              { icon: CalendarCheck, value: '24/7', label: 'Pre-booking' },
              { icon: Zap, value: '50%', label: 'Festive OFF' },
            ].map((s, i) => (
              <div key={i} className="card-glass rounded-2xl p-4">
                <s.icon className="mx-auto mb-2 h-6 w-6 text-green-400" />
                <div className="font-display text-2xl font-extrabold">{s.value}</div>
                <div className="text-sm text-zinc-400">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* OFFERS */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="mb-6 flex items-end justify-between">
          <div>
            <h2 className="font-display text-2xl font-extrabold">🔥 Live Offers</h2>
            <p className="text-zinc-400">Festival · Weekend · Weekday — grab before it's gone</p>
          </div>
          <Badge variant="festival" className="hidden sm:inline-flex">
            <Zap className="h-3 w-3" /> Limited time
          </Badge>
        </div>
        <OfferCarousel offers={offers || []} />
      </section>

      {/* HOW IT WORKS */}
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
        <h2 className="mb-8 text-center font-display text-2xl font-extrabold">How it works</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { icon: CircleDot, title: 'Choose a match', desc: 'Pick your format, venue and time slot.' },
            { icon: CalendarCheck, title: 'Pre-book a slot', desc: 'Book up to 30 days ahead & lock your spot.' },
            { icon: CreditCard, title: 'Pay your way', desc: 'GPay, UPI, cards, net banking or COD. Always secure.' },
          ].map((s, i) => (
            <Card key={i} className="text-center border-green-500/20">
              <CardContent className="p-8">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-green-500/30 to-emerald-600/20">
                  <s.icon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-display text-lg font-bold">{i + 1}. {s.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{s.desc}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* FEATURED CRICKET MATCHES */}
      <section className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-extrabold">
              <CircleDot className="mr-2 inline h-6 w-6 text-green-400" />
              Featured Cricket Matches
            </h2>
            <p className="text-zinc-400">Book 24/7 — grab festive offers before they expire</p>
          </div>
          <Link to="/cricket">
            <Button variant="ghost" size="sm" className="text-green-400 hover:text-green-300">
              View all cricket <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(list || []).map((m) => (
              <CricketHomeCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>

      {/* WHY TRUF */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="card-glass rounded-3xl p-8 sm:p-12">
          <h2 className="text-center font-display text-2xl font-extrabold sm:text-3xl">Why players choose TRUF</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              { icon: ShieldCheck, title: 'Verified turf grounds', desc: 'Quality-assured pitches with pro gear, umpires & floodlights.' },
              { icon: Flame, title: 'Most-filling slots', desc: 'Live capacity bars — know exactly which time to book before it fills.' },
              { icon: CalendarDays, title: '30-day pre-booking', desc: 'Plan ahead and lock your favourite slot up to a month early.' },
            ].map((f, i) => (
              <div key={i} className="text-center">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-green-500/15">
                  <f.icon className="h-6 w-6 text-green-400" />
                </div>
                <h3 className="font-display text-lg font-bold">{f.title}</h3>
                <p className="mt-1 text-sm text-zinc-400">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function CricketHomeCard({ match }) {
  const filled = match.totalSpots - match.spotsLeft
  const full = Math.min(100, Math.round((filled / match.totalSpots) * 100))

  return (
    <Card className="group overflow-hidden border-green-500/15 transition hover:-translate-y-1 hover:shadow-[0_0_50px_-10px_rgba(34,197,94,0.35)]">
      <div className="relative h-44 overflow-hidden">
        <img
          src={match.image}
          alt={match.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 to-transparent" />
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between">
          <Badge variant="success">{match.format}</Badge>
          <div className="flex items-center gap-1 text-sm font-semibold text-white">
            <Star className="h-4 w-4 fill-green-400 text-green-400" /> {match.rating}
          </div>
        </div>
        <div className="absolute right-3 top-3 rounded-lg bg-black/60 px-2 py-1 text-sm font-bold text-green-300 backdrop-blur">
          {match.prizePool}
        </div>
        {match.featured && (
          <div className="absolute left-3 top-3">
            <Badge variant="festival">
              <Zap className="h-3 w-3" /> Featured
            </Badge>
          </div>
        )}
      </div>
      <CardContent className="space-y-3 p-5">
        <h3 className="font-display text-lg font-bold leading-snug transition group-hover:text-green-300">
          {match.title}
        </h3>
        <div className="flex items-center gap-1.5 text-sm text-zinc-400">
          <MapPin className="h-4 w-4 text-green-400" /> {match.venue}, {match.city}
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span className="flex items-center gap-1"><Clock className="h-4 w-4 text-green-400" /> {match.duration}</span>
          <span className="font-semibold text-green-300">₹{match.entryFee}/player</span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-400">
            <span>Spots filling fast</span>
            <span>{filled}/{match.totalSpots} booked</span>
          </div>
          <Progress value={full} />
        </div>
        <Link to={`/cricket/$matchId`} params={{ matchId: match.id }} className="block">
          <Button className="w-full bg-green-600 hover:bg-green-700">Book slot <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </CardContent>
    </Card>
  )
}