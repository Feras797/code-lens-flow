import * as React from "react"
import { AlertTriangle, X, Users, FileText } from "lucide-react"
import { cn } from "@/lib/utils"
import { StealthCard } from "./stealth-card"
import { PremiumButton } from "./premium-button"

interface CollisionData {
  id: string
  type: "file" | "feature" | "dependency"
  developers: string[]
  resource: string
  description?: string
  severity: "low" | "medium" | "high"
  timestamp?: Date
}

interface CollisionAlertProps extends React.HTMLAttributes<HTMLDivElement> {
  collision: CollisionData
  onDismiss?: (collisionId: string) => void
  onResolve?: (collisionId: string) => void
  showActions?: boolean
}

const CollisionAlert = React.forwardRef<HTMLDivElement, CollisionAlertProps>(
  ({
    className,
    collision,
    onDismiss,
    onResolve,
    showActions = true,
    ...props
  }, ref) => {
    const severityConfig = {
      low: {
        bg: "bg-status-flow-bg",
        border: "border-status-flow/30",
        text: "text-status-flow",
        glow: "hover:glow-status-flow"
      },
      medium: {
        bg: "bg-status-slow-bg",
        border: "border-status-slow/30",
        text: "text-status-slow",
        glow: "hover:glow-status-slow"
      },
      high: {
        bg: "bg-status-blocked-bg",
        border: "border-status-blocked/30",
        text: "text-status-blocked",
        glow: "hover:glow-status-blocked"
      }
    }

    const typeConfig = {
      file: {
        icon: <FileText className="w-5 h-5" />,
        label: "File Collision",
        description: "Multiple developers editing the same file"
      },
      feature: {
        icon: <Users className="w-5 h-5" />,
        label: "Feature Overlap",
        description: "Related functionality being developed simultaneously"
      },
      dependency: {
        icon: <AlertTriangle className="w-5 h-5" />,
        label: "Dependency Chain",
        description: "Work blocking other team members"
      }
    }

    const config = severityConfig[collision.severity]
    const typeInfo = typeConfig[collision.type]

    const formatDevelopers = (developers: string[]) => {
      if (developers.length === 2) {
        return developers.join(" and ")
      }
      if (developers.length > 2) {
        return developers.slice(0, -1).join(", ") + ", and " + developers[developers.length - 1]
      }
      return developers[0]
    }

    return (
      <StealthCard
        ref={ref}
        className={cn(
          "border-l-4 animate-fade-in",
          config.bg,
          config.border,
          config.glow,
          className
        )}
        {...props}
      >
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "p-2 rounded-lg",
                config.bg,
                config.text
              )}>
                {typeInfo.icon}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className={cn("font-semibold", config.text)}>
                    ⚠️ {typeInfo.label.toUpperCase()}
                  </h3>
                  <span className={cn(
                    "px-2 py-1 rounded-full text-xs font-medium uppercase",
                    config.bg,
                    config.text
                  )}>
                    {collision.severity}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground mt-1">
                  {typeInfo.description}
                </p>
              </div>
            </div>

            {onDismiss && (
              <PremiumButton
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss(collision.id)}
              >
                <X className="w-4 h-4" />
              </PremiumButton>
            )}
          </div>

          {/* Collision Details */}
          <div className="space-y-2">
            <p className={cn("font-medium", config.text)}>
              {formatDevelopers(collision.developers)} are both working on{" "}
              <span className="font-semibold">{collision.resource}</span>
            </p>

            {collision.description && (
              <p className="text-sm text-muted-foreground">
                {collision.description}
              </p>
            )}

            {collision.timestamp && (
              <p className="text-xs text-muted-foreground">
                Detected {collision.timestamp.toLocaleTimeString()}
              </p>
            )}
          </div>

          {/* Developer Avatars */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Involved:</span>
            <div className="flex -space-x-2">
              {collision.developers.map((dev, index) => (
                <div
                  key={index}
                  className={cn(
                    "w-8 h-8 rounded-full border-2 border-card bg-primary flex items-center justify-center text-primary-foreground text-xs font-medium",
                    "ring-2 ring-card"
                  )}
                  title={dev}
                >
                  {dev.split(" ").map(n => n[0]).join("").toUpperCase()}
                </div>
              ))}
            </div>
          </div>

          {/* Action Buttons */}
          {showActions && (
            <div className="flex items-center gap-2 pt-2 border-t border-border/50">
              {onResolve && (
                <PremiumButton
                  size="sm"
                  variant="outline"
                  className={cn(
                    "text-xs hover:border-primary hover:text-primary",
                    config.text
                  )}
                  onClick={() => onResolve(collision.id)}
                >
                  Suggest Resolution
                </PremiumButton>
              )}
              <PremiumButton
                size="sm"
                variant="ghost"
                className="text-xs text-muted-foreground hover:text-foreground"
                onClick={() => onDismiss?.(collision.id)}
              >
                Acknowledge
              </PremiumButton>
            </div>
          )}
        </div>

        {/* Animated pulse border for high severity */}
        {collision.severity === "high" && (
          <div className="absolute inset-0 rounded-lg border-2 border-status-blocked opacity-0 animate-pulse-glow" />
        )}
      </StealthCard>
    )
  }
)
CollisionAlert.displayName = "CollisionAlert"

interface CollisionSummaryProps extends React.HTMLAttributes<HTMLDivElement> {
  collisions: CollisionData[]
  title?: string
}

const CollisionSummary = React.forwardRef<HTMLDivElement, CollisionSummaryProps>(
  ({ className, collisions, title = "Active Collisions", ...props }, ref) => {
    const severityCounts = collisions.reduce((acc, collision) => {
      acc[collision.severity] = (acc[collision.severity] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const totalCollisions = collisions.length

    if (totalCollisions === 0) {
      return (
        <StealthCard
          ref={ref}
          className={cn("p-6 text-center", className)}
          {...props}
        >
          <div className="text-status-flow">
            <div className="w-12 h-12 rounded-full bg-status-flow-bg flex items-center justify-center mx-auto mb-3">
              ✓
            </div>
            <h3 className="font-medium text-foreground mb-1">No Collisions</h3>
            <p className="text-sm text-muted-foreground">
              All team members are working on separate tasks
            </p>
          </div>
        </StealthCard>
      )
    }

    return (
      <StealthCard
        ref={ref}
        className={cn("p-6 space-y-4", className)}
        {...props}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          <div className="text-warning flex items-center gap-1">
            <AlertTriangle className="w-4 h-4" />
            <span className="text-sm font-medium">{totalCollisions}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-status-blocked">
              {severityCounts.high || 0}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              High
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-slow">
              {severityCounts.medium || 0}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Medium
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-status-flow">
              {severityCounts.low || 0}
            </div>
            <div className="text-xs text-muted-foreground uppercase tracking-wider">
              Low
            </div>
          </div>
        </div>
      </StealthCard>
    )
  }
)
CollisionSummary.displayName = "CollisionSummary"

export { CollisionAlert, CollisionSummary, type CollisionData }