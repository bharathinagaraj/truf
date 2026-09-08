import { useNow } from '@/store/countdownStore'
import { cn } from '@/lib/utils'

function diff(targetMs, now) {
  const total = Math.max(0, targetMs - now)
  const days = Math.floor(total / 86400000)
  const hours = Math.floor((total % 86400000) / 3600000)
  const mins = Math.floor((total % 3600000) / 60000)
  const secs = Math.floor((total % 60000) / 1000)
  return { days, hours, mins, secs }
}

function CountdownBox({ value, label, size }) {
  return (
    <div className="flex flex-col items-center">
      <span
        className={cn(
          'flex items-center justify-center rounded-lg bg-white/10 font-display font-extrabold tabular-nums text-white backdrop-blur',
          size === 'lg' ? 'h-14 w-14 text-2xl' : 'h-12 w-11 text-xl',
        )}
      >
        {String(value).padStart(2, '0')}
      </span>
      <span className="mt-1 text-[10px] uppercase tracking-wider text-zinc-400">{label}</span>
    </div>
  )
}

export function Countdown({ target, size = 'md', className }) {
  const now = useNow()
  const t = diff(target, now)

  return (
    <div className={cn('flex items-start gap-2', className)}>
      <CountdownBox value={t.days} label="Days" size={size} />
      <span className="pb-4 font-display text-xl text-brand-400">:</span>
      <CountdownBox value={t.hours} label="Hrs" size={size} />
      <span className="pb-4 font-display text-xl text-brand-400">:</span>
      <CountdownBox value={t.mins} label="Min" size={size} />
      <span className="pb-4 font-display text-xl text-brand-400">:</span>
      <CountdownBox value={t.secs} label="Sec" size={size} />
    </div>
  )
}