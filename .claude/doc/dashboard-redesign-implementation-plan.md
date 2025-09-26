# Dashboard Redesign Implementation Plan
## Dashboarde Analytics - Enhanced shadcn/ui Dashboard Components

### Overview
This plan outlines the systematic redesign of the Dashboard view using existing shadcn/ui components and the already-implemented stealth black UI system. The redesign focuses on creating beautiful, functional components that follow shadcn/ui best practices while maintaining current data structures and functionality.

---

## Current State Analysis

### Existing Assets ✅
- **Stealth Black UI System**: Comprehensive CSS variables and color system in `/src/index.css`
- **Enhanced Components**: StealthCard, StatusIndicator, PremiumButton, MetricDisplay already available
- **Complete shadcn/ui Library**: All core components (Card, Badge, Button, Table, Avatar, Alert, Tabs, Tooltip, Progress, Skeleton) installed
- **Dashboard Components**: TeamActivityChart, RecentCollisions, DeveloperStatus need enhancement

### Current Dashboard Structure
- **Main Dashboard**: `/src/pages/Dashboard.tsx` - Basic layout with header, quick actions, and component grid
- **TeamActivityChart**: Recharts line chart in basic card wrapper
- **RecentCollisions**: Simple collision list with basic styling
- **DeveloperStatus**: Table-based developer status without enhanced styling

---

## Implementation Strategy

### Phase 1: Enhanced Metric Cards Component

**File**: `/src/components/dashboard/MetricCards.tsx` (NEW)

Create a sophisticated metrics display using existing components:

```tsx
import { Users, AlertTriangle, TrendingUp, Activity, Zap, Clock } from 'lucide-react'
import { StealthCard, StealthCardHeader, StealthCardTitle, StealthCardContent } from '@/components/ui/stealth-card'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface MetricCardProps {
  title: string
  value: string | number
  change?: string
  changeType?: 'positive' | 'negative' | 'neutral'
  icon: React.ReactNode
  status?: 'flow' | 'slow' | 'blocked' | 'idle'
  trend?: 'up' | 'down' | 'stable'
}

const MetricCard = ({ title, value, change, changeType, icon, status, trend }: MetricCardProps) => (
  <StealthCard variant="glass" className="group hover:border-border-hover transition-all duration-300">
    <StealthCardContent className="p-6">
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="text-3xl font-bold text-foreground group-hover:text-primary transition-colors">
            {value}
          </p>
          {change && (
            <div className={cn(
              "flex items-center gap-1 text-sm",
              changeType === 'positive' && "text-status-flow",
              changeType === 'negative' && "text-status-blocked",
              changeType === 'neutral' && "text-muted-foreground"
            )}>
              {trend === 'up' && <TrendingUp className="h-3 w-3" />}
              {trend === 'down' && <TrendingUp className="h-3 w-3 rotate-180" />}
              <span>{change}</span>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            {icon}
          </div>
          {status && (
            <StatusIndicator
              status={status}
              size="sm"
              pulse={status === 'flow'}
              className="justify-center"
            />
          )}
        </div>
      </div>
    </StealthCardContent>
  </StealthCard>
)

export function MetricCards() {
  const metrics = [
    {
      title: "Active Developers",
      value: "12",
      change: "+2 from yesterday",
      changeType: "positive" as const,
      icon: <Users className="h-6 w-6 text-primary" />,
      status: "flow" as const,
      trend: "up" as const
    },
    {
      title: "Flow State",
      value: "68%",
      change: "+12% this week",
      changeType: "positive" as const,
      icon: <Zap className="h-6 w-6 text-primary" />,
      status: "flow" as const,
      trend: "up" as const
    },
    {
      title: "Active Collisions",
      value: "3",
      change: "2 resolved today",
      changeType: "neutral" as const,
      icon: <AlertTriangle className="h-6 w-6 text-primary" />,
      status: "blocked" as const,
      trend: "down" as const
    },
    {
      title: "Avg Session",
      value: "2.4h",
      change: "+0.3h vs last week",
      changeType: "positive" as const,
      icon: <Clock className="h-6 w-6 text-primary" />,
      status: "flow" as const,
      trend: "up" as const
    }
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {metrics.map((metric, index) => (
        <MetricCard key={index} {...metric} />
      ))}
    </div>
  )
}
```

