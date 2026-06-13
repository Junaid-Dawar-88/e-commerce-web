import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: string
  delta: number
  icon: LucideIcon
  accent: string
}

export function StatCard({ label, value, delta, icon: Icon, accent }: StatCardProps) {
  const positive = delta >= 0

  return (
    <Card className="relative overflow-hidden">
      {/* soft accent glow in the corner */}
      <div
        className="pointer-events-none absolute -right-6 -top-6 h-24 w-24 rounded-full opacity-15 blur-2xl"
        style={{ background: accent }}
      />
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">{label}</span>
          <span
            className="flex size-9 items-center justify-center rounded-lg"
            style={{ background: `color-mix(in oklch, ${accent} 14%, transparent)`, color: accent }}
          >
            <Icon className="size-4.5" />
          </span>
        </div>
        <div className="flex items-end justify-between gap-2">
          <span className="text-2xl font-semibold tracking-tight tabular-nums">
            {value}
          </span>
          <span
            className={cn(
              'flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-medium',
              positive
                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                : 'bg-rose-500/10 text-rose-600 dark:text-rose-400'
            )}
          >
            {positive ? (
              <ArrowUpRight className="size-3" />
            ) : (
              <ArrowDownRight className="size-3" />
            )}
            {Math.abs(delta)}%
          </span>
        </div>
        <span className="text-xs text-muted-foreground">vs. last month</span>
      </CardContent>
    </Card>
  )
}
