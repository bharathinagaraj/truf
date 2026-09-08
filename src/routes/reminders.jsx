import { createFileRoute, Link } from '@tanstack/react-router'
import { useCricketReminders, useCricketReadReminder } from '@/hooks/queries'
import { useAuthUser } from '@/store/authStore'
import {
  Bell,
  BellRing,
  CheckCircle2,
  CalendarDays,
  Zap,
  ArrowRight,
  CircleDot,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/reminders')({
  component: Reminders,
})

const REMINDER_ICONS = {
  matchReminder: CalendarDays,
  offerReminder: Zap,
  bookingConfirmation: CheckCircle2,
  cancellation: Bell,
}

const REMINDER_COLORS = {
  matchReminder: 'text-green-400',
  offerReminder: 'text-orange-400',
  bookingConfirmation: 'text-emerald-400',
  cancellation: 'text-red-400',
}

function Reminders() {
  const user = useAuthUser()
  const { data: reminders, isLoading } = useCricketReminders()
  const readReminder = useCricketReadReminder()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <Bell className="mb-4 h-12 w-12 text-green-400" />
        <h1 className="font-display text-2xl font-extrabold">Login to see reminders</h1>
        <p className="mt-2 text-zinc-400">Get notifications about your bookings, offers and match updates.</p>
        <Link to="/login" className="mt-6">
          <Button>Login / Register <ArrowRight className="h-4 w-4" /></Button>
        </Link>
      </div>
    )
  }

  const unread = (reminders || []).filter((r) => !r.read)
  const read = (reminders || []).filter((r) => r.read)

  const markRead = (id) => {
    readReminder.mutate(id)
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <h1 className="font-display text-3xl font-extrabold">
          <BellRing className="mr-2 inline h-8 w-8 text-green-400" />
          Reminders
        </h1>
        <p className="mt-1 text-zinc-400">Stay updated on your bookings, offers and match schedules.</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <div key={i} className="h-24 animate-pulse rounded-2xl bg-white/5" />)}
        </div>
      ) : (reminders || []).length === 0 ? (
        <div className="py-16 text-center">
          <Bell className="mx-auto mb-4 h-12 w-12 text-zinc-600" />
          <h2 className="font-display text-xl font-bold">No reminders yet</h2>
          <p className="mt-2 text-zinc-400">Book a cricket match to get started!</p>
          <Link to="/cricket" className="mt-6 inline-block">
            <Button className="bg-green-600 hover:bg-green-700"><CircleDot className="mr-1 h-4 w-4" /> Browse cricket matches</Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {unread.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-green-400">
                New ({unread.length})
              </h2>
              <div className="space-y-3">
                {unread.map((r) => {
                  const Icon = REMINDER_ICONS[r.type] || Bell
                  const color = REMINDER_COLORS[r.type] || 'text-zinc-400'
                  return (
                    <Card key={r.id} className="border-green-500/30 bg-green-500/5">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-green-500/15 ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h3 className="font-bold text-white">{r.title}</h3>
                            <Badge variant="success" className="text-[10px]">NEW</Badge>
                          </div>
                          <p className="mt-1 text-sm text-zinc-300">{r.message}</p>
                          <div className="mt-2 flex items-center gap-3">
                            <span className="text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                            <button
                              onClick={() => markRead(r.id)}
                              className="text-xs text-green-400 hover:text-green-300"
                            >
                              Mark as read
                            </button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}

          {read.length > 0 && (
            <div>
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
                Earlier
              </h2>
              <div className="space-y-3">
                {read.map((r) => {
                  const Icon = REMINDER_ICONS[r.type] || Bell
                  const color = REMINDER_COLORS[r.type] || 'text-zinc-400'
                  return (
                    <Card key={r.id} className="opacity-60">
                      <CardContent className="flex items-start gap-4 p-5">
                        <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/5 ${color}`}>
                          <Icon className="h-5 w-5" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-zinc-300">{r.title}</h3>
                          <p className="mt-1 text-sm text-zinc-400">{r.message}</p>
                          <span className="mt-2 block text-xs text-zinc-500">{new Date(r.createdAt).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