### Phase 2: Enhanced Header Section

**File**: Update `/src/pages/Dashboard.tsx` header section

```tsx
{/* Enhanced Header */}
<div className="space-y-6">
  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h1 className="text-4xl font-bold text-foreground tracking-tight">
          Dashboard
        </h1>
        <Badge variant="outline" className="px-3 py-1 bg-status-flow/10 text-status-flow border-status-flow/20">
          <div className="h-2 w-2 rounded-full bg-status-flow animate-pulse mr-2" />
          Live Monitoring
        </Badge>
      </div>
      <p className="text-lg text-muted-foreground max-w-2xl">
        Real-time development team coordination through AI-powered chat analysis
      </p>
    </div>

    <div className="flex items-center gap-4">
      <div className="flex items-center gap-6 text-sm">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-status-flow glow-status-flow" />
          <span className="text-foreground font-medium">12 Active</span>
        </div>
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-foreground font-medium">5 Teams</span>
        </div>
      </div>

      <PremiumButton
        variant="default"
        size="default"
        glow="primary"
        className="gap-2"
      >
        <RefreshCw className="h-4 w-4" />
        Refresh Data
      </PremiumButton>
    </div>
  </div>
</div>
```

### Phase 3: Enhanced Quick Actions

**File**: Update quick actions in `/src/pages/Dashboard.tsx`

```tsx
{/* Enhanced Quick Actions */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
  <PremiumButton
    variant="outline"
    size="lg"
    glow="danger"
    className="h-auto p-6 justify-start text-left group"
  >
    <div className="flex items-center gap-4 w-full">
      <div className="h-12 w-12 rounded-lg bg-status-blocked/10 flex items-center justify-center group-hover:bg-status-blocked/20 transition-colors">
        <Zap className="h-6 w-6 text-status-blocked" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-base font-medium text-foreground">Resolve Collision</p>
        <p className="text-sm text-muted-foreground">3 active conflicts detected</p>
        <Badge variant="destructive" className="w-fit">
          High Priority
        </Badge>
      </div>
    </div>
  </PremiumButton>

  <PremiumButton
    variant="outline"
    size="lg"
    glow="primary"
    className="h-auto p-6 justify-start text-left group"
  >
    <div className="flex items-center gap-4 w-full">
      <div className="h-12 w-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
        <Activity className="h-6 w-6 text-primary" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-base font-medium text-foreground">Personal Insights</p>
        <p className="text-sm text-muted-foreground">View your development patterns</p>
        <Badge variant="secondary" className="w-fit">
          Updated
        </Badge>
      </div>
    </div>
  </PremiumButton>

  <PremiumButton
    variant="outline"
    size="lg"
    glow="secondary"
    className="h-auto p-6 justify-start text-left group"
  >
    <div className="flex items-center gap-4 w-full">
      <div className="h-12 w-12 rounded-lg bg-accent/10 flex items-center justify-center group-hover:bg-accent/20 transition-colors">
        <GitBranch className="h-6 w-6 text-accent" />
      </div>
      <div className="flex-1 space-y-1">
        <p className="text-base font-medium text-foreground">Knowledge Base</p>
        <p className="text-sm text-muted-foreground">47 solutions available</p>
        <Badge variant="outline" className="w-fit">
          Searchable
        </Badge>
      </div>
    </div>
  </PremiumButton>
</div>
```

### Phase 4: Enhanced Team Activity Chart

**File**: Update `/src/components/dashboard/TeamActivityChart.tsx`

