import { createFileRoute, Link } from '@tanstack/react-router'
import { MapPin, Clock, Users, Trophy, Zap, CalendarDays, Star, ArrowRight, CircleDot, Filter, SlidersHorizontal } from 'lucide-react'
import { useCricketMatches, useCricketFeatured } from '@/hooks/queries'
import { useCricketListFormat, setCricketListFormat } from '@/store/cricketListStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'

export const Route = createFileRoute('/cricket/')({
  component: Cricket,
})

const FORMATS = ['All', 'T4', 'T5', 'T6', 'T8', 'T10', 'T12', 'T20', 'ODI']

function CricketMatchCard({ match }) {
  const filled = match.totalSpots - match.spotsLeft
  const full = Math.min(100, Math.round((filled / match.totalSpots) * 100))

  return (
    <Card className="group overflow-hidden transition hover:-translate-y-1 hover:shadow-[0_0_50px_-10px_rgba(34,197,94,0.35)]">
      <div className="relative h-48 overflow-hidden">
        <img
          src={match.image}
          alt={match.title}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-110"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-zinc-950/30 to-transparent" />
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
          <span className="flex items-center gap-1">
            <CalendarDays className="h-4 w-4 text-green-400" />
            {new Date(match.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-4 w-4 text-green-400" /> {match.matchTime}
          </span>
        </div>
        <div className="flex items-center gap-4 text-sm text-zinc-400">
          <span>{match.overs} overs</span>
          <span className="font-semibold text-green-300">₹{match.entryFee}/player</span>
        </div>
        <div>
          <div className="mb-1 flex justify-between text-xs text-zinc-400">
            <span className="flex items-center gap-1">
              <Users className="h-3 w-3" /> {match.spotsLeft} spots left
            </span>
            <span>{filled}/{match.totalSpots} filled</span>
          </div>
          <Progress value={full} />
        </div>
        <Link to={`/cricket/$matchId`} params={{ matchId: match.id }} className="block">
          <Button className="w-full bg-green-600 hover:bg-green-700">
            Book slot <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

function Cricket() {
  const { data: featured } = useCricketFeatured()
  const format = useCricketListFormat()
  const { data: matches, isLoading } = useCricketMatches({ format })

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      {/* Hero */}
      <section className="relative mb-12 overflow-hidden rounded-3xl bg-gradient-to-br from-green-900/50 via-emerald-950/40 to-zinc-950 p-8 sm:p-12">
        <div className="grid-bg absolute inset-0 opacity-20" />
        <div className="pointer-events-none absolute -right-20 -top-20 h-72 w-72 rounded-full bg-green-500/10 blur-3xl" />
        <div className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10">
          <Badge variant="success" className="mb-3">
            <CircleDot className="h-3 w-3" /> TRUF Cricket
          </Badge>
          <h1 className="font-display text-3xl font-extrabold sm:text-5xl">
            Cricket Tournaments
          </h1>
          <p className="mt-3 max-w-xl text-lg text-zinc-400">
            From T4 powerplay blitz to full-day ODIs — pick your format, book 24/7, grab festive offers and own the crease.
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
              <Zap className="h-4 w-4" /> 24/7 Booking Available
            </div>
            <div className="flex items-center gap-2 rounded-full border border-green-500/30 bg-green-500/10 px-4 py-1.5 text-sm text-green-300">
              <Trophy className="h-4 w-4" /> Up to ₹1,00,000 Prize Pool
            </div>
          </div>
        </div>
      </section>

      {/* Featured */}
      {featured && featured.filter((m) => format === 'All' || m.format === format).length > 0 && format === 'All' && (
        <section className="mb-12">
          <div className="mb-6 flex items-end justify-between">
            <div>
              <h2 className="font-display text-2xl font-extrabold">
                <Trophy className="mr-2 inline h-6 w-6 text-green-400" />
                Featured Matches
              </h2>
              <p className="text-zinc-400">Top picks players are excited about</p>
            </div>
          </div>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.filter((m) => format === 'All' || m.format === format).map((m) => (
              <CricketMatchCard key={m.id} match={m} />
            ))}
          </div>
        </section>
      )}

      {/* All Matches */}
      <section>
        <div className="mb-4 flex flex-wrap items-end justify-between gap-4">
          <div>
            <h2 className="font-display text-2xl font-extrabold">All Cricket Matches</h2>
            <p className="text-zinc-400">Browse every upcoming game by format</p>
          </div>
        </div>

        {/* Format filter */}
        <div className="mb-6 flex flex-wrap items-center gap-2">
          <span className="mr-1 flex items-center gap-1.5 text-sm font-medium text-zinc-400">
            <SlidersHorizontal className="h-4 w-4 text-green-400" /> Format
          </span>
          {FORMATS.map((f) => (
            <button
              key={f}
              onClick={() => setCricketListFormat(f)}
              className={`rounded-full border px-3.5 py-1.5 text-sm font-semibold transition ${
                format === f
                  ? 'border-green-500 bg-green-500/15 text-green-200 shadow-lg shadow-green-500/20'
                  : 'border-white/15 bg-white/[0.03] text-zinc-300 hover:border-green-500/40 hover:text-white'
              }`}
            >
              {f === 'All' ? (
                <span className="flex items-center gap-1"><Filter className="h-3.5 w-3.5" /> All</span>
              ) : (
                f
              )}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="h-80 animate-pulse rounded-2xl bg-white/5" />
            ))}
          </div>
        ) : matches && matches.length === 0 ? (
          <div className="py-20 text-center">
            <Filter className="mx-auto mb-3 h-10 w-10 text-green-500/50" />
            <p className="text-lg font-semibold text-zinc-300">No {format !== 'All' ? format + ' ' : ''}matches available</p>
            <p className="mt-1 text-zinc-500">Try a different format or check back soon.</p>
            {format !== 'All' && (
              <button onClick={() => setCricketListFormat('All')} className="mt-4 rounded-full border border-green-500/40 bg-green-500/10 px-4 py-1.5 text-sm font-semibold text-green-300 hover:bg-green-500/20">
                Show all matches
              </button>
            )}
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {(matches || []).map((m) => (
              <CricketMatchCard key={m.id} match={m} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
