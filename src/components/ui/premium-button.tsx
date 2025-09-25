import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const premiumButtonVariants = cva(
  "btn-premium relative inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover hover:glow-primary hover:scale-105",
        accent: "bg-accent text-accent-foreground hover:bg-accent/90 hover:glow-accent hover:scale-105",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:glow-destructive hover:scale-105",
        success: "bg-success text-success-foreground hover:bg-success/90 hover:glow-success hover:scale-105",
        outline: "border border-border-hover bg-transparent text-foreground hover:bg-hover-bg hover:border-primary hover:text-primary hover:glow-primary",
        secondary: "bg-muted text-muted-foreground hover:bg-muted-hover hover:text-foreground",
        ghost: "text-foreground hover:bg-hover-bg hover:text-foreground",
        glass: "glass-morphism text-foreground hover:bg-glass-bg/90 hover:glow-primary"
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10"
      },
      glow: {
        none: "",
        primary: "hover:glow-primary",
        accent: "hover:glow-accent",
        subtle: "hover:shadow-md"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "subtle"
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
  withShimmer?: boolean
  withPulse?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({
    className,
    variant,
    size,
    glow,
    asChild = false,
    withShimmer = false,
    withPulse = false,
    children,
    ...props
  }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          premiumButtonVariants({ variant, size, glow, className }),
          withPulse && "animate-pulse-glow",
          "group"
        )}
        ref={ref}
        {...props}
      >
        {children}

        {/* Shimmer effect */}
        {withShimmer && (
          <div className="absolute inset-0 -top-px -left-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100 rounded-lg" />
        )}

        {/* Enhanced glow on focus */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-focus-visible:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm -z-10" />
      </Comp>
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }