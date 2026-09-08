import { Store, useStore } from '@tanstack/react-store'
import { CheckCircle2, XCircle, Info, AlertTriangle } from 'lucide-react'

export const toastStore = new Store({ toasts: [] })

let counter = 0

export function toast(message, type = 'success') {
  const id = ++counter
  toastStore.setState((s) => ({ toasts: [...s.toasts, { id, message, type }] }))
  setTimeout(() => {
    toastStore.setState((s) => ({ toasts: s.toasts.filter((t) => t.id !== id) }))
  }, 3800)
}

const ICONS = {
  success: CheckCircle2,
  error: XCircle,
  info: Info,
  warn: AlertTriangle,
}

const COLORS = {
  success: 'border-emerald-500/40 text-emerald-300',
  error: 'border-red-500/40 text-red-300',
  info: 'border-brand-500/40 text-brand-300',
  warn: 'border-amber-500/40 text-amber-300',
}

export function ToastViewport() {
  const toasts = useStore(toastStore, (s) => s.toasts)
  return (
    <div className="pointer-events-none fixed bottom-6 right-6 z-[100] flex w-80 flex-col gap-2">
      {toasts.map((t) => {
        const Icon = ICONS[t.type]
        return (
          <div
            key={t.id}
            className="pointer-events-auto flex items-start gap-3 rounded-xl border bg-zinc-900/95 px-4 py-3 shadow-2xl backdrop-blur animate-float"
            style={{ borderColor: 'var(--color-brand-500/40)' }}
          >
            <Icon className={`mt-0.5 h-5 w-5 shrink-0 ${COLORS[t.type]}`} />
            <p className="text-sm text-zinc-100">{t.message}</p>
          </div>
        )
      })}
    </div>
  )
}
