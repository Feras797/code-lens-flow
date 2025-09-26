import * as React from "react"
import { cn } from "@/lib/utils"

interface StealthCardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "glass" | "glow"
  glow?: "primary" | "accent" | "status-flow" | "status-slow" | "status-blocked" | "none"
}

const StealthCard = React.forwardRef<HTMLDivElement, StealthCardProps>(
  ({ className, variant = "default", glow = "none", children, ...props }, ref) => {
    const baseStyles = "relative rounded-xl border transition-all duration-300 ease-smooth"

    const variants = {
      default: "bg-card border-card-border shadow-lg hover:shadow-xl hover:border-border-hover hover:-translate-y-1",
      glass: "glass-morphism hover:bg-glass-bg/95 hover:-translate-y-1 hover:shadow-2xl border-2",
      glow: "bg-card border-card-border shadow-xl hover:shadow-2xl hover:border-border-hover hover:-translate-y-2"
    }

    const glowStyles = {
      primary: "hover:glow-primary",
      accent: "hover:glow-accent",
      "status-flow": "hover:glow-status-flow",
      "status-slow": "hover:glow-status-slow",
      "status-blocked": "hover:glow-status-blocked",
      none: ""
    }

    return (
      <div
        ref={ref}
        className={cn(
          baseStyles,
          variants[variant],
          glow !== "none" && glowStyles[glow],
          "group",
          className
        )}
        {...props}
      >
        {children}

        {/* Enhanced shine effect on hover with animation */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl pointer-events-none" />
        {variant === 'glass' && (
          <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-accent/20 rounded-xl opacity-0 group-hover:opacity-30 blur transition-opacity duration-700" />
        )}
      </div>
    )
  }
)
StealthCard.displayName = "StealthCard"

const StealthCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 p-6", className)}
    {...props}
  />
))
StealthCardHeader.displayName = "StealthCardHeader"

const StealthCardTitle = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLHeadingElement>
>(({ className, ...props }, ref) => (
  <h3
    ref={ref}
    className={cn(
      "text-lg font-semibold leading-none tracking-tight text-foreground",
      className
    )}
    {...props}
  />
))
StealthCardTitle.displayName = "StealthCardTitle"

const StealthCardDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <p
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
StealthCardDescription.displayName = "StealthCardDescription"

const StealthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("p-6 pt-0", className)} {...props} />
))
StealthCardContent.displayName = "StealthCardContent"

const StealthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center p-6 pt-0", className)}
    {...props}
  />
))
StealthCardFooter.displayName = "StealthCardFooter"

export {
  StealthCard,
  StealthCardHeader,
  StealthCardTitle,
  StealthCardDescription,
  StealthCardContent,
  StealthCardFooter
}