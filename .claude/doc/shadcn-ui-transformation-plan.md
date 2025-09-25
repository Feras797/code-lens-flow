# Code-Lens-Flow: Comprehensive shadcn/ui Transformation Plan

## Overview
Transform the Code-Lens-Flow project components into proper shadcn/ui components with consistent styling while maintaining the existing stealth black theme and functionality. The project already has a sophisticated design system in place, but needs better consistency and proper shadcn patterns.

## Current State Analysis

### Strengths
- ✅ **Sophisticated stealth black theme** implemented in `index.css`
- ✅ **Premium component variants** like `PremiumButton`, `StealthCard`, `StatusIndicator`
- ✅ **Comprehensive color system** with status colors, glass morphism, glow effects
- ✅ **Advanced Tailwind configuration** with custom animations and utilities
- ✅ **Consistent dark theme** aesthetic throughout

### Areas for Improvement
- 🔄 **Mixed component patterns** - Some components use direct Tailwind, others use proper shadcn variants
- 🔄 **Inconsistent spacing and padding** across similar components
- 🔄 **Non-standard prop patterns** - Some components don't follow shadcn conventions
- 🔄 **Missing component composition** - Some complex UI could use better component breakdown
- 🔄 **Inconsistent className usage** - Mix of direct classes and cn() utility usage

---

## Transformation Plan

### Phase 1: Foundation Components Enhancement

#### 1.1 Enhanced Card System
**File: `/src/components/ui/card.tsx`**

**Current Issues:**
- Basic shadcn card without premium variants
- Missing glass morphism integration
- No hover effects or glow variants

**Proposed Enhancement:**
```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border text-card-foreground transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-card border-border shadow-sm",
        elevated: "bg-card border-border shadow-lg hover:shadow-xl hover:border-border-hover hover:-translate-y-1",
        glass: "glass-morphism border-glass-border",
        glow: "bg-card border-border hover:glow-primary hover:border-primary/50",
        status: {
          flow: "bg-card border-status-flow/30 hover:glow-status-flow",
          slow: "bg-card border-status-slow/30 hover:glow-status-slow",
          blocked: "bg-card border-status-blocked/30 hover:glow-status-blocked"
        }
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8"
      },
      size: {
        default: "",
        compact: "max-w-sm",
        wide: "max-w-4xl",
        full: "w-full"
      }
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
      size: "default"
    }
  }
)

export interface CardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, padding, size, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, size, className }))}
      {...props}
    />
  )
)
Card.displayName = "Card"

// Enhanced header, title, description, content, footer with better spacing
const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex flex-col space-y-2 pb-4", className)}
      {...props}
    />
  )
)
CardHeader.displayName = "CardHeader"

const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h3
      ref={ref}
      className={cn(
        "text-xl font-semibold leading-none tracking-tight text-foreground",
        className
      )}
      {...props}
    />
  )
)
CardTitle.displayName = "CardTitle"

const CardDescription = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLParagraphElement>>(
  ({ className, ...props }, ref) => (
    <p
      ref={ref}
      className={cn("text-sm text-muted-foreground leading-relaxed", className)}
      {...props}
    />
  )
)
CardDescription.displayName = "CardDescription"

const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("text-foreground", className)}
      {...props}
    />
  )
)
CardContent.displayName = "CardContent"

const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("flex items-center justify-between pt-4 border-t border-border/50", className)}
      {...props}
    />
  )
)
CardFooter.displayName = "CardFooter"

export {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardDescription,
  CardContent,
  cardVariants
}
```

#### 1.2 Enhanced Button System
**File: `/src/components/ui/button.tsx`**

**Current Issues:**
- Standard shadcn button lacks premium effects
- Missing glow and glass variants
- No shimmer or pulse effects

