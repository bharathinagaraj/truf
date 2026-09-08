import { cva } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const badgeVariants = cva(
  'inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
  {
    variants: {
      variant: {
        default: 'border-brand-500/30 bg-brand-500/15 text-brand-300',
        secondary: 'border-transparent bg-zinc-800 text-zinc-300',
        destructive: 'border-transparent bg-red-600/20 text-red-400',
        success: 'border-transparent bg-emerald-600/20 text-emerald-400',
        outline: 'text-zinc-300 border-white/15',
        festival: 'border-transparent bg-gradient-to-r from-orange-500/30 to-rose-500/30 text-orange-300',
        weekend: 'border-transparent bg-gradient-to-r from-cyan-500/30 to-indigo-500/30 text-cyan-300',
        weekday: 'border-transparent bg-gradient-to-r from-emerald-500/30 to-teal-500/30 text-emerald-300',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Badge({ className, variant, ...props }) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />
}

export { Badge, badgeVariants }
