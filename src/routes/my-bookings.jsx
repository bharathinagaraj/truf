import { createFileRoute, Link } from '@tanstack/react-router'
import { useCricketUserBookings, useCricketCancelBooking } from '@/hooks/queries'
import { useAuthUser } from '@/store/authStore'
import { useCricketUi, setConfirmCancelId } from '@/store/cricketUiStore'
import {
  CalendarDays,
  Clock,
  Users,
  MapPin,
  XCircle,
  CheckCircle2,
  Timer,
  Trash2,
  ArrowRight,
  PartyPopper,
  CircleDot,
  TicketPercent,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { toast } from '@/components/Toast'

export const Route = createFileRoute('/my-bookings')({
  component: MyBookings,
})

function MyBookings() {
  const user = useAuthUser()
  const { data: cricketBookings, isLoading } = useCricketUserBookings()
  const cancelCricketBooking = useCricketCancelBooking()
  const { confirmCancelId: confirmId } = useCricketUi()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <CalendarDays className="mb-4 h-12 w-12 text-green-400" />
        <h1 className="font-display text-2xl font-extrabold">Login to see your bookings</h1>
        <p className="mt-2 text-zinc-400">Track, manage and cancel your cricket slot bookings.</p>
        <Link to="/login" className="mt-6">
          <Button className="bg-green-600 hover:bg-green-700">Login / Register <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    )
  }

  const cricketActive = (cricketBookings || []).filter((b) => b.status === 'confirmed')
  const cricketCancelled = (cricketBookings || []).filter((b) => b.status === 'cancelled')

  const doCancelCricket = (matchId, bookingId) => {
    cancelCricketBooking.mutate(
      { matchId, bookingId },
      {
        onSuccess: () => {
          setConfirmCancelId(null)
          toast('Cricket booking cancelled', 'info')
        },
        onError: (e) => toast(e.message, 'error'),
      },
    )
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">My Bookings</h1>
        <p className="mt-1 text-zinc-400">Manage your cricket slots and payments.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="h-40 animate-pulse rounded-2xl bg-white/5" />
          ))}
        </div>
      ) : cricketActive.length === 0 && cricketCancelled.length === 0 ? (
        <div className="py-16 text-center">
          <PartyPopper className="mx-auto mb-4 h-12 w-12 text-green-400" />
          <h2 className="font-display text-xl font-bold">No bookings yet</h2>
          <p className="mt-2 text-zinc-400">Grab a cricket slot and start playing!</p>
          <div className="mt-6 flex justify-center gap-3">
            <Link to="/cricket">
              <Button className="bg-green-600 hover:bg-green-700">
                <CircleDot className="mr-1 h-4 w-4" /> Cricket matches
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Cricket Bookings */}
          {cricketActive.length > 0 && (
            <div>
              <h2 className="mb-4 flex items-center gap-2 font-display text-xl font-bold">
                <CircleDot className="h-5 w-5 text-green-400" /> Cricket Bookings
              </h2>
              <div className="space-y-4">
                {cricketActive.map((b) => (
                  <Card key={b.id} className="overflow-hidden border-green-500/20">
                    <CardContent className="p-0">
                      <div className="flex flex-col sm:flex-row">
                        <div className="h-40 w-full shrink-0 sm:h-auto sm:w-44">
                          <img src={b.matchImage} alt={b.matchName} className="h-40 w-full object-cover sm:h-full" />
                        </div>
                        <div className="flex-1 p-5">
                          <div className="flex flex-wrap items-start justify-between gap-2">
                            <div>
                              <Badge variant="success" className="mb-2">Confirmed</Badge>
                              <h3 className="font-display text-lg font-bold">{b.matchName}</h3>
                            </div>
                            <div className="text-right">
                              <div className="text-xs text-zinc-500">Booking {b.id}</div>
                              <div className="font-display text-xl font-extrabold text-green-300">₹{b.total}</div>
                            </div>
                          </div>
                          <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-zinc-300 sm:grid-cols-4">
                            <Info icon={CalendarDays} text={new Date(b.date || b.bookingDate).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' })} />
                            <Info icon={Clock} text={b.slotTime} />
                            <Info icon={Users} text={`${b.players} player${b.players > 1 ? 's' : ''}`} />
                            <Info icon={MapPin} text={b.venue} />
                          </div>
                          <div className="mt-3 flex items-center gap-2">
                            <Badge variant="success">{b.format}</Badge>
                            {b.paymentMethod === 'cod' && <Badge variant="festival">Cash on Delivery</Badge>}
                            {b.discount > 0 && (
                              <Badge variant="secondary">
                                <TicketPercent className="mr-1 h-3 w-3" /> {b.couponCode}
                              </Badge>
                            )}
                          </div>
                          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-4">
                            <span className="flex items-center gap-1.5 text-xs text-zinc-500">
                              <Timer className="h-3.5 w-3.5" /> Free cancellation up to 24h before
                            </span>
                            {confirmId === b.id ? (
                              <div className="flex items-center gap-2">
                                <Button size="sm" variant="ghost" onClick={() => setConfirmCancelId(null)}>Keep</Button>
                                <Button size="sm" variant="destructive" onClick={() => doCancelCricket(b.matchId, b.id)}>Confirm cancel</Button>
                              </div>
                            ) : (
                              <Button size="sm" variant="outline" onClick={() => setConfirmCancelId(b.id)}>
                                <XCircle className="mr-1 h-4 w-4 text-red-400" /> Cancel booking
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Cancelled */}
          {cricketCancelled.length > 0 && (
            <div className="pt-4">
              <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                <Trash2 className="h-4 w-4" /> Cancelled
              </h3>
              <div className="space-y-3">
                {cricketCancelled.map((b) => (
                  <div key={b.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/[0.02] p-4 opacity-60">
                    <img src={b.matchImage} alt="" className="h-14 w-14 rounded-lg object-cover" />
                    <div className="flex-1">
                      <div className="font-semibold text-zinc-300">{b.matchName}</div>
                      <div className="text-xs text-zinc-500">{b.slotTime} - {b.players} player(s)</div>
                    </div>
                    <Badge variant="destructive">
                      <CheckCircle2 className="mr-1 h-3 w-3" /> Cancelled
                    </Badge>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      <Separator className="my-6" />
    </div>
  )
}

function Info({ icon: Icon, text }) {
  return (
    <span className="flex items-center gap-1.5">
      <Icon className="h-4 w-4 text-green-400" /> {text}
    </span>
  )
}