```tsx
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { StealthCard, StealthCardHeader, StealthCardTitle, StealthCardContent } from '@/components/ui/stealth-card'
import { Badge } from '@/components/ui/badge'
import { Activity, TrendingUp } from 'lucide-react'

// ... existing data ...

export default function TeamActivityChart() {
  return (
    <StealthCard variant="glass" className="h-full">
      <StealthCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Activity className="h-4 w-4 text-primary" />
            </div>
            <StealthCardTitle>Team Activity Timeline</StealthCardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <TrendingUp className="h-3 w-3" />
              +12% this week
            </Badge>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-6 mt-4">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-flow glow-status-flow" />
            <span className="text-sm text-muted-foreground">Flow State</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-slow glow-status-slow" />
            <span className="text-sm text-muted-foreground">Slow Progress</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded-full bg-status-blocked glow-status-blocked" />
            <span className="text-sm text-muted-foreground">Blocked</span>
          </div>
        </div>
      </StealthCardHeader>

      <StealthCardContent className="pt-6">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data}>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              strokeOpacity={0.3}
            />
            <XAxis
              dataKey="time"
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="hsl(var(--muted-foreground))"
              fontSize={12}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(var(--card))',
                border: '1px solid hsl(var(--border))',
                borderRadius: '12px',
                boxShadow: 'var(--shadow-lg)'
              }}
              labelStyle={{ color: 'hsl(var(--foreground))' }}
            />
            <Line
              type="monotone"
              dataKey="flow"
              stroke="hsl(var(--status-flow))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--status-flow))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--status-flow))' }}
            />
            <Line
              type="monotone"
              dataKey="slow"
              stroke="hsl(var(--status-slow))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--status-slow))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--status-slow))' }}
            />
            <Line
              type="monotone"
              dataKey="stuck"
              stroke="hsl(var(--status-blocked))"
              strokeWidth={3}
              dot={{ fill: 'hsl(var(--status-blocked))', strokeWidth: 0, r: 4 }}
              activeDot={{ r: 6, fill: 'hsl(var(--status-blocked))' }}
            />
          </LineChart>
        </ResponsiveContainer>
      </StealthCardContent>
    </StealthCard>
  )
}
```

### Phase 5: Enhanced Recent Collisions

**File**: Update `/src/components/dashboard/RecentCollisions.tsx`

```tsx
import { AlertTriangle, FileCode, Users, Clock, ChevronRight } from 'lucide-react'
import { StealthCard, StealthCardHeader, StealthCardTitle, StealthCardContent } from '@/components/ui/stealth-card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { PremiumButton } from '@/components/ui/premium-button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

// ... existing collisions data ...

export default function RecentCollisions() {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'warning'
      case 'low':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'file':
        return <FileCode className="h-4 w-4" />
      case 'feature':
        return <AlertTriangle className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  return (
    <StealthCard variant="glass" className="h-full">
      <StealthCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-status-blocked/10 flex items-center justify-center">
              <AlertTriangle className="h-4 w-4 text-status-blocked" />
            </div>
            <StealthCardTitle>Recent Collisions</StealthCardTitle>
          </div>
          <Badge variant="outline" className="text-xs">
            Last 24h
          </Badge>
        </div>
      </StealthCardHeader>

      <StealthCardContent className="space-y-4">
        {collisions.map((collision) => (
          <Alert key={collision.id} className="p-4 border-border hover:border-border-hover transition-colors group cursor-pointer">
            <div className="flex items-start gap-3">
              <div className={cn(
                "h-10 w-10 rounded-lg flex items-center justify-center border",
                collision.severity === 'high' && "bg-status-blocked/10 text-status-blocked border-status-blocked/20",
                collision.severity === 'medium' && "bg-status-slow/10 text-status-slow border-status-slow/20",
                collision.severity === 'low' && "bg-primary/10 text-primary border-primary/20"
              )}>
                {getTypeIcon(collision.type)}
              </div>

              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                      {collision.title}
                    </p>
                    <AlertDescription className="text-xs text-muted-foreground mt-1">
                      {collision.description}
                    </AlertDescription>
                  </div>
                  <Badge variant={getSeverityVariant(collision.severity)} className="text-xs">
                    {collision.severity}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="flex -space-x-1">
                      {collision.affected.slice(0, 3).map((person, index) => (
                        <Avatar key={index} className="h-6 w-6 border-2 border-card">
                          <AvatarFallback className="text-xs">
                            {person.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      ))}
                      {collision.affected.length > 3 && (
                        <div className="h-6 w-6 rounded-full bg-muted border-2 border-card flex items-center justify-center">
                          <span className="text-xs text-muted-foreground">
                            +{collision.affected.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {collision.affected.length} affected
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span>{collision.time}</span>
                  </div>
                </div>
              </div>

              <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
          </Alert>
        ))}

        <PremiumButton
          variant="ghost"
          className="w-full justify-center gap-2 mt-4"
          glow="primary"
        >
          <span>View All Collisions</span>
          <ChevronRight className="h-4 w-4" />
        </PremiumButton>
      </StealthCardContent>
    </StealthCard>
  )
}
```

