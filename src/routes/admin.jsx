import { createFileRoute, Link } from '@tanstack/react-router'
import {
  LayoutDashboard,
  CalendarCheck,
  TicketPercent,
  Users,
  TrendingUp,
  IndianRupee,
  Plus,
  Power,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  XCircle,
  Clock,
} from 'lucide-react'
import { useCoupons, useCreateCoupon, useToggleCoupon, useDeleteCoupon, useCricketAdminBookings, useCricketCancelBooking } from '@/hooks/queries'
import { useIsAdmin, useAuthUser } from '@/store/authStore'
import { useAdminUi, setAdminTab, setAdminConfirmCancelId, setCouponDialogOpen, setCouponFormField, resetCouponForm } from '@/store/adminUiStore'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/components/Toast'

export const Route = createFileRoute('/admin')({
  component: Admin,
})

function Admin() {
  const isAdmin = useIsAdmin()
  const user = useAuthUser()
  const { tab } = useAdminUi()

  if (!user) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <ShieldCheck className="mb-4 h-12 w-12 text-brand-400" />
        <h1 className="font-display text-2xl font-extrabold">Admin access required</h1>
        <p className="mt-2 text-zinc-400">Login as admin to manage the platform.</p>
        <Link to="/login" className="mt-6"><Button>Login</Button></Link>
      </div>
    )
  }
  if (!isAdmin) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <XCircle className="mb-4 h-12 w-12 text-red-400" />
        <h1 className="font-display text-2xl font-extrabold">Not authorized</h1>
        <p className="mt-2 text-zinc-400">You need an admin account to view this page.</p>
        <Link to="/" className="mt-6"><Button variant="outline">Back home</Button></Link>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6">
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600">
          <LayoutDashboard className="h-6 w-6 text-black" />
        </div>
        <div>
          <h1 className="font-display text-3xl font-extrabold">Admin Dashboard</h1>
          <p className="text-zinc-400">Manage bookings, offers and coupons.</p>
        </div>
      </div>

      <div className="mb-8 flex flex-wrap gap-2">
        {[
          { id: 'overview', label: 'Overview', icon: TrendingUp },
          { id: 'cricket-bookings', label: 'Cricket Bookings', icon: CalendarCheck },
          { id: 'coupons', label: 'Coupons & Offers', icon: TicketPercent },
        ].map((t) => (
          <Button
            key={t.id}
            size="sm"
            variant={tab === t.id ? 'brand' : 'outline'}
            onClick={() => setAdminTab(t.id)}
          >
            <t.icon className="h-4 w-4" /> {t.label}
          </Button>
        ))}
      </div>

      {tab === 'overview' && <Overview />}
      {tab === 'cricket-bookings' && <CricketBookings />}
      {tab === 'coupons' && <Coupons />}
    </div>
  )
}

function Overview() {
  const { data: bookings } = useCricketAdminBookings()
  const active = (bookings || []).filter((b) => b.status === 'confirmed')
  const revenue = active.reduce((s, b) => s + b.total, 0)
  const players = active.reduce((s, b) => s + b.players, 0)

  const stats = [
    { icon: CalendarCheck, label: 'Total bookings', value: String((bookings || []).length), color: 'text-cyan-400' },
    { icon: Users, label: 'Players', value: String(players), color: 'text-brand-400' },
    { icon: IndianRupee, label: 'Revenue', value: `₹${revenue.toLocaleString()}`, color: 'text-emerald-400' },
    { icon: TrendingUp, label: 'Active', value: String(active.length), color: 'text-purple-400' },
  ]

  const byMethod = {}
  active.forEach((b) => {
    byMethod[b.paymentMethod] = (byMethod[b.paymentMethod] || 0) + 1
  })

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <Card key={s.label}>
            <CardContent className="p-5">
              <s.icon className={`mb-2 h-6 w-6 ${s.color}`} />
              <div className="font-display text-3xl font-extrabold">{s.value}</div>
              <div className="text-sm text-zinc-400">{s.label}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardContent className="p-6">
          <h3 className="mb-4 font-display text-lg font-bold">Payments breakdown</h3>
          <div className="flex flex-wrap gap-2">
            {Object.entries(byMethod).map(([m, count]) => (
              <Badge key={m} variant="secondary" className="px-3 py-1.5 capitalize">{m} — {count}</Badge>
            ))}
            {Object.keys(byMethod).length === 0 && <span className="text-sm text-zinc-500">No confirmed bookings yet.</span>}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Coupons() {
  const { data: coupons } = useCoupons()
  const createCoupon = useCreateCoupon()
  const toggleCoupon = useToggleCoupon()
  const deleteCoupon = useDeleteCoupon()
  const { couponDialogOpen: open, couponForm: form } = useAdminUi()

  const submit = (e) => {
    e.preventDefault()
    if (!form.code || !form.value) return toast('Code & value required', 'warn')
    createCoupon.mutate(
      { ...form, value: Number(form.value) },
      {
        onSuccess: () => {
          toast('Coupon created 🎉', 'success')
          resetCouponForm()
          setCouponDialogOpen(false)
        },
        onError: (e) => toast(e.message, 'error'),
      },
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-sm text-zinc-400">Offers that appear across festival, weekend & weekday campaigns.</p>
        <CreateCouponDialog open={open} onOpenChange={setCouponDialogOpen} form={form} onSubmit={submit} creating={createCoupon.isPending} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {(coupons || []).map((c) => (
          <Card key={c.id}>
            <CardContent className="p-5">
              <div className="flex items-start justify-between">
                <div>
                  <div className="font-display text-lg font-extrabold tracking-wide text-brand-300">{c.code}</div>
                  <div className="mt-1 text-sm text-zinc-400">{c.label}</div>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge variant={c.type === 'festival' ? 'festival' : c.type === 'weekend' ? 'weekend' : c.type === 'weekday' ? 'weekday' : 'default'} className="capitalize">{c.type}</Badge>
                    <Badge variant="secondary">{c.valueType === 'flat' ? '₹' + c.value + ' off' : c.value + '% off'}</Badge>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <button
                    onClick={() => toggleCoupon.mutate({ id: c.id, active: !c.active })}
                    className={`rounded-full p-2 ${c.active ? 'text-emerald-400 hover:bg-emerald-500/10' : 'text-zinc-600 hover:bg-white/5'}`}
                    title={c.active ? 'Deactivate' : 'Activate'}
                  >
                    <Power className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => deleteCoupon.mutate(c.id, { onSuccess: () => toast('Coupon deleted', 'info') })}
                    className="rounded-full p-2 text-zinc-600 hover:bg-red-500/10 hover:text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="mt-3 flex items-center gap-1.5 text-xs text-zinc-500">
                {c.active ? <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" /> : <XCircle className="h-3.5 w-3.5 text-zinc-600" />}
                {c.active ? 'Active' : 'Inactive'}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function CreateCouponDialog({ open, onOpenChange, form, onSubmit, creating }) {
  const set = (k) => (e) => setCouponFormField(k, e.target.value)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        <Button><Plus className="h-4 w-4" /> New coupon</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create coupon / offer</DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Code</Label>
              <Input className="mt-1.5 uppercase" value={form.code} onChange={set('code')} placeholder="SAVE50" />
            </div>
            <div>
              <Label>Value</Label>
              <Input className="mt-1.5" type="number" value={form.value} onChange={set('value')} placeholder="10" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label>Type</Label>
              <Select value={form.type} onValueChange={(v) => setCouponFormField('type', v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="regular">Regular</SelectItem>
                  <SelectItem value="first">First time</SelectItem>
                  <SelectItem value="festival">Festival</SelectItem>
                  <SelectItem value="weekend">Weekend</SelectItem>
                  <SelectItem value="weekday">Weekday</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Discount style</Label>
              <Select value={form.valueType} onValueChange={(v) => setCouponFormField('valueType', v)}>
                <SelectTrigger className="mt-1.5">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percent">% off</SelectItem>
                  <SelectItem value="flat">₹ flat off</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div>
            <Label>Label</Label>
            <Input className="mt-1.5" value={form.label} onChange={set('label')} placeholder="Short promo text" />
          </div>
          <Button type="submit" className="w-full" disabled={creating}>
            {creating ? 'Creating...' : 'Create coupon'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function CricketBookings() {
  const { data: bookings, isLoading } = useCricketAdminBookings()
  const cancelBooking = useCricketCancelBooking()
  const { confirmCancelId: confirmId } = useAdminUi()

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-display text-lg font-bold">Cricket Bookings</h3>
        <span className="text-sm text-zinc-400">({(bookings || []).length} total)</span>
      </div>
      {isLoading ? (
        [1, 2, 3].map((i) => <div key={i} className="h-28 animate-pulse rounded-2xl bg-white/5" />)
      ) : (bookings || []).length === 0 ? (
        <p className="py-16 text-center text-zinc-500">No cricket bookings yet.</p>
      ) : (
        (bookings || []).map((b) => (
          <Card key={b.id} className="overflow-hidden">
            <CardContent className="p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <img src={b.matchImage} alt={b.matchName} className="h-11 w-11 rounded-xl object-cover" />
                  <div>
                    <div className="font-bold text-white">{b.matchName}</div>
                    <div className="text-sm text-zinc-400">{b.userName} - {b.bookingDate}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="success">₹{b.total}</Badge>
                  <Badge variant="secondary" className="capitalize">{b.paymentMethod}</Badge>
                  <Badge variant="default">{b.format}</Badge>
                  <span className="flex items-center gap-1 text-xs text-zinc-400"><Clock className="h-3 w-3" /> {b.slotTime}</span>
                  {b.status === 'confirmed' ? (
                    confirmId === b.id ? (
                      <div className="flex gap-2">
                        <Button size="sm" variant="ghost" onClick={() => setAdminConfirmCancelId(null)}>Keep</Button>
                        <Button size="sm" variant="destructive" onClick={() => cancelBooking.mutate({ matchId: b.matchId, bookingId: b.id }, { onSuccess: () => setAdminConfirmCancelId(null), onError: (e) => toast(e.message, 'error') })}>Cancel</Button>
                      </div>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => setAdminConfirmCancelId(b.id)}>
                        <XCircle className="mr-1 h-4 w-4 text-red-400" /> Cancel
                      </Button>
                    )
                  ) : (
                    <Badge variant="destructive">Cancelled</Badge>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))
      )}
    </div>
  )
}
