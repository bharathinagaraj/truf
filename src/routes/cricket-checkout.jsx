import { createFileRoute, Link, useNavigate } from '@tanstack/react-router'
import {
  ArrowLeft,
  CreditCard,
  Landmark,
  Wallet,
  Smartphone,
  Banknote,
  ShieldCheck,
  TicketPercent,
  CheckCircle2,
  CircleDot,
  Loader2,
} from 'lucide-react'
import {
  useCricketBooking,
  resetCricketBooking,
  setCricketPaymentMethod,
  setCricketCoupon,
} from '@/store/cricketBookingStore'
import {
  useCricketCheckout,
  setCheckoutField,
  setCheckoutCard,
  setCheckoutProcessing,
  resetCricketCheckout,
} from '@/store/cricketCheckoutStore'
import { setCricketBookingResult } from '@/store/cricketBookingResultStore'
import { useCricketBook, useCricketPrice } from '@/hooks/queries'
import { useAuthUser } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { toast } from '@/components/Toast'

export const Route = createFileRoute('/cricket-checkout')({
  component: CricketCheckout,
})

const METHODS = [
  { id: 'gpay', name: 'Google Pay', icon: Smartphone, desc: 'UPI instant', color: 'text-blue-400' },
  { id: 'phonepay', name: 'PhonePe', icon: Smartphone, desc: 'UPI instant', color: 'text-purple-400' },
  { id: 'upi', name: 'UPI', icon: Wallet, desc: 'Any UPI app', color: 'text-emerald-400' },
  { id: 'netbanking', name: 'Net Banking', icon: Landmark, desc: 'All major banks', color: 'text-amber-400' },
  { id: 'debitcard', name: 'Debit / Credit Card', icon: CreditCard, desc: 'Visa - Mastercard - RuPay', color: 'text-cyan-400' },
  { id: 'cod', name: 'Cash on Delivery', icon: Banknote, desc: 'Pay at the venue', color: 'text-rose-400' },
]

function CricketCheckout() {
  const navigate = useNavigate()
  const booking = useCricketBooking()
  const checkout = useCricketCheckout()
  const user = useAuthUser()
  const cricketBook = useCricketBook()

  const payerName = checkout.payerName ?? user?.name ?? ''
  const phone = checkout.phone ?? user?.phone ?? ''

  const players = booking.players || 1
  const priceParams = booking.match && booking.slotId
    ? {
        date: booking.date,
        slotId: booking.slotId,
        players: booking.players,
        couponCode: booking.coupon?.code || '',
      }
    : null
  const { data: price, isFetching: priceFetching } = useCricketPrice(booking.match?.id, priceParams)

  const m = booking.match
  if (!booking.match) {
    return (
      <div className="mx-auto max-w-xl px-4 py-20 text-center">
        <CircleDot className="mx-auto mb-4 h-12 w-12 text-green-400" />
        <p className="text-zinc-400">No cricket booking in progress.</p>
        <Link to="/cricket" className="mt-4 inline-block">
          <Button>Browse cricket matches</Button>
        </Link>
      </div>
    )
  }

  const basePrice = price?.basePrice ?? m.entryFee * players
  const discount = price?.discount ?? 0
  const total = price?.total ?? basePrice
  const couponRejected = !!booking.coupon && price && !price.couponEligible

  const pay = () => {
    if (!price || couponRejected)
      return toast(couponRejected ? price?.reason || 'Coupon cannot be applied' : 'Recalculating price, please wait…', 'warn')
    if (!user) return toast('Please login to complete your booking', 'warn')
    if (!payerName.trim()) return toast('Enter your full name', 'warn')
    if (!phone.trim()) return toast('Enter your phone number', 'warn')
    if (!booking.slotId) return toast('Select a slot first', 'warn')
    if (!booking.paymentMethod) return toast('Choose a payment method', 'warn')
    if (booking.paymentMethod === 'upi' && !checkout.upiId.trim())
      return toast('Enter your UPI ID', 'warn')
    if (booking.paymentMethod === 'debitcard' && (!checkout.card.number.trim() || !checkout.card.expiry.trim() || !checkout.card.cvv.trim()))
      return toast('Fill in all card details', 'warn')

    setCheckoutProcessing(true)
    cricketBook.mutate(
      {
        matchId: m.id,
        slotId: booking.slotId,
        slotTime: booking.slotTime,
        players,
        paymentMethod: booking.paymentMethod,
        couponCode: booking.coupon?.code || null,
        date: booking.date,
        payerName: payerName.trim(),
        phone: phone.trim(),
        upiId: booking.paymentMethod === 'upi' ? checkout.upiId.trim() : undefined,
        cardNumber: booking.paymentMethod === 'debitcard' ? checkout.card.number.trim() : undefined,
        cardExpiry: booking.paymentMethod === 'debitcard' ? checkout.card.expiry.trim() : undefined,
      },
      {
        onSuccess: (result) => {
          setCheckoutProcessing(false)
          const matchedMethod = METHODS.find((x) => x.id === booking.paymentMethod)
          setCricketBookingResult({
            ...result,
            matchTitle: m.title,
            matchImage: m.image,
            matchVenue: m.venue,
            matchFormat: m.format,
            paymentLabel: matchedMethod?.name || booking.paymentMethod,
          })
          resetCricketBooking()
          resetCricketCheckout()
          toast('Booking successful! Your cricket slot is confirmed 🏏', 'success')
          navigate({ to: '/cricket-booking-success' })
        },
        onError: (err) => {
          setCheckoutProcessing(false)
          toast(err.message, 'error')
        },
      },
    )
  }

  const payLabel = {
    gpay: 'Pay with GPay',
    phonepay: 'Pay with PhonePe',
    upi: 'Verify & Pay via UPI',
    netbanking: 'Continue to Net Banking',
    debitcard: 'Pay Now',
    cod: 'Confirm Cash on Delivery',
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
      <Link to={`/cricket/$matchId`} params={{ matchId: m.id }} className="mb-6 inline-flex items-center gap-1 text-sm text-zinc-400 hover:text-green-400">
        <ArrowLeft className="h-4 w-4" /> Edit booking
      </Link>

      <h1 className="mb-6 font-display text-3xl font-extrabold">Secure Checkout</h1>

      {/* coupons applied demo banner — only when a coupon is actually applied */}
      {booking.coupon && discount > 0 && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-5 py-4">
          <TicketPercent className="h-6 w-6 shrink-0 text-emerald-400" />
          <p className="text-sm text-emerald-200">
            Coupon <b>{booking.coupon.code}</b> applied — you save <b>₹{discount}</b>! 🎉
          </p>
        </div>
      )}
      {couponRejected && (
        <div className="mb-6 flex items-center justify-between gap-3 rounded-2xl border border-amber-500/30 bg-amber-500/10 px-5 py-4">
          <p className="text-sm text-amber-200">{price.reason}</p>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setCricketCoupon(null)
            }}
          >
            Remove coupon
          </Button>
        </div>
      )}

      <div className="grid gap-8 lg:grid-cols-[1fr_380px]">
        {/* LEFT: payment methods */}
        <div className="space-y-6">
          <Card>
            <CardContent className="p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Contact details</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Full name</label>
                  <input value={payerName} onChange={(e) => setCheckoutField('payerName', e.target.value)} className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                </div>
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Phone</label>
                  <input value={phone} onChange={(e) => setCheckoutField('phone', e.target.value)} className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h3 className="mb-1 font-display text-lg font-bold">Payment method</h3>
              <p className="mb-4 text-sm text-zinc-400">Pay the way you want — always encrypted & secure.</p>
              <div className="grid gap-3">
                {METHODS.map((method) => {
                  const isSel = booking.paymentMethod === method.id
                  return (
                    <button
                      key={method.id}
                      onClick={() => {
                        setCricketPaymentMethod(method.id)
                        setCheckoutField('upiId', '')
                      }}
                      className={`flex items-center gap-3 rounded-xl border p-4 text-left transition ${
                        isSel ? 'border-green-500 bg-green-500/10' : 'border-white/12 bg-white/[0.03] hover:border-white/25'
                      }`}
                    >
                      <span className={`flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 ${method.color}`}>
                        <method.icon className="h-5 w-5" />
                      </span>
                      <span className="flex-1">
                        <span className="block font-semibold text-white">{method.name}</span>
                        <span className="block text-xs text-zinc-500">{method.desc}</span>
                      </span>
                      {isSel && <CheckCircle2 className="h-5 w-5 text-green-400" />}
                    </button>
                  )
                })}
              </div>

              {booking.paymentMethod === 'upi' && (
                <div className="mt-4">
                  <label className="mb-1.5 block text-sm font-medium text-zinc-300">Your UPI ID</label>
                  <input value={checkout.upiId} onChange={(e) => setCheckoutField('upiId', e.target.value)} placeholder="name@upi" className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                  <p className="mt-1 text-xs text-zinc-500">You will receive a collect-request on your UPI app.</p>
                </div>
              )}

              {booking.paymentMethod === 'debitcard' && (
                <div className="mt-4 space-y-3">
                  <input value={checkout.card.number} onChange={(e) => setCheckoutCard('number', e.target.value)} placeholder="Card number" className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                  <input value={checkout.card.name} onChange={(e) => setCheckoutCard('name', e.target.value)} placeholder="Name on card" className="h-11 w-full rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                  <div className="grid grid-cols-2 gap-3">
                    <input value={checkout.card.expiry} onChange={(e) => setCheckoutCard('expiry', e.target.value)} placeholder="MM/YY" className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                    <input value={checkout.card.cvv} onChange={(e) => setCheckoutCard('cvv', e.target.value)} placeholder="CVV" className="h-11 rounded-xl border border-white/12 bg-white/5 px-3 text-sm text-white outline-none focus:border-green-500/50" />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* RIGHT: summary */}
        <div>
          <Card className="sticky top-20">
            <CardContent className="p-6">
              <h3 className="mb-4 font-display text-lg font-bold">Booking summary</h3>
              <div className="flex gap-3">
                <img src={m.image} alt={m.title} className="h-16 w-16 rounded-lg object-cover" />
                <div>
                  <div className="font-semibold text-white">{m.title}</div>
                  <div className="text-sm text-zinc-400">{m.venue}</div>
                </div>
              </div>

              <Separator className="my-4" />
              <div className="space-y-2 text-sm">
                <Row label="Format" value={m.format} />
                <Row label="Time slot" value={booking.slotTime || '—'} />
                <Row label="Date" value={booking.date ? new Date(booking.date).toLocaleDateString('en-IN', { weekday: 'short', month: 'short', day: 'numeric' }) : 'Today'} />
                <Row label="Players" value={String(players)} />
                <Row label="Subtotal" value={`₹${basePrice}`} />
                {discount > 0 && (
                  <div className="flex justify-between font-medium text-emerald-400">
                    <span>Coupon {booking.coupon?.code}</span>
                    <span>- ₹{discount}</span>
                  </div>
                )}
              </div>

              <Separator className="my-4" />
              <div className="flex items-center justify-between">
                <span className="font-semibold text-white">Total</span>
                <span className="flex items-center gap-1 font-display text-2xl font-extrabold text-green-300">
                  {priceFetching && <Loader2 className="h-4 w-4 animate-spin text-zinc-500" />}
                  ₹{total}
                </span>
              </div>

              <Button size="lg" className="mt-5 w-full bg-green-600 hover:bg-green-700" onClick={pay} disabled={checkout.processing || priceFetching || couponRejected}>
                {checkout.processing ? 'Processing...' : priceFetching ? 'Checking price...' : payLabel[booking.paymentMethod] || 'Pay now'}
              </Button>

              <div className="mt-4 flex items-center justify-center gap-2 text-xs text-zinc-500">
                <ShieldCheck className="h-4 w-4 text-emerald-500" />
                256-bit SSL secured - Instant confirmation
              </div>

              {booking.paymentMethod === 'cod' && (
                <Badge variant="secondary" className="mt-3 w-full justify-center py-1.5">
                  Cash paid at venue — book now, pay later
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between text-zinc-300">
      <span>{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  )
}