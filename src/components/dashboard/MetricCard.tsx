import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  description: string
  trend?: {
    value: string
    isPositive: boolean
  }
  icon: React.ReactNode
  variant?: 'default' | 'warning' | 'success' | 'destructive'
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default'
}: MetricCardProps) {
  const getVariantStyles = () => {
    switch (variant) {
      case 'warning':
        return 'border-status-slow/20 bg-status-slow/5'
      case 'success':
        return 'border-status-flow/20 bg-status-flow/5'
      case 'destructive':
        return 'border-status-blocked/20 bg-status-blocked/5'
      default:
        return 'border-border'
    }
  }

  const getIconStyles = () => {
    switch (variant) {
      case 'warning':
        return 'text-status-slow'
      case 'success':
        return 'text-status-flow'
      case 'destructive':
        return 'text-status-blocked'
      default:
        return 'text-primary'
    }
  }

  return (
    <Card className={cn(
      'relative overflow-hidden transition-all duration-200 hover:shadow-lg',
      getVariantStyles()
    )}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div className="flex items-center gap-2">
          <div className={cn('p-2 rounded-lg bg-background/50', getIconStyles())}>
            {icon}
          </div>
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
        </div>
        {trend && (
          <Badge
            variant={trend.isPositive ? 'default' : 'destructive'}
            className="text-xs"
          >
            {trend.isPositive ? (
              <TrendingUp className="w-3 h-3 mr-1" />
            ) : (
              <TrendingDown className="w-3 h-3 mr-1" />
            )}
            {trend.value}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          <p className="text-xs text-muted-foreground">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}