### Phase 6: Enhanced Developer Status Table

**File**: Update `/src/components/dashboard/DeveloperStatus.tsx`

```tsx
import { Clock, FileCode, GitBranch, MessageSquare, MoreHorizontal } from 'lucide-react'
import { StealthCard, StealthCardHeader, StealthCardTitle, StealthCardContent } from '@/components/ui/stealth-card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { StatusIndicator } from '@/components/ui/status-indicator'
import { PremiumButton } from '@/components/ui/premium-button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

// ... existing developers data ...

export default function DeveloperStatus() {
  return (
    <StealthCard variant="glass">
      <StealthCardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Users className="h-4 w-4 text-primary" />
            </div>
            <StealthCardTitle>Live Team Status</StealthCardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="gap-1">
              <div className="h-2 w-2 rounded-full bg-status-flow animate-pulse" />
              5 Active
            </Badge>
            <PremiumButton variant="ghost" size="sm" glow="primary">
              View Details
            </PremiumButton>
          </div>
        </div>
      </StealthCardHeader>

      <StealthCardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="border-border hover:bg-transparent">
                <TableHead>Developer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Work</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Activity</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developers.map((dev) => (
                <TableRow
                  key={dev.id}
                  className={cn(
                    "border-border hover:bg-hover-bg transition-colors group",
                    dev.status === 'stuck' && "bg-status-blocked/5 hover:bg-status-blocked/10"
                  )}
                >
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className={cn(
                          "text-sm font-medium",
                          dev.status === 'flow' && "bg-status-flow/20 text-status-flow",
                          dev.status === 'slow' && "bg-status-slow/20 text-status-slow",
                          dev.status === 'stuck' && "bg-status-blocked/20 text-status-blocked"
                        )}>
                          {dev.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                          {dev.name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Developer
                        </p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell>
                    <StatusIndicator
                      status={dev.status}
                      size="sm"
                      pulse={dev.status === 'flow'}
                    >
                      {dev.status === 'flow' ? 'Flow' : dev.status === 'slow' ? 'Slow' : 'Stuck'}
                    </StatusIndicator>
                  </TableCell>

                  <TableCell>
                    <div className="max-w-[200px]">
                      <p className="text-sm text-foreground truncate">
                        {dev.currentWork}
                      </p>
                    </div>
                  </TableCell>

                  <TableCell>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <div className="flex items-center gap-2 max-w-[150px]">
                            <FileCode className="h-3 w-3 text-muted-foreground flex-shrink-0" />
                            <span className="text-sm text-muted-foreground font-mono truncate">
                              {dev.file}
                            </span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent side="top">
                          <p className="font-mono">{dev.file}</p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Clock className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">
                        {dev.duration}
                      </span>
                    </div>
                  </TableCell>

                  <TableCell>
                    <div className="flex items-center gap-3">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <MessageSquare className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {dev.messages}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{dev.messages} chat messages</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>

                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <div className="flex items-center gap-1">
                              <GitBranch className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground font-medium">
                                {dev.commits}
                              </span>
                            </div>
                          </TooltipTrigger>
                          <TooltipContent side="top">
                            <p>{dev.commits} commits today</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                  </TableCell>

                  <TableCell>
                    <PremiumButton
                      variant="ghost"
                      size="icon"
                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </PremiumButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </StealthCardContent>
    </StealthCard>
  )
}
```

### Phase 7: Updated Main Dashboard Layout

**File**: Complete update to `/src/pages/Dashboard.tsx`

