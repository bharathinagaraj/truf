import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useMutation } from '@tanstack/react-query'
import { Trophy, User, ShieldCheck, Store, Lock, Mail, Phone, ArrowRight, CheckCircle2 } from 'lucide-react'
import { api } from '@/lib/api'
import { setAuthedUser } from '@/store/authStore'
import { useLogin, setLoginTab, setLoginRole, setLoginFormField } from '@/store/loginStore'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from '@/components/Toast'

export const Route = createFileRoute('/login')({
  validateSearch: (search) => ({ mode: search.mode || 'login' }),
  component: Login,
})

function Login() {
  const { mode } = Route.useSearch()
  const navigate = useNavigate()
  const login = useLogin()
  const tab = login.tab
  const role = login.role
  const form = login.form

  if (!login.initialized && mode === 'register' && tab === 'login') setLoginTab('register')

  const set = (k) => (e) => setLoginFormField(k, e.target.value)

  const loginMut = useMutation({
    mutationFn: (b) => api.login(b),
    onSuccess: ({ user, token }) => {
      setAuthedUser(user, token)
      toast(`Welcome back, ${user.name}! 🎉`, 'success')
      navigate({ to: user.role === 'admin' ? '/admin' : '/' })
    },
    onError: (e) => toast(e.message, 'error'),
  })

  const regMut = useMutation({
    mutationFn: (b) => api.register(b),
    onSuccess: ({ user, token }) => {
      setAuthedUser(user, token)
      toast('Account created — welcome to TRUF! 🎉', 'success')
      navigate({ to: '/' })
    },
    onError: (e) => toast(e.message, 'error'),
  })

  const submit = (e) => {
    e.preventDefault()
    if (tab === 'register') {
      if (!form.name || !form.email || !form.password)
        return toast('Fill all required fields', 'warn')
      regMut.mutate(form)
    } else {
      if (!form.email || !form.password) return toast('Enter email & password', 'warn')
      loginMut.mutate({ email: form.email, password: form.password })
    }
  }

  return (
    <div className="relative mx-auto flex min-h-[80vh] max-w-6xl items-center justify-center px-4 py-12 sm:px-6">
      <div className="grid-bg pointer-events-none absolute inset-0" />
      <div className="pointer-events-none absolute left-1/4 top-10 h-72 w-72 rounded-full bg-brand-500/15 blur-3xl" />
      <div className="grid w-full gap-10 lg:grid-cols-2 lg:items-center">
        {/* LEFT BRAND */}
        <div className="relative hidden lg:block">
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-brand-500 to-brand-600 text-2xl font-black text-black shadow-2xl shadow-brand-500/40">
            T
          </span>
          <h1 className="mt-6 font-display text-5xl font-extrabold leading-tight">
            Your game.
            <br />
            <span className="text-gradient">Your slot.</span>
          </h1>
          <p className="mt-4 max-w-sm text-lg text-zinc-400">
            Book cricket turf slots, pre-book up to 30 days ahead, grab festival & weekend offers and pay
            the way you want.
          </p>
          <ul className="mt-8 space-y-3 text-zinc-300">
            {[
              '⚡ Instant slot confirmation',
              '🎉 Festival · Weekend · Weekday offers',
              '💳 UPI · Cards · Net Banking · COD',
            ].map((f) => (
              <li key={f} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-400" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* FORM */}
        <Card className="mx-auto w-full max-w-md">
          <CardContent className="p-7">
            <Tabs value={tab} onValueChange={setLoginTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
              </TabsList>

              {/* ROLE SELECTOR */}
              <div className="mt-5 grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLoginRole('customer')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    role === 'customer' ? 'border-brand-500 bg-brand-500/10 text-brand-200' : 'border-white/12 bg-white/5 text-zinc-400 hover:border-white/25'
                  }`}
                >
                  <User className="h-4 w-4" /> Customer
                </button>
                <button
                  onClick={() => setLoginRole('admin')}
                  className={`flex items-center justify-center gap-2 rounded-xl border p-3 text-sm font-semibold transition ${
                    role === 'admin' ? 'border-brand-500 bg-brand-500/10 text-brand-200' : 'border-white/12 bg-white/5 text-zinc-400 hover:border-white/25'
                  }`}
                >
                  <ShieldCheck className="h-4 w-4" /> Admin
                </button>
              </div>

              <form onSubmit={submit} className="mt-5 space-y-4">
                {role === 'admin' && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-3 text-sm text-amber-200">
                    Demo admin — <b>admin@truf.com</b> / <b>admin123</b>
                  </div>
                )}
                {tab === 'register' && (
                  <div>
                    <Label htmlFor="name">Full name</Label>
                    <Input id="name" className="mt-1.5" value={form.name} onChange={set('name')} placeholder="Your name" />
                  </div>
                )}
                <div>
                  <Label htmlFor="email">Email</Label>
                  <div className="relative mt-1.5">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input id="email" className="pl-9" type="email" value={form.email} onChange={set('email')} placeholder="you@example.com" />
                  </div>
                </div>
                {tab === 'register' && (
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <div className="relative mt-1.5">
                      <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input id="phone" className="pl-9" value={form.phone} onChange={set('phone')} placeholder="10-digit mobile" />
                    </div>
                  </div>
                )}
                <div>
                  <Label htmlFor="password">Password</Label>
                  <div className="relative mt-1.5">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                    <Input id="password" className="pl-9" type="password" value={form.password} onChange={set('password')} placeholder={role === 'admin' ? 'Enter admin password' : 'Min 6 characters'} />
                  </div>
                </div>

                <Button
                  type="submit"
                  size="lg"
                  className="w-full"
                  disabled={loginMut.isPending || regMut.isPending}
                >
                  {role === 'admin'
                    ? 'Admin login'
                    : tab === 'register'
                      ? 'Create free account'
                      : 'Login & book'}
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </form>

              <div className="mt-5 text-center text-xs text-zinc-500">
                {tab === 'login' ? (
                  <button onClick={() => setLoginTab('register')} className="hover:text-brand-400">
                    New here? Create your free account →
                  </button>
                ) : (
                  <button onClick={() => setLoginTab('login')} className="hover:text-brand-400">
                    Already have an account? Login →
                  </button>
                )}
              </div>
              <div className="mt-4 flex items-center justify-center gap-1.5 text-xs text-zinc-600">
                <Store className="h-3.5 w-3.5" /> Secured by TRUF · <Trophy className="h-3.5 w-3.5" /> Play big
              </div>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
