import { TrendingUp, TrendingDown, LucideIcon } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StatCardProps {
  title: string
  value: string
  change: string
  trend: 'up' | 'down'
  icon: LucideIcon
  color: 'primary' | 'warning' | 'success' | 'accent'
}

function StatCard ({ title, value, change, trend, icon: Icon, color }: StatCardProps) {
  const colorClasses = {
    primary: 'text-primary bg-primary/10 border-primary/20',
    warning: 'text-[hsl(var(--warning))] bg-[hsl(var(--warning-bg))] border-[hsl(var(--warning))]/20',
    success: 'text-[hsl(var(--success))] bg-[hsl(var(--success-bg))] border-[hsl(var(--success))]/20',
    accent: 'text-[hsl(var(--accent))] bg-[hsl(var(--accent))]/10 border-[hsl(var(--accent))]/20'
  }

  return (
    <div className='bg-card border border-border rounded-xl p-6 hover:border-border-hover transition-all duration-200'>
      <div className='flex items-center justify-between mb-4'>
        <div className={cn('p-2 rounded-lg border', colorClasses[color])}>
          <Icon className='h-5 w-5' />
        </div>
        {trend === 'up' ? (
          <TrendingUp className='h-4 w-4 text-status-flow' />
        ) : (
          <TrendingDown className='h-4 w-4 text-status-blocked' />
        )}
      </div>
      <div>
        <p className='text-2xl font-bold text-foreground'>{value}</p>
        <p className='text-sm text-muted-foreground mt-1'>{title}</p>
        <p className='text-xs text-muted-foreground mt-2'>{change}</p>
      </div>
    </div>
  )
}

export default StatCard
