import * as React from "react"
import { cn } from "@/lib/utils"

export type Status = "flow" | "slow" | "blocked" | "offline"

interface StatusIndicatorProps extends React.HTMLAttributes<HTMLDivElement> {
  status: Status
  size?: "sm" | "md" | "lg"
  withPulse?: boolean
  withGlow?: boolean
  showLabel?: boolean
  label?: string
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({
    className,
    status,
    size = "md",
    withPulse = false,
    withGlow = false,
    showLabel = false,
    label,
    ...props
  }, ref) => {
    const sizes = {
      sm: "w-2 h-2",
      md: "w-3 h-3",
      lg: "w-4 h-4"
    }

    const statusColors = {
      flow: "bg-status-flow",
      slow: "bg-status-slow",
      blocked: "bg-status-blocked",
      offline: "bg-muted"
    }

    const statusGlows = {
      flow: "glow-status-flow",
      slow: "glow-status-slow",
      blocked: "glow-status-blocked",
      offline: ""
    }

    const statusLabels = {
      flow: "In Flow",
      slow: "Problem Solving",
      blocked: "Blocked",
      offline: "Offline"
    }

    const displayLabel = label || statusLabels[status]

    if (showLabel) {
      return (
        <div
          ref={ref}
          className={cn("flex items-center gap-2", className)}
          {...props}
        >
          <div className="relative">
            <div
              className={cn(
                sizes[size],
                statusColors[status],
                "rounded-full",
                withPulse && "animate-status-pulse",
                withGlow && statusGlows[status]
              )}
            />
            {withPulse && (
              <div
                className={cn(
                  sizes[size],
                  statusColors[status],
                  "rounded-full absolute inset-0 animate-ping opacity-75"
                )}
              />
            )}
          </div>
          <span className="text-sm text-muted-foreground">{displayLabel}</span>
        </div>
      )
    }

    return (
      <div
        ref={ref}
        className={cn("relative", className)}
        {...props}
      >
        <div
          className={cn(
            sizes[size],
            statusColors[status],
            "rounded-full",
            withPulse && "animate-status-pulse",
            withGlow && statusGlows[status]
          )}
        />
        {withPulse && (
          <div
            className={cn(
              sizes[size],
              statusColors[status],
              "rounded-full absolute inset-0 animate-ping opacity-75"
            )}
          />
        )}
      </div>
    )
  }
)
StatusIndicator.displayName = "StatusIndicator"

interface StatusBadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  status: Status
  variant?: "default" | "outline" | "ghost"
  size?: "sm" | "md" | "lg"
  withIcon?: boolean
}

const StatusBadge = React.forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({
    className,
    status,
    variant = "default",
    size = "md",
    withIcon = true,
    children,
    ...props
  }, ref) => {
    const sizes = {
      sm: "px-2 py-1 text-xs",
      md: "px-3 py-1.5 text-sm",
      lg: "px-4 py-2 text-base"
    }

    const baseVariants = {
      flow: {
        default: "bg-status-flow-bg text-status-flow border-status-flow/20",
        outline: "border-2 border-status-flow text-status-flow bg-transparent",
        ghost: "text-status-flow hover:bg-status-flow-bg"
      },
      slow: {
        default: "bg-status-slow-bg text-status-slow border-status-slow/20",
        outline: "border-2 border-status-slow text-status-slow bg-transparent",
        ghost: "text-status-slow hover:bg-status-slow-bg"
      },
      blocked: {
        default: "bg-status-blocked-bg text-status-blocked border-status-blocked/20",
        outline: "border-2 border-status-blocked text-status-blocked bg-transparent",
        ghost: "text-status-blocked hover:bg-status-blocked-bg"
      },
      offline: {
        default: "bg-muted text-muted-foreground border-muted/20",
        outline: "border-2 border-muted text-muted-foreground bg-transparent",
        ghost: "text-muted-foreground hover:bg-muted"
      }
    }

    const statusLabels = {
      flow: "Flow",
      slow: "Slow",
      blocked: "Blocked",
      offline: "Offline"
    }

    return (
      <div
        ref={ref}
        className={cn(
          "inline-flex items-center gap-1.5 rounded-full border font-medium transition-colors",
          sizes[size],
          baseVariants[status][variant],
          className
        )}
        {...props}
      >
        {withIcon && (
          <StatusIndicator
            status={status}
            size="sm"
            withPulse={status !== "offline"}
          />
        )}
        {children || statusLabels[status]}
      </div>
    )
  }
)
StatusBadge.displayName = "StatusBadge"

export { StatusIndicator, StatusBadge }