**Proposed Enhancement:**
```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 relative overflow-hidden group",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground hover:bg-primary-hover hover:glow-primary hover:scale-105",
        secondary: "bg-muted text-muted-foreground hover:bg-muted-hover hover:text-foreground",
        destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90 hover:glow-destructive",
        outline: "border border-border bg-transparent hover:bg-hover-bg hover:border-primary hover:text-primary hover:glow-primary",
        ghost: "hover:bg-hover-bg hover:text-foreground",
        glass: "glass-morphism text-foreground hover:bg-glass-bg hover:glow-primary",
        status: {
          flow: "bg-status-flow text-white hover:glow-status-flow hover:scale-105",
          slow: "bg-status-slow text-white hover:glow-status-slow hover:scale-105",
          blocked: "bg-status-blocked text-white hover:glow-status-blocked hover:scale-105"
        }
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-11 rounded-lg px-8",
        xl: "h-14 rounded-xl px-10 text-base",
        icon: "h-10 w-10"
      },
      glow: {
        none: "",
        subtle: "hover:shadow-md",
        primary: "hover:glow-primary",
        accent: "hover:glow-accent"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "subtle"
    }
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  withShimmer?: boolean
  withPulse?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
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
          buttonVariants({ variant, size, glow, className }),
          withPulse && "animate-pulse-glow"
        )}
        ref={ref}
        {...props}
      >
        {children}

        {/* Shimmer effect */}
        {withShimmer && (
          <div className="absolute inset-0 -top-px bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover:animate-shimmer group-hover:opacity-100 rounded-lg" />
        )}

        {/* Focus glow */}
        <div className="absolute inset-0 rounded-lg opacity-0 group-focus-visible:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-primary/20 via-accent/20 to-primary/20 blur-sm -z-10" />
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
```

#### 1.3 Enhanced Badge System
**File: `/src/components/ui/badge.tsx`**

**Proposed Enhancement:**
```tsx
import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
  {
    variants: {
      variant: {
        default: "border-transparent bg-primary text-primary-foreground hover:bg-primary-hover hover:glow-primary",
        secondary: "border-transparent bg-muted text-muted-foreground hover:bg-muted-hover",
        destructive: "border-transparent bg-destructive text-destructive-foreground hover:glow-destructive",
        outline: "border-border text-foreground hover:bg-hover-bg",
        glass: "glass-morphism border-glass-border text-foreground hover:glow-primary",
        status: {
          flow: "border-transparent bg-status-flow text-white hover:glow-status-flow",
          slow: "border-transparent bg-status-slow text-white hover:glow-status-slow",
          blocked: "border-transparent bg-status-blocked text-white hover:glow-status-blocked",
          idle: "border-border bg-muted text-muted-foreground"
        }
      },
      size: {
        default: "px-2.5 py-0.5 text-xs",
        sm: "px-2 py-0.5 text-xs",
        lg: "px-3 py-1 text-sm"
      },
      withDot: {
        true: "",
        false: ""
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      withDot: false
    }
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {
  pulse?: boolean
}

function Badge({
  className,
  variant,
  size,
  withDot,
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  return (
    <div
      className={cn(
        badgeVariants({ variant, size, withDot, className }),
        pulse && "animate-pulse"
      )}
      {...props}
    >
      {withDot && (
        <div
          className={cn(
            "w-1.5 h-1.5 rounded-full",
            variant === "status" ? "bg-current" : "bg-current opacity-70"
          )}
        />
      )}
      {children}
    </div>
  )
}

export { Badge, badgeVariants }
```

---

### Phase 2: Dashboard Component Transformations

#### 2.1 Enhanced MetricCard
**File: `/src/components/dashboard/MetricCard.tsx`**

**Current Issues:**
- Basic styling without premium effects
- Fixed variant system
- Missing hover animations

**Proposed Transformation:**
```tsx
import { TrendingUp, TrendingDown } from 'lucide-react'
import { Card, CardContent, CardHeader, cardVariants } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { VariantProps } from 'class-variance-authority'

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
  withGlow?: boolean
  interactive?: boolean
}

export function MetricCard({
  title,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  withGlow = false,
  interactive = true
}: MetricCardProps) {
  const getVariantConfig = () => {
    switch (variant) {
      case 'warning':
        return {
          borderColor: 'border-status-slow/20 hover:border-status-slow/40',
          iconBg: 'bg-status-slow-bg',
          iconColor: 'text-status-slow',
          glowClass: withGlow ? 'hover:glow-status-slow' : ''
        }
      case 'success':
        return {
          borderColor: 'border-status-flow/20 hover:border-status-flow/40',
          iconBg: 'bg-status-flow-bg',
          iconColor: 'text-status-flow',
          glowClass: withGlow ? 'hover:glow-status-flow' : ''
        }
      case 'destructive':
        return {
          borderColor: 'border-status-blocked/20 hover:border-status-blocked/40',
          iconBg: 'bg-status-blocked-bg',
          iconColor: 'text-status-blocked',
          glowClass: withGlow ? 'hover:glow-status-blocked' : ''
        }
      default:
        return {
          borderColor: 'border-border hover:border-border-hover',
          iconBg: 'bg-muted',
          iconColor: 'text-primary',
          glowClass: withGlow ? 'hover:glow-primary' : ''
        }
    }
  }

  const config = getVariantConfig()

  return (
    <Card
      variant="elevated"
      className={cn(
        config.borderColor,
        config.glowClass,
        interactive && "cursor-pointer hover:scale-[1.02]",
        "transition-all duration-300"
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2.5 rounded-lg",
              config.iconBg,
              config.iconColor
            )}>
              {icon}
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">{title}</p>
            </div>
          </div>

          {trend && (
            <Badge
              variant={trend.isPositive ? "status.flow" : "destructive"}
              size="sm"
              withDot={false}
            >
              {trend.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              {trend.value}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="space-y-2">
          <div className="text-2xl font-bold text-foreground">
            {value}
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 2.2 Enhanced TeamActivityChart
**File: `/src/components/dashboard/TeamActivityChart.tsx`**

**Current Issues:**
- Basic card without premium styling
- Missing proper shadcn patterns

**Proposed Transformation:**
```tsx
import { Activity, BarChart3, Clock, Users } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ActivityData {
  time: string
  active: number
  idle: number
  blocked: number
}

export default function TeamActivityChart() {
  const activityData: ActivityData[] = [
    { time: '09:00', active: 8, idle: 2, blocked: 1 },
    { time: '10:00', active: 10, idle: 1, blocked: 2 },
    { time: '11:00', active: 12, idle: 0, blocked: 1 },
    { time: '12:00', active: 6, idle: 5, blocked: 2 },
    { time: '13:00', active: 4, idle: 7, blocked: 2 },
    { time: '14:00', active: 9, idle: 3, blocked: 1 },
    { time: '15:00', active: 11, idle: 1, blocked: 1 },
    { time: '16:00', active: 8, idle: 3, blocked: 2 }
  ]

  const currentStats = {
    totalActive: 11,
    totalTeam: 13,
    avgResolution: '1.2h',
    efficiency: 85
  }

  return (
    <Card variant="elevated" className="hover:glow-primary">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Team Activity Timeline
            </CardTitle>
            <CardDescription>
              Live development activity tracking across all team members
            </CardDescription>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="status.flow" withDot pulse>
              {currentStats.totalActive} Active
            </Badge>
            <Button variant="ghost" size="sm">
              <BarChart3 className="h-4 w-4" />
              View Details
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Activity Chart */}
        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Activity Distribution</span>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-flow" />
                <span className="text-xs text-muted-foreground">Flow State</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-slow" />
                <span className="text-xs text-muted-foreground">Problem Solving</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-status-blocked" />
                <span className="text-xs text-muted-foreground">Blocked</span>
              </div>
            </div>
          </div>

          {/* Activity Timeline */}
          <div className="grid grid-cols-8 gap-2">
            {activityData.map((data, index) => {
              const total = data.active + data.idle + data.blocked
              const activePercent = (data.active / total) * 100
              const idlePercent = (data.idle / total) * 100
              const blockedPercent = (data.blocked / total) * 100

              return (
                <div key={data.time} className="space-y-2">
                  <div className="h-24 bg-muted rounded-lg overflow-hidden flex flex-col justify-end">
                    {data.blocked > 0 && (
                      <div
                        className="bg-status-blocked transition-all duration-300 hover:glow-status-blocked"
                        style={{ height: `${blockedPercent}%` }}
                      />
                    )}
                    {data.idle > 0 && (
                      <div
                        className="bg-status-slow transition-all duration-300 hover:glow-status-slow"
                        style={{ height: `${idlePercent}%` }}
                      />
                    )}
                    {data.active > 0 && (
                      <div
                        className="bg-status-flow transition-all duration-300 hover:glow-status-flow"
                        style={{ height: `${activePercent}%` }}
                      />
                    )}
                  </div>
                  <div className="text-xs text-center text-muted-foreground">
                    {data.time}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Current Stats */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border/50">
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-status-flow">
              {currentStats.totalActive}
            </div>
            <div className="text-xs text-muted-foreground">Active Now</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-foreground">
              {currentStats.avgResolution}
            </div>
            <div className="text-xs text-muted-foreground">Avg Resolution</div>
          </div>
          <div className="text-center space-y-1">
            <div className="text-2xl font-bold text-primary">
              {currentStats.efficiency}%
            </div>
            <div className="text-xs text-muted-foreground">Efficiency</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
```

---

### Phase 3: Page Component Transformations

#### 3.1 Enhanced Dashboard Page
**File: `/src/pages/Dashboard.tsx`**

**Current Issues:**
- Mixed styling patterns
- Inconsistent button usage
- Non-standard spacing

**Key Transformation Areas:**
```tsx
import { useState } from 'react'
import { Users, AlertTriangle, TrendingUp, Clock, GitBranch, Zap, Activity } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import TeamActivityChart from '@/components/dashboard/TeamActivityChart'
import RecentCollisions from '@/components/dashboard/RecentCollisions'
import { MetricCard } from '@/components/dashboard/MetricCard'

function Dashboard() {
  const [activeTab, setActiveTab] = useState('resolve')

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Code Lens Flow
                </h1>
                <p className="text-muted-foreground text-lg max-w-2xl leading-relaxed">
                  AI-powered development team coordination through Claude Code chat analysis
                </p>
              </div>

              <Badge variant="glass" size="lg" withDot>
                <Zap className="w-4 h-4" />
                Live Development Insights
              </Badge>
            </div>

            <Button variant="glass" size="lg" withShimmer>
              <Activity className="w-4 h-4" />
              Refresh Data
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <MetricCard
            title="Active Developers"
            value={12}
            description="+2 from yesterday"
            trend={{ value: "+2", isPositive: true }}
            icon={<Users className="h-5 w-5" />}
            variant="success"
            withGlow
            interactive
          />
          {/* ... other metric cards with enhanced props */}
        </div>

        {/* Enhanced Quick Actions */}
        <Card variant="glass" padding="md">
          <CardHeader>
            <h2 className="text-xl font-semibold text-foreground">Quick Actions</h2>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Button
                variant={activeTab === 'resolve' ? 'default' : 'outline'}
                size="lg"
                onClick={() => setActiveTab('resolve')}
                className="justify-start h-auto p-6"
                withShimmer={activeTab === 'resolve'}
                glow="primary"
              >
                <Zap className="h-5 w-5" />
                <div className="text-left">
                  <p className="font-medium">Resolve Collision</p>
                  <p className="text-xs opacity-70">3 active conflicts</p>
                </div>
              </Button>
              {/* ... other action buttons */}
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <TeamActivityChart />
          </div>
          <div className="lg:col-span-1">
            <RecentCollisions />
          </div>
        </div>
      </main>
    </div>
  )
}

export default Dashboard
```

#### 3.2 Enhanced TeamStatus Page
**File: `/src/pages/TeamStatus.tsx`**

**Key Transformation Areas:**
- Replace direct styling with Card components
- Use proper Button variants
- Implement consistent Badge usage
- Add proper spacing with Card padding variants

```tsx
import { AlertTriangle, Users, Clock, FileCode, GitPullRequest, Activity, MessageSquare, GitBranch, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function TeamStatus() {
  const [expandedDevs, setExpandedDevs] = useState<Set<number>>(new Set([1, 2]))

  // ... existing interfaces and data ...

  return (
    <div className="min-h-screen bg-background">
      {/* Enhanced Header */}
      <header className="border-b border-border bg-card/30 backdrop-blur-xl">
        <div className="container mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-foreground tracking-tight">
                Live Team Status Board
              </h1>
              <p className="text-muted-foreground text-lg max-w-3xl leading-relaxed">
                Real-time visibility into what every developer is working on, extracted from Claude Code conversations
              </p>
            </div>
            <Button variant="glass" size="lg" withPulse>
              <Activity className="w-4 h-4" />
              Auto-refresh
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 space-y-8">
        {/* Enhanced Collisions Section */}
        {collisions.length > 0 && (
          <Card variant="glow" className="border-status-blocked/30">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-status-blocked">
                <AlertTriangle className="h-5 w-5" />
                Active Collisions
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {collisions.map((collision, index) => (
                <Card key={index} variant="elevated" padding="md">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 space-y-3">
                      <div className="flex items-center gap-3">
                        <Badge variant="destructive" withDot>
                          {collision.type}
                        </Badge>
                        <Badge variant="outline" size="sm">
                          {collision.severity}
                        </Badge>
                      </div>

                      <div className="space-y-2">
                        <p className="text-sm font-medium text-foreground">
                          {collision.detail}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {collision.message}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Involved:</span>
                        <div className="flex gap-1">
                          {collision.affected.map((person, i) => (
                            <Badge key={i} variant="secondary" size="sm">
                              {person}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      <div className="flex gap-2">
                        <Button variant="default" size="sm">
                          {collision.suggestion}
                        </Button>
                        <Button variant="outline" size="sm">
                          {collision.acknowledge}
                        </Button>
                      </div>
                    </div>
                    <Button variant="ghost" size="icon">
                      ✕
                    </Button>
                  </div>
                </Card>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Enhanced Status Legend */}
        <Card variant="glass" padding="md">
          <CardContent>
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <CardTitle>Team Status - E-Commerce Platform</CardTitle>

              <div className="flex flex-wrap gap-4">
                <Badge variant="status.flow" withDot size="lg">
                  Flow State - Quick solutions, steady progress
                </Badge>
                <Badge variant="status.slow" withDot size="lg">
                  Problem Solving - Multiple iterations, debugging
                </Badge>
                <Badge variant="status.blocked" withDot size="lg">
                  Blocked - Extended time, needs help
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Developer Cards */}
        <Card variant="elevated" padding="lg">
          <CardContent className="space-y-6">
            {developers.map((dev, index) => (
              <div key={dev.id} className="space-y-4">
                {/* Enhanced Developer Header */}
                <Button
                  variant="ghost"
                  onClick={() => toggleDeveloper(dev.id)}
                  className="w-full justify-between p-6 h-auto text-left hover:bg-hover-bg"
                >
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-full bg-card border-2 border-border flex items-center justify-center text-sm font-medium">
                      {dev.avatar}
                    </div>

                    <div className="flex-1 space-y-2">
                      <div className="flex items-center gap-3">
                        <h3 className="font-semibold text-foreground text-lg">{dev.name}</h3>
                        <Badge
                          variant={`status.${dev.status}`}
                          withDot
                          pulse={dev.status === 'flow'}
                        >
                          {getStatusText(dev.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground max-w-2xl leading-relaxed">
                        {dev.currentContext}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-6">
                    <div className="flex items-center gap-4">
                      <Badge variant="secondary" size="sm">
                        <MessageSquare className="h-3 w-3" />
                        {dev.totalMessages}
                      </Badge>
                      <Badge variant="secondary" size="sm">
                        <GitBranch className="h-3 w-3" />
                        {dev.totalCommits}
                      </Badge>
                      <Badge variant="outline" size="sm">
                        {dev.workItems.length} tasks
                      </Badge>
                    </div>

                    {expandedDevs.has(dev.id) ? (
                      <ChevronUp className="h-5 w-5" />
                    ) : (
                      <ChevronDown className="h-5 w-5" />
                    )}
                  </div>
                </Button>

                {/* Enhanced Work Items */}
                {expandedDevs.has(dev.id) && (
                  <div className="ml-16 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {dev.workItems.map((item) => (
                      <Card
                        key={item.id}
                        variant="default"
                        padding="md"
                        className={cn(
                          "border-l-4 hover:scale-[1.02] transition-all duration-200",
                          item.priority === 'high' && "border-l-status-blocked",
                          item.priority === 'medium' && "border-l-status-slow",
                          item.priority === 'low' && "border-l-status-flow"
                        )}
                      >
                        <div className="space-y-3">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-foreground">{item.task}</h4>
                            <Badge
                              variant={
                                item.priority === 'high' ? 'destructive' :
                                item.priority === 'medium' ? 'outline' :
                                'secondary'
                              }
                              size="sm"
                            >
                              {item.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground leading-relaxed">
                            {item.chatContext}
                          </p>

                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <FileCode className="h-3 w-3" />
                            <code className="font-mono">{item.file}</code>
                          </div>

                          <div className="flex items-center justify-between pt-2 border-t border-border/50">
                            <div className="flex items-center gap-3 text-xs text-muted-foreground">
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {item.duration}
                              </div>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                {item.messages}
                              </div>
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                {item.commits}
                              </div>
                            </div>
                          </div>
                        </div>
                      </Card>
                    ))}
                  </div>
                )}

                {/* Enhanced Separator */}
                {index < developers.length - 1 && (
                  <div className="border-b border-border/30" />
                )}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Enhanced Smart Assistance */}
        <Card variant="glass" padding="md">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-primary" />
              Smart Assistance
            </CardTitle>
            <CardDescription>
              When someone is stuck, the system identifies similar problems solved by teammates and suggests connections
            </CardDescription>
          </CardHeader>
        </Card>
      </main>
    </div>
  )
}

export default TeamStatus
```

---

### Phase 4: Section Component Enhancements

#### 4.1 Enhanced Section Components Pattern
**Files: `/src/components/sections/*.tsx`**

**Common Transformation Pattern:**
```tsx
// Example: Enhanced PersonalInsights.tsx
import { Brain, TrendingUp, Clock, Target, Lightbulb, Activity } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Insight {
  id: string
  type: 'pattern' | 'suggestion' | 'achievement'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  actionable: boolean
}

export default function PersonalInsights() {
  const insights: Insight[] = [
    {
      id: '1',
      type: 'pattern',
      title: 'Peak Performance Hours',
      description: 'You achieve flow state most effectively between 9-11 AM',
      impact: 'high',
      actionable: true
    },
    {
      id: '2',
      type: 'suggestion',
      title: 'Context Switch Reduction',
      description: 'Batching similar tasks could improve your focus by 34%',
      impact: 'medium',
      actionable: true
    }
    // ... more insights
  ]

  const getInsightIcon = (type: string) => {
    switch (type) {
      case 'pattern': return <TrendingUp className="h-4 w-4" />
      case 'suggestion': return <Lightbulb className="h-4 w-4" />
      case 'achievement': return <Target className="h-4 w-4" />
      default: return <Activity className="h-4 w-4" />
    }
  }

  const getImpactVariant = (impact: string) => {
    switch (impact) {
      case 'high': return 'status.blocked'
      case 'medium': return 'status.slow'
      case 'low': return 'status.flow'
      default: return 'secondary'
    }
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Header */}
      <Card variant="glass" padding="md">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            Personal Development Insights
          </CardTitle>
          <CardDescription>
            AI-powered analysis of your coding patterns, productivity trends, and growth opportunities
          </CardDescription>
        </CardHeader>
      </Card>

      {/* Enhanced Insights Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {insights.map((insight) => (
          <Card
            key={insight.id}
            variant="elevated"
            className="hover:scale-[1.02] transition-all duration-300"
          >
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getInsightIcon(insight.type)}
                  <Badge variant="outline" size="sm">
                    {insight.type}
                  </Badge>
                </div>
                <Badge variant={getImpactVariant(insight.impact)} size="sm">
                  {insight.impact} impact
                </Badge>
              </div>
              <CardTitle className="text-lg">{insight.title}</CardTitle>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground leading-relaxed">
                {insight.description}
              </p>

              {insight.actionable && (
                <Button variant="outline" size="sm" className="w-full">
                  <Target className="h-3 w-3" />
                  Apply Insight
                </Button>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
```

---

### Phase 5: Utility and Layout Enhancements

#### 5.1 Enhanced Layout Component
**File: `/src/components/Layout.tsx`**

**Current Issues:**
- Basic layout without premium styling
- Missing proper shadcn navigation patterns

**Proposed Enhancement:**
```tsx
import { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface LayoutProps {
  children: ReactNode
  className?: string
  variant?: 'default' | 'glass' | 'minimal'
}

export default function Layout({
  children,
  className,
  variant = 'default'
}: LayoutProps) {
  return (
    <div className={cn(
      "min-h-screen bg-background",
      variant === 'glass' && "bg-gradient-to-br from-background via-background-subtle to-background",
      className
    )}>
      {variant === 'glass' && (
        <div className="fixed inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 pointer-events-none" />
      )}

      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
```

#### 5.2 Enhanced Sidebar Component
**File: `/src/components/ui/sidebar.tsx`**

**Ensure proper shadcn sidebar patterns:**
```tsx
// Enhanced to use proper shadcn/ui sidebar patterns with premium styling
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { cn } from "@/lib/utils"

// ... enhanced sidebar implementation with glass morphism and premium effects
```

---

## Implementation Priority & Timeline

### Phase 1: Foundation (Week 1)
1. **Enhanced Card System** - Transform base card with variants
2. **Enhanced Button System** - Add premium effects and variants
3. **Enhanced Badge System** - Status variants and animations

### Phase 2: Dashboard Components (Week 2)
1. **MetricCard Enhancement** - Add glow effects and better variants
2. **TeamActivityChart** - Proper shadcn patterns
3. **RecentCollisions** - Consistent styling

### Phase 3: Page Transformations (Week 3)
1. **Dashboard Page** - Apply new component patterns
2. **TeamStatus Page** - Enhanced cards and interactions
3. **Other Pages** - Apply consistent patterns

### Phase 4: Section Components (Week 4)
1. **All Section Components** - Consistent Card usage
2. **Layout Components** - Premium variants
3. **Testing & Polish** - Cross-browser verification

---

## Quality Assurance Checklist

### Consistency Checks
- ✅ All components use `cn()` utility for className merging
- ✅ Consistent color system usage across components
- ✅ Proper TypeScript types for all component props
- ✅ Consistent spacing using design system tokens
- ✅ All interactive elements have proper hover/focus states

### Performance Checks
- ✅ Animations use `transform` and `opacity` for performance
- ✅ Proper component memoization where needed
- ✅ Efficient re-render patterns
- ✅ Optimized bundle size impact

### Accessibility Checks
- ✅ ARIA labels and roles properly implemented
- ✅ Keyboard navigation support
- ✅ Screen reader compatibility
- ✅ Color contrast compliance
- ✅ Focus management

### Responsive Design
- ✅ Mobile-first responsive patterns
- ✅ Proper breakpoint usage
- ✅ Touch-friendly interactive elements
- ✅ Consistent behavior across screen sizes

---

## Benefits of This Transformation

### Developer Experience
- **Consistent API** - All components follow shadcn/ui conventions
- **Better TypeScript** - Proper types with VariantProps
- **Easier Maintenance** - Centralized styling logic
- **Better Composition** - Proper component breakdown

### User Experience
- **Premium Feel** - Glass morphism and glow effects
- **Smooth Interactions** - Consistent animations
- **Better Visual Hierarchy** - Proper component variants
- **Responsive Design** - Works across all devices

### Technical Benefits
- **Performance** - Optimized animations and rendering
- **Accessibility** - WCAG compliance throughout
- **Maintainability** - Consistent patterns and structure
- **Scalability** - Easy to extend and modify

This comprehensive transformation plan maintains the existing sophisticated stealth black theme while ensuring all components follow proper shadcn/ui patterns and best practices.