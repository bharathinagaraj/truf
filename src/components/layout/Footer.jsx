import { Link } from '@tanstack/react-router'
import { Trophy, Mail, Phone, MapPin } from 'lucide-react'

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-night-950 pt-12 pb-8">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 sm:px-6 md:grid-cols-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-600 font-black text-black">
              T
            </span>
            <span className="font-display text-lg font-extrabold">
              TRU<span className="text-brand-400">F</span>
            </span>
          </div>
          <p className="text-sm text-zinc-400">
            Book cricket turf slots, pre-book up to 30 days ahead, grab festival & weekend offers and pay your
            way. Play big, win big.
          </p>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Explore</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li><Link to="/" className="hover:text-green-400">Home</Link></li>
            <li><Link to="/cricket" className="hover:text-green-400">Cricket</Link></li>
            <li><Link to="/my-bookings" className="hover:text-green-400">My Bookings</Link></li>
            <li><Link to="/login" className="hover:text-green-400">Login / Register</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Offers</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li>🎉 Festival Time — up to ₹50 off</li>
            <li>🏖️ Weekend Offer — 20% off</li>
            <li>💼 Weekday Offer — 15% off</li>
            <li>🎁 First time — WELCOME10</li>
          </ul>
        </div>

        <div>
          <h4 className="mb-3 font-semibold text-white">Contact</h4>
          <ul className="space-y-2 text-sm text-zinc-400">
            <li className="flex items-center gap-2"><Mail className="h-4 w-4 text-brand-400" /> play@truf.in</li>
            <li className="flex items-center gap-2"><Phone className="h-4 w-4 text-brand-400" /> +91 98765 43210</li>
            <li className="flex items-center gap-2"><MapPin className="h-4 w-4 text-brand-400" /> Chennai</li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-10 max-w-7xl border-t border-white/10 pt-6 text-center text-xs text-zinc-500">
        © {new Date().getFullYear()} TRUF · Made for players, by players · <Trophy className="inline h-3 w-3" />
      </div>
    </footer>
  )
}
