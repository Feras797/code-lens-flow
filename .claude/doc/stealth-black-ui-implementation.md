# Stealth Black UI System Implementation Plan
## Lense Analytics - Modern Analytics Platform Transformation

### Overview
Transform Lense Analytics from a basic light theme to a sophisticated stealth black UI system that matches the visual quality of premium development tools like Linear, Vercel, and GitHub.

### Current State Analysis
- **Theme**: Currently using light theme with basic shadcn components
- **Color System**: Simple color palette with basic status indicators
- **Components**: Standard shadcn components without customization
- **Visual Effects**: Minimal styling with basic shadows and borders
- **Typography**: Standard font hierarchy without sophisticated spacing

### Target Aesthetic
- **Reference Design**: Linear, Vercel, GitHub (modern dev tool aesthetic)
- **Primary Feel**: Stealth black, premium, sophisticated
- **User Experience**: Clean, minimal, data-focused
- **Performance**: Smooth animations, responsive, accessible

---

## 1. Core Color System Implementation

### File: `/src/index.css`
**Replace entire color system with stealth black theme:**

```css
@layer base {
  :root {
    /* Stealth Black Foundation */
    --background: 0 0% 3%;           /* #080808 - Deep black */
    --foreground: 0 0% 98%;          /* #fafafa - Pure white text */

    /* Surface Hierarchy */
    --card: 0 0% 6%;                 /* #0f0f0f - Card backgrounds */
    --card-foreground: 0 0% 95%;     /* #f2f2f2 - Card text */
    --surface-elevated: 0 0% 9%;     /* #171717 - Elevated surfaces */
    --surface-hover: 0 0% 12%;       /* #1f1f1f - Hover states */

    /* Premium Accent System */
    --primary: 217 91% 60%;          /* #3b82ff - Sophisticated blue */
    --primary-foreground: 0 0% 100%; /* #ffffff - White on blue */
    --primary-hover: 217 91% 55%;    /* Darker blue for hover */
    --primary-glow: 217 91% 60%;     /* Glow effect color */

    /* Secondary Accent */
    --secondary: 262 83% 69%;        /* #8b5cf6 - Elite purple */
    --secondary-foreground: 0 0% 100%;
    --secondary-hover: 262 83% 64%;

    /* Status Color System */
    --status-flow: 158 64% 52%;      /* #10b981 - Emerald flow */
    --status-slow: 43 96% 56%;       /* #f59e0b - Amber slow */
    --status-blocked: 0 84% 60%;     /* #ef4444 - Red blocked */
    --status-flow-bg: 158 64% 8%;    /* Dark emerald background */
    --status-slow-bg: 43 96% 8%;     /* Dark amber background */
    --status-blocked-bg: 0 84% 8%;   /* Dark red background */

    /* Text Hierarchy */
    --text-primary: 0 0% 100%;       /* #ffffff - Headings */
    --text-secondary: 0 0% 85%;      /* #d4d4d8 - Body text */
    --text-muted: 0 0% 65%;          /* #a1a1aa - Metadata */
    --text-subtle: 0 0% 45%;         /* #737373 - Subtle text */

    /* Border & Separator System */
    --border: 0 0% 15%;              /* #262626 - Primary borders */
    --border-hover: 0 0% 20%;        /* #333333 - Hover borders */
    --border-accent: 217 91% 60%;    /* Accent borders */
    --separator: 0 0% 12%;           /* #1f1f1f - Subtle separators */

    /* Glass Morphism */
    --glass-bg: rgba(255, 255, 255, 0.03);
    --glass-border: rgba(255, 255, 255, 0.08);
    --glass-hover: rgba(255, 255, 255, 0.05);

    /* Shadow System */
    --shadow-sm: 0 1px 3px rgba(0, 0, 0, 0.3);
    --shadow-md: 0 4px 12px rgba(0, 0, 0, 0.4);
    --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.5);
    --shadow-xl: 0 16px 32px rgba(0, 0, 0, 0.6);

    /* Glow Effects */
    --glow-primary: 0 0 20px rgba(59, 130, 255, 0.3);
    --glow-success: 0 0 20px rgba(16, 185, 129, 0.3);
    --glow-warning: 0 0 20px rgba(245, 158, 11, 0.3);
    --glow-danger: 0 0 20px rgba(239, 68, 68, 0.3);

    /* Design System Variables */
    --radius: 0.75rem;               /* 12px - Standard radius */
    --radius-sm: 0.5rem;             /* 8px - Small radius */
    --radius-lg: 1rem;               /* 16px - Large radius */
    --radius-xl: 1.25rem;            /* 20px - Extra large radius */
  }
}
```

### Additional CSS Classes:
```css
/* Glass Morphism Base Classes */
.glass-card {
  background: var(--glass-bg);
  border: 1px solid var(--glass-border);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
}

.glass-card:hover {
  background: var(--glass-hover);
  border-color: var(--border-hover);
}

/* Premium Glow Effects */
.glow-primary {
  box-shadow: var(--glow-primary);
}

.glow-on-hover:hover {
  box-shadow: var(--glow-primary);
  transition: box-shadow 0.3s ease;
}

/* Smooth Animations */
.smooth-transition {
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Status Indicators with Glow */
.status-flow {
  background: var(--status-flow);
  box-shadow: 0 0 12px rgba(16, 185, 129, 0.4);
}

.status-slow {
  background: var(--status-slow);
  box-shadow: 0 0 12px rgba(245, 158, 11, 0.4);
}

.status-blocked {
  background: var(--status-blocked);
  box-shadow: 0 0 12px rgba(239, 68, 68, 0.4);
}
```

---

## 2. Enhanced Component System

### File: `/src/components/ui/stealth-card.tsx`
**Create premium card component:**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const cardVariants = cva(
  "rounded-lg border text-card-foreground smooth-transition",
  {
    variants: {
      variant: {
        default: "bg-card border-border",
        glass: "glass-card",
        elevated: "bg-surface-elevated border-border-hover shadow-lg",
        glow: "bg-card border-border glow-on-hover",
      },
      padding: {
        none: "",
        sm: "p-4",
        md: "p-6",
        lg: "p-8",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "md",
    },
  }
)

export interface StealthCardProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof cardVariants> {}

const StealthCard = React.forwardRef<HTMLDivElement, StealthCardProps>(
  ({ className, variant, padding, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(cardVariants({ variant, padding, className }))}
      {...props}
    />
  )
)
StealthCard.displayName = "StealthCard"

const StealthCardHeader = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex flex-col space-y-1.5 pb-6", className)}
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
      "text-xl font-semibold leading-none tracking-tight text-text-primary",
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
    className={cn("text-sm text-text-muted", className)}
    {...props}
  />
))
StealthCardDescription.displayName = "StealthCardDescription"

const StealthCardContent = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("text-text-secondary", className)} {...props} />
))
StealthCardContent.displayName = "StealthCardContent"

const StealthCardFooter = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("flex items-center pt-6", className)}
    {...props}
  />
))
StealthCardFooter.displayName = "StealthCardFooter"

export {
  StealthCard,
  StealthCardHeader,
  StealthCardFooter,
  StealthCardTitle,
  StealthCardDescription,
  StealthCardContent,
}
```

### File: `/src/components/ui/status-indicator.tsx`
**Advanced status indicator system:**

```tsx
import * as React from "react"
import { cn } from "@/lib/utils"
import { cva, type VariantProps } from "class-variance-authority"

const statusIndicatorVariants = cva(
  "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium smooth-transition",
  {
    variants: {
      status: {
        flow: "status-flow text-white",
        slow: "status-slow text-white",
        blocked: "status-blocked text-white",
        idle: "bg-surface-elevated text-text-muted border border-border",
      },
      size: {
        sm: "text-xs px-2 py-0.5",
        md: "text-xs px-3 py-1",
        lg: "text-sm px-4 py-1.5",
      },
      variant: {
        solid: "",
        outlined: "bg-transparent",
        subtle: "bg-opacity-10 shadow-none",
      },
    },
    defaultVariants: {
      status: "idle",
      size: "md",
      variant: "solid",
    },
  }
)

export interface StatusIndicatorProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof statusIndicatorVariants> {
  pulse?: boolean
}

const StatusIndicator = React.forwardRef<HTMLDivElement, StatusIndicatorProps>(
  ({ className, status, size, variant, pulse = false, children, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        statusIndicatorVariants({ status, size, variant }),
        pulse && "animate-pulse",
        className
      )}
      {...props}
    >
      <div
        className={cn(
          "w-2 h-2 rounded-full",
          status === "flow" && "bg-white",
          status === "slow" && "bg-white",
          status === "blocked" && "bg-white",
          status === "idle" && "bg-text-muted"
        )}
      />
      {children}
    </div>
  )
)
StatusIndicator.displayName = "StatusIndicator"

export { StatusIndicator, statusIndicatorVariants }
```

### File: `/src/components/ui/premium-button.tsx`
**Enhanced button with glow effects:**

```tsx
import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const premiumButtonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium smooth-transition focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-primary text-primary-foreground shadow hover:bg-primary-hover glow-on-hover",
        destructive: "bg-destructive text-destructive-foreground shadow-sm hover:bg-destructive/90",
        outline: "border border-border bg-background shadow-sm hover:bg-surface-hover hover:text-accent-foreground",
        secondary: "bg-secondary text-secondary-foreground shadow-sm hover:bg-secondary-hover glow-on-hover",
        ghost: "hover:bg-surface-hover hover:text-accent-foreground",
        link: "text-primary underline-offset-4 hover:underline",
        glass: "glass-card hover:bg-glass-hover border-glass-border",
      },
      size: {
        default: "h-9 px-4 py-2",
        sm: "h-8 rounded-md px-3 text-xs",
        lg: "h-10 rounded-md px-8",
        icon: "h-9 w-9",
      },
      glow: {
        none: "",
        primary: "hover:shadow-[0_0_20px_rgba(59,130,255,0.3)]",
        secondary: "hover:shadow-[0_0_20px_rgba(139,92,246,0.3)]",
        success: "hover:shadow-[0_0_20px_rgba(16,185,129,0.3)]",
        warning: "hover:shadow-[0_0_20px_rgba(245,158,11,0.3)]",
        danger: "hover:shadow-[0_0_20px_rgba(239,68,68,0.3)]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
      glow: "none",
    },
  }
)

export interface PremiumButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof premiumButtonVariants> {
  asChild?: boolean
}

const PremiumButton = React.forwardRef<HTMLButtonElement, PremiumButtonProps>(
  ({ className, variant, size, glow, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(premiumButtonVariants({ variant, size, glow, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
PremiumButton.displayName = "PremiumButton"

export { PremiumButton, premiumButtonVariants }
```

---

## 3. Dashboard Component Updates

### File: `/src/components/Dashboard.tsx`
**Transform to stealth black theme:**

```tsx
import { useState } from 'react';
import { RefreshCw, AlertTriangle, Activity, Users, Zap } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { ProjectCard } from '@/components/ProjectCard';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { StealthCard } from '@/components/ui/stealth-card';
import { mockProjects } from '@/data/mockData';
import { Project } from '@/types';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
}

export function Dashboard({ onProjectSelect }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projects] = useState<Project[]>(mockProjects);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const totalActive = projects.reduce((sum, p) => sum + p.statusDistribution.active, 0);
  const totalCollisions = projects.filter(p => p.hasCollisions).length;
  const totalProjects = projects.length;

  return (
    <div className="min-h-screen bg-background">
      {/* Sophisticated Header */}
      <header className="border-b border-border bg-card/50 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold text-text-primary tracking-tight">
                  Lense Analytics
                </h1>
                <p className="text-text-secondary text-lg max-w-2xl">
                  AI-powered development team coordination through Claude Code chat analysis
                </p>
              </div>

              {/* Core Data Model Explanation */}
              <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm border border-primary/20">
                <Zap className="w-4 h-4" />
                <span>Extracts semantic understanding from isolated conversations to reconstruct team dynamics</span>
              </div>
            </div>

            <div className="flex items-center gap-6">
              {/* Stats Overview */}
              <div className="flex items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-status-flow shadow-[0_0_8px_rgba(16,185,129,0.4)]"></div>
                  <div className="text-sm">
                    <span className="text-text-primary font-medium">{totalActive}</span>
                    <span className="text-text-muted ml-1">Active</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Users className="w-4 h-4 text-text-muted" />
                  <div className="text-sm">
                    <span className="text-text-primary font-medium">{totalProjects}</span>
                    <span className="text-text-muted ml-1">Projects</span>
                  </div>
                </div>

                {totalCollisions > 0 && (
                  <div className="flex items-center gap-3 text-status-blocked">
                    <AlertTriangle className="w-4 h-4" />
                    <div className="text-sm">
                      <span className="font-medium">{totalCollisions}</span>
                      <span className="ml-1">Collision{totalCollisions > 1 ? 's' : ''}</span>
                    </div>
                  </div>
                )}
              </div>

              <PremiumButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                variant="glass"
                size="default"
                glow="primary"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh Data
              </PremiumButton>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Indicator */}
      {isRefreshing && (
        <div className="h-1 bg-surface-elevated">
          <div className="h-full bg-gradient-to-r from-primary via-secondary to-primary bg-[length:200%_100%] animate-[gradient_2s_ease-in-out_infinite]"></div>
        </div>
      )}

      {/* Main Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectSelect(project)}
              className="transform hover:scale-[1.02] smooth-transition"
            />
          ))}
        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <StealthCard variant="glass" className="max-w-md mx-auto">
              <div className="p-8">
                <div className="w-16 h-16 bg-surface-elevated rounded-full flex items-center justify-center mx-auto mb-6 border border-border">
                  <Activity className="w-8 h-8 text-text-muted" />
                </div>
                <h3 className="text-xl font-semibold text-text-primary mb-3">
                  No Projects Yet
                </h3>
                <p className="text-text-muted leading-relaxed">
                  Chat history will appear here after your first development session with Claude Code
                </p>
              </div>
            </StealthCard>
          </div>
        )}
      </main>
    </div>
  );
}
```

---

## 4. Project Card Enhancement

### File: `/src/components/ProjectCard.tsx`
**Redesign with glass morphism and glow effects:**

```tsx
import { Clock, Users, AlertTriangle, Activity, ArrowRight } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { PremiumButton } from '@/components/ui/premium-button';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
  className?: string;
}

export function ProjectCard({ project, onClick, className }: ProjectCardProps) {
  const { statusDistribution } = project;
  const totalActivity = statusDistribution.active + statusDistribution.idle + statusDistribution.blocked;

  // Calculate activity percentage for progress visualization
  const activityPercentage = totalActivity > 0 ? (statusDistribution.active / totalActivity) * 100 : 0;

  return (
    <StealthCard
      variant="glass"
      padding="none"
      className={cn(
        "group cursor-pointer border-border hover:border-border-hover overflow-hidden",
        project.hasCollisions && "border-status-blocked/30 hover:border-status-blocked/50",
        className
      )}
      onClick={onClick}
    >
      {/* Header Section */}
      <div className="p-6 pb-4">
        <div className="flex items-start justify-between mb-4">
          <div className="space-y-2">
            <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary smooth-transition">
              {project.name}
            </h3>
            <p className="text-sm text-text-muted line-clamp-2">
              {project.description}
            </p>
          </div>

          {project.hasCollisions && (
            <div className="flex-shrink-0">
              <AlertTriangle className="w-5 h-5 text-status-blocked" />
            </div>
          )}
        </div>

        {/* Status Indicators */}
        <div className="flex items-center gap-2 mb-4">
          <StatusIndicator
            status={statusDistribution.active > 0 ? "flow" : statusDistribution.blocked > 0 ? "blocked" : "slow"}
            size="sm"
            pulse={statusDistribution.active > 0}
          >
            {statusDistribution.active > 0 ? "In Flow" : statusDistribution.blocked > 0 ? "Blocked" : "Slow"}
          </StatusIndicator>

          <div className="flex items-center gap-1 text-xs text-text-muted">
            <Users className="w-3 h-3" />
            <span>{project.teamMembers.length}</span>
          </div>
        </div>

        {/* Activity Progress Bar */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-between text-xs">
            <span className="text-text-muted">Team Activity</span>
            <span className="text-text-secondary font-medium">{Math.round(activityPercentage)}%</span>
          </div>
          <div className="h-1.5 bg-surface-elevated rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-status-flow to-primary smooth-transition"
              style={{ width: `${activityPercentage}%` }}
            />
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 text-center">
          <div className="space-y-1">
            <div className="text-lg font-semibold text-status-flow">
              {statusDistribution.active}
            </div>
            <div className="text-xs text-text-muted">Active</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-status-slow">
              {statusDistribution.idle}
            </div>
            <div className="text-xs text-text-muted">Idle</div>
          </div>
          <div className="space-y-1">
            <div className="text-lg font-semibold text-status-blocked">
              {statusDistribution.blocked}
            </div>
            <div className="text-xs text-text-muted">Blocked</div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="px-6 py-4 border-t border-border/50 bg-surface-elevated/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-text-muted">
            <Clock className="w-3 h-3" />
            <span>Updated {project.lastActivity}</span>
          </div>

          <PremiumButton
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 smooth-transition"
          >
            <span>View Details</span>
            <ArrowRight className="w-3 h-3" />
          </PremiumButton>
        </div>
      </div>

      {/* Collision Warning Overlay */}
      {project.hasCollisions && (
        <div className="absolute top-2 right-2">
          <div className="w-3 h-3 bg-status-blocked rounded-full animate-pulse shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
        </div>
      )}
    </StealthCard>
  );
}
```

---

## 5. Additional CSS Animations

### Add to `/src/index.css`:

```css
/* Advanced Animation System */
@keyframes gradient {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

@keyframes pulse-glow {
  0%, 100% { box-shadow: 0 0 8px rgba(59, 130, 255, 0.3); }
  50% { box-shadow: 0 0 16px rgba(59, 130, 255, 0.6); }
}

@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}

/* Utility Classes */
.animate-gradient {
  animation: gradient 3s ease-in-out infinite;
}

.animate-pulse-glow {
  animation: pulse-glow 2s ease-in-out infinite;
}

.shimmer {
  background: linear-gradient(
    90deg,
    transparent,
    rgba(255, 255, 255, 0.05),
    transparent
  );
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

/* Micro-interactions */
.scale-on-press:active {
  transform: scale(0.98);
}

.lift-on-hover:hover {
  transform: translateY(-2px);
}

/* Custom Scrollbars */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: hsl(var(--surface-elevated));
}

::-webkit-scrollbar-thumb {
  background: hsl(var(--border));
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: hsl(var(--border-hover));
}
```

---

## 6. Tailwind Configuration Updates

### File: `/tailwind.config.ts`
**Add new color variables and utilities:**

```ts
extend: {
  colors: {
    // ... existing colors ...

    /* New Stealth Black System */
    'surface-elevated': 'hsl(var(--surface-elevated))',
    'surface-hover': 'hsl(var(--surface-hover))',
    'text-primary': 'hsl(var(--text-primary))',
    'text-secondary': 'hsl(var(--text-secondary))',
    'text-muted': 'hsl(var(--text-muted))',
    'text-subtle': 'hsl(var(--text-subtle))',
    'border-hover': 'hsl(var(--border-hover))',
    'border-accent': 'hsl(var(--border-accent))',
    'separator': 'hsl(var(--separator))',
  },

  boxShadow: {
    'glow-sm': '0 0 8px rgba(59, 130, 255, 0.3)',
    'glow-md': '0 0 16px rgba(59, 130, 255, 0.4)',
    'glow-lg': '0 0 24px rgba(59, 130, 255, 0.5)',
    'glow-success': '0 0 16px rgba(16, 185, 129, 0.4)',
    'glow-warning': '0 0 16px rgba(245, 158, 11, 0.4)',
    'glow-danger': '0 0 16px rgba(239, 68, 68, 0.4)',
  },

  animation: {
    'gradient': 'gradient 3s ease-in-out infinite',
    'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
    'shimmer': 'shimmer 1.5s infinite',
  },

  backdropBlur: {
    xs: '2px',
  },
}
```

---

## 7. Implementation Order

### Phase 1: Foundation
1. Update `/src/index.css` with stealth black color system
2. Update `/tailwind.config.ts` with new utilities
3. Test basic theme application

### Phase 2: Enhanced Components
1. Create `/src/components/ui/stealth-card.tsx`
2. Create `/src/components/ui/status-indicator.tsx`
3. Create `/src/components/ui/premium-button.tsx`

### Phase 3: Dashboard Transformation
1. Update `/src/components/Dashboard.tsx`
2. Update `/src/components/ProjectCard.tsx`
3. Test responsive behavior

### Phase 4: Advanced Features
1. Add animation CSS to `/src/index.css`
2. Implement glass morphism effects
3. Add glow interactions
4. Performance optimization

### Phase 5: Polish & Testing
1. Cross-browser testing
2. Accessibility verification
3. Mobile responsiveness
4. Animation performance

---

## 8. Design Principles

### Visual Hierarchy
- **Primary**: White text (`#ffffff`) for main headings
- **Secondary**: Light gray (`#d4d4d8`) for body content
- **Muted**: Medium gray (`#a1a1aa`) for metadata
- **Subtle**: Dark gray (`#737373`) for least important content

### Spacing System
- **Micro**: 4px, 8px for component internals
- **Small**: 12px, 16px for related elements
- **Medium**: 24px, 32px for sections
- **Large**: 48px, 64px for major layout

### Interactive States
- **Hover**: Subtle glow and border brightening
- **Active**: Scale down (0.98x) with glow intensify
- **Focus**: Ring outline with accent color
- **Disabled**: Opacity reduction with pointer-events disabled

### Animation Guidelines
- **Duration**: 200-300ms for micro-interactions
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth feel
- **Performance**: Use `transform` and `opacity` for animations
- **Reduced Motion**: Respect user preferences

---

This implementation plan provides a complete transformation to a sophisticated stealth black UI system that will make Lense Analytics look like a premium, modern development analytics platform.