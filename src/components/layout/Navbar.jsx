import { Link } from '@tanstack/react-router'
import { CalendarDays, ShieldCheck, LogOut, LayoutDashboard, CircleDot, Bell } from 'lucide-react'
import { useAuthUser, logout, useIsAdmin } from '@/store/authStore'
import { useCricketReminders } from '@/hooks/queries'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { toast } from '@/components/Toast'

export function Navbar() {
  const user = useAuthUser()
  const isAdmin = useIsAdmin()
  const { data: reminders } = useCricketReminders()
  const unreadCount = (reminders || []).filter((r) => !r.read).length

  const initials = (user?.name || '?')
    .split(' ')
    .map((p) => p[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-zinc-950/80 backdrop-blur-xl">
      <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-green-500 to-green-600 text-lg font-black text-black shadow-lg shadow-green-500/30">
            T
          </span>
          <span className="font-display text-xl font-extrabold tracking-tight">
            TRU<span className="text-green-400">F</span>
          </span>
        </Link>

        <div className="hidden items-center gap-6 text-sm font-medium text-zinc-300 md:flex">
          <Link to="/" className="transition hover:text-green-400">
            Home
          </Link>
          <Link to="/cricket" className="flex items-center gap-1 transition hover:text-green-400">
            <CircleDot className="h-4 w-4" /> Cricket
          </Link>
          {user && (
            <Link to="/my-bookings" className="flex items-center gap-1 transition hover:text-green-400">
              <CalendarDays className="h-4 w-4" /> My Bookings
            </Link>
          )}
          {isAdmin && (
            <Link to="/admin" className="flex items-center gap-1 transition hover:text-green-400">
              <ShieldCheck className="h-4 w-4" /> Admin
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2">
              {unreadCount > 0 && (
                <Link to="/reminders" className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-green-500/10 transition hover:bg-green-500/20">
                  <Bell className="h-4 w-4 text-green-400" />
                  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-green-500 text-[10px] font-bold text-black">
                    {unreadCount}
                  </span>
                </Link>
              )}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 outline-none">
                    <Avatar>
                      <AvatarFallback className="bg-gradient-to-br from-green-500/60 to-green-700/50 text-black">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <p className="font-semibold text-white">{user.name}</p>
                    <p className="text-xs font-normal text-zinc-400">{user.email}</p>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <div className="md:hidden">
                    <DropdownMenuItem asChild>
                      <Link to="/cricket"><CircleDot className="mr-2 h-4 w-4" /> Cricket</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/my-bookings">My Bookings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link to="/reminders"><Bell className="mr-2 h-4 w-4" /> Reminders</Link>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <DropdownMenuItem asChild>
                        <Link to="/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator />
                  </div>
                  {isAdmin && (
                    <DropdownMenuItem asChild className="hidden md:flex">
                      <Link to="/admin">
                        <LayoutDashboard className="h-4 w-4" /> Admin Dashboard
                      </Link>
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem asChild>
                    <Link to="/reminders">
                      <Bell className="h-4 w-4" /> Reminders {unreadCount > 0 && `(${unreadCount})`}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      logout()
                      toast('Logged out successfully', 'info')
                    }}
                  >
                    <LogOut className="h-4 w-4" /> Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link to="/login">Login</Link>
              </Button>
              <Button asChild size="sm" className="bg-green-600 hover:bg-green-700">
                <Link to="/login?mode=register">Join Free</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  )
}