```tsx
import { RefreshCw, Users, AlertTriangle, TrendingUp, Clock, GitBranch, Zap, Activity } from 'lucide-react'
import { StealthCard } from '@/components/ui/stealth-card'
import { PremiumButton } from '@/components/ui/premium-button'
import { Badge } from '@/components/ui/badge'
import TeamActivityChart from '@/components/dashboard/TeamActivityChart'
import RecentCollisions from '@/components/dashboard/RecentCollisions'
import DeveloperStatus from '@/components/dashboard/DeveloperStatus'
import { MetricCards } from '@/components/dashboard/MetricCards'

function Dashboard() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-6 space-y-8">
        {/* Enhanced Header Section */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <h1 className="text-4xl font-bold text-foreground tracking-tight">
                  Dashboard
                </h1>
                <Badge variant="outline" className="px-3 py-1 bg-status-flow/10 text-status-flow border-status-flow/20">
                  <div className="h-2 w-2 rounded-full bg-status-flow animate-pulse mr-2" />
                  Live Monitoring
                </Badge>
              </div>
              <p className="text-lg text-muted-foreground max-w-2xl">
                Real-time development team coordination through AI-powered chat analysis
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-2 w-2 rounded-full bg-status-flow glow-status-flow" />
                  <span className="text-foreground font-medium">12 Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-foreground font-medium">5 Teams</span>
                </div>
              </div>

              <PremiumButton
                variant="default"
                size="default"
                glow="primary"
                className="gap-2"
              >
                <RefreshCw className="h-4 w-4" />
                Refresh Data
              </PremiumButton>
            </div>
          </div>
        </div>

        {/* Enhanced Metric Cards */}
        <MetricCards />

        {/* Enhanced Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* ... Enhanced quick action buttons ... */}
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {/* Team Activity Chart - Takes 2 columns on xl screens */}
          <div className="xl:col-span-2">
            <TeamActivityChart />
          </div>

          {/* Recent Collisions - Takes 1 column */}
          <div className="xl:col-span-1">
            <RecentCollisions />
          </div>
        </div>

        {/* Enhanced Developer Status */}
        <DeveloperStatus />
      </div>
    </div>
  )
}

export default Dashboard
```

---

## Key Design Principles Applied

### 1. Component Hierarchy
- **StealthCard**: Primary container with glass morphism effects
- **StatusIndicator**: Consistent status display with pulse animations
- **PremiumButton**: Enhanced buttons with glow effects and micro-interactions
- **Badge**: Status and metadata display with proper color coding

### 2. Visual Consistency
- **Color System**: Leveraging the existing stealth black CSS variables
- **Typography**: Proper hierarchy with text-foreground, text-muted-foreground, etc.
- **Spacing**: Consistent gap-6, p-6, space-y-6 patterns
- **Animations**: Smooth transitions and hover effects

### 3. Accessibility Features
- **Tooltips**: Enhanced information display for truncated content
- **ARIA Labels**: Proper labeling for screen readers
- **Keyboard Navigation**: Focus management and tab order
- **Color Contrast**: High contrast ratios for text readability

### 4. Responsive Design
- **Mobile-First**: Proper grid breakpoints (md:, lg:, xl:)
- **Flexible Layouts**: Adaptive component sizing
- **Touch-Friendly**: Appropriate button sizes and spacing

---

## Implementation Order

1. **Create MetricCards component** - New dashboard metrics display
2. **Update Dashboard header** - Enhanced header with live monitoring
3. **Enhance quick actions** - Convert to PremiumButton components
4. **Update TeamActivityChart** - Wrap with StealthCard and enhance styling
5. **Update RecentCollisions** - Add Alert, Badge, Avatar components
6. **Update DeveloperStatus** - Convert to proper Table with Tooltips
7. **Update main Dashboard** - Integrate all enhanced components

## Expected Outcome

The redesigned dashboard will provide:
- **Professional Appearance**: Modern, sleek interface matching premium dev tools
- **Enhanced Usability**: Better information hierarchy and interaction patterns
- **Improved Performance**: Optimized component rendering and animations
- **Accessibility Compliance**: WCAG-compliant interface with proper navigation
- **Responsive Design**: Seamless experience across all device sizes

This implementation maintains all existing functionality while dramatically enhancing the user experience through proper shadcn/ui component usage and the existing stealth black design system.