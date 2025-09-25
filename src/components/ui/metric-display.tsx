import * as React from "react"
import { cn } from "@/lib/utils"
import { StealthCard } from "./stealth-card"

interface MetricDisplayProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: string | number
  subtitle?: string
  change?: {
    value: number
    type: "increase" | "decrease" | "neutral"
  }
  icon?: React.ReactNode
  variant?: "default" | "primary" | "success" | "warning" | "destructive"
  size?: "sm" | "md" | "lg"
}

const MetricDisplay = React.forwardRef<HTMLDivElement, MetricDisplayProps>(
  ({
    className,
    title,
    value,
    subtitle,
    change,
    icon,
    variant = "default",
    size = "md",
    ...props
  }, ref) => {
    const sizes = {
      sm: {
        card: "p-4",
        value: "text-2xl",
        title: "text-sm",
        subtitle: "text-xs"
      },
      md: {
        card: "p-6",
        value: "text-3xl",
        title: "text-base",
        subtitle: "text-sm"
      },
      lg: {
        card: "p-8",
        value: "text-4xl",
        title: "text-lg",
        subtitle: "text-base"
      }
    }

    const variants = {
      default: "border-card-border",
      primary: "border-primary/20 bg-primary/5",
      success: "border-status-flow/20 bg-status-flow-bg",
      warning: "border-status-slow/20 bg-status-slow-bg",
      destructive: "border-status-blocked/20 bg-status-blocked-bg"
    }

    const valueColors = {
      default: "text-foreground",
      primary: "text-primary",
      success: "text-status-flow",
      warning: "text-status-slow",
      destructive: "text-status-blocked"
    }

    const getChangeColor = (type: "increase" | "decrease" | "neutral") => {
      switch (type) {
        case "increase":
          return "text-status-flow"
        case "decrease":
          return "text-status-blocked"
        default:
          return "text-muted-foreground"
      }
    }

    const getChangeIcon = (type: "increase" | "decrease" | "neutral") => {
      switch (type) {
        case "increase":
          return "↗"
        case "decrease":
          return "↘"
        default:
          return "→"
      }
    }

    return (
      <StealthCard
        ref={ref}
        className={cn(
          variants[variant],
          sizes[size].card,
          "transition-all duration-300 hover:scale-[1.02]",
          className
        )}
        {...props}
      >
        <div className="space-y-3">
          {/* Header with icon and title */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {icon && (
                <div className={cn(
                  "p-2 rounded-lg",
                  variant === "primary" && "bg-primary/10 text-primary",
                  variant === "success" && "bg-status-flow-bg text-status-flow",
                  variant === "warning" && "bg-status-slow-bg text-status-slow",
                  variant === "destructive" && "bg-status-blocked-bg text-status-blocked",
                  variant === "default" && "bg-muted text-muted-foreground"
                )}>
                  {icon}
                </div>
              )}
              <h3 className={cn(
                "font-medium text-muted-foreground",
                sizes[size].title
              )}>
                {title}
              </h3>
            </div>

            {change && (
              <div className={cn(
                "flex items-center gap-1 px-2 py-1 rounded-full bg-card text-xs font-medium",
                getChangeColor(change.type)
              )}>
                <span>{getChangeIcon(change.type)}</span>
                <span>{Math.abs(change.value)}%</span>
              </div>
            )}
          </div>

          {/* Main metric value */}
          <div>
            <div className={cn(
              "font-bold tracking-tight",
              sizes[size].value,
              valueColors[variant]
            )}>
              {value}
            </div>
            {subtitle && (
              <p className={cn(
                "text-muted-foreground",
                sizes[size].subtitle
              )}>
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Subtle gradient overlay */}
        <div className={cn(
          "absolute inset-0 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-300 pointer-events-none",
          variant === "primary" && "bg-gradient-to-br from-primary/5 to-transparent",
          variant === "success" && "bg-gradient-to-br from-status-flow/5 to-transparent",
          variant === "warning" && "bg-gradient-to-br from-status-slow/5 to-transparent",
          variant === "destructive" && "bg-gradient-to-br from-status-blocked/5 to-transparent"
        )} />
      </StealthCard>
    )
  }
)
MetricDisplay.displayName = "MetricDisplay"

interface ProgressMetricProps extends React.HTMLAttributes<HTMLDivElement> {
  title: string
  value: number
  max: number
  subtitle?: string
  variant?: "default" | "primary" | "success" | "warning" | "destructive"
  showPercentage?: boolean
}

const ProgressMetric = React.forwardRef<HTMLDivElement, ProgressMetricProps>(
  ({
    className,
    title,
    value,
    max,
    subtitle,
    variant = "default",
    showPercentage = true,
    ...props
  }, ref) => {
    const percentage = Math.min((value / max) * 100, 100)

    const progressColors = {
      default: "bg-primary",
      primary: "bg-primary",
      success: "bg-status-flow",
      warning: "bg-status-slow",
      destructive: "bg-status-blocked"
    }

    const textColors = {
      default: "text-foreground",
      primary: "text-primary",
      success: "text-status-flow",
      warning: "text-status-slow",
      destructive: "text-status-blocked"
    }

    return (
      <StealthCard
        ref={ref}
        className={cn("p-6", className)}
        {...props}
      >
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-medium text-muted-foreground">
              {title}
            </h3>
            {showPercentage && (
              <span className={cn(
                "text-sm font-bold",
                textColors[variant]
              )}>
                {Math.round(percentage)}%
              </span>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-baseline gap-2">
              <span className={cn("text-2xl font-bold", textColors[variant])}>
                {value}
              </span>
              <span className="text-muted-foreground">/ {max}</span>
            </div>

            {subtitle && (
              <p className="text-sm text-muted-foreground">{subtitle}</p>
            )}
          </div>

          <div className="relative">
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={cn(
                  "h-full rounded-full transition-all duration-1000 ease-out",
                  progressColors[variant]
                )}
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>
        </div>
      </StealthCard>
    )
  }
)
ProgressMetric.displayName = "ProgressMetric"

export { MetricDisplay, ProgressMetric }