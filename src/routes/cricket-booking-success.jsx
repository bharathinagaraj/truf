import { createFileRoute, Link } from '@tanstack/react-router'
import {
  CheckCircle2,
  CircleDot,
  MapPin,
  Clock,
  CalendarDays,
  Users,
  Wallet,
  TicketPercent,
  CalendarCheck,
  ArrowRight,
} from 'lucide-react'
import { useCricketBookingResult, clearCricketBookingResult } from '@/store/cricketBookingResultStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'

export const Route = createFileRoute('/cricket-booking-success')({
  component: CricketBookingSuccess,
})

function CricketBookingSuccess() {
  const result = useCricketBookingResult()

  return (
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6">
      {!result ? (
        <div className="py-20 text-center">
          <CircleDot className="mx-auto mb-4 h-12 w-12 text-green-400" />
          <h1 className="font-display text-2xl font-extrabold">No booking found</h1>
          <p className="mt-2 text-zinc-400">Complete a cricket booking to see your confirmation.</p>
          <Link to="/cricket" className="mt-6 inline-block">
            <Button className="bg-green-600 hover:bg-green-700">Browse cricket matches</Button>
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-green-500/30 bg-gradient-to-b from-green-950/30 to-zinc-950">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-8 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-white/20">
              <CheckCircle2 className="h-10 w-10 text-white" />
            </div>
            <h1 className="mt-4 font-display text-3xl font-extrabold text-white sm:text-4xl">
              Booking Successful!
            </h1>
            <p className="mt-2 text-green-100">
              Your cricket slot is confirmed. See you on the ground! 🏏
            </p>
            <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold text-white">
              <CalendarCheck className="h-4 w-4" /> Booking ID: {result.id}
            </div>
          </div>

          <div className="p-6 sm:p-8">
            {/* Match summary */}
            <Card className="overflow-hidden border-white/10 bg-white/5">
              <CardContent className="p-5">
                <div className="flex gap-4">
                  <img src={result.matchImage} alt={result.matchTitle} className="h-20 w-20 shrink-0 rounded-xl object-cover" />
                  <div className="flex-1">
                    <Badge variant="success" className="mb-1.5">{result.matchFormat}</Badge>
                    <h2 className="font-display text-lg font-bold text-white">{result.matchTitle}</h2>
                    <div className="mt-1 flex items-center gap-1.5 text-sm text-zinc-400">
                      <MapPin className="h-4 w-4 text-green-400" /> {result.matchVenue}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-6" />

            {/* Booking details */}
            <div className="grid gap-4 sm:grid-cols-2">
              <DetailBox icon={Clock} label="Time slot" value={result.slotTime} />
              <DetailBox icon={CalendarDays} label="Date" value={new Date(result.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} />
              <DetailBox icon={Users} label="Players" value={`${result.players} player${result.players > 1 ? 's' : ''}`} />
              <DetailBox icon={Wallet} label="Payment" value={result.paymentLabel || result.paymentMethod} />
            </div>

            {/* Price */}
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between text-zinc-300">
                  <span>Entry fee ({result.matchFormat})</span>
                  <span>₹{result.basePrice}</span>
                </div>
                {result.discount > 0 && (
                  <div className="flex items-center justify-between text-emerald-400">
                    <span className="flex items-center gap-1"><TicketPercent className="h-4 w-4" /> Coupon {result.couponCode}</span>
                    <span>- ₹{result.discount}</span>
                  </div>
                )}
                <Separator className="my-2" />
                <div className="flex justify-between text-lg font-bold text-white">
                  <span>Total paid</span>
                  <span className="font-display text-2xl font-extrabold text-green-400">₹{result.total}</span>
                </div>
              </div>
            </div>

            {/* Batter info */}
            <div className="mt-6 rounded-2xl border border-green-500/30 bg-green-500/10 p-5 text-center">
              <p className="text-sm text-green-200">
                🏏 Bring your own gear or use ours — bat, ball & gloves provided free!<br />
                <span className="text-green-300/80">Reach 15 minutes early for warm-up.</span>
              </p>
            </div>

            {/* Actions */}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild size="lg" className="flex-1 bg-green-600 hover:bg-green-700">
                <Link to="/my-bookings">
                  View my bookings <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="flex-1">
                <Link to="/cricket" onClick={() => clearCricketBookingResult()}>
                  Book another match
                </Link>
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function DetailBox({ icon: Icon, label, value }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="flex items-center gap-1.5 text-xs uppercase tracking-wide text-zinc-500">
        <Icon className="h-3.5 w-3.5 text-green-400" /> {label}
      </div>
      <div className="mt-1 font-semibold text-white capitalize">{value}</div>
    </div>
  )
}
