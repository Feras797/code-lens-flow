import React, { memo, useCallback, useMemo } from 'react'
import {
  GitCommit, Code, Bug, FileText, TestTube, Rocket, Brain, Users,
  Clock, Calendar, TrendingUp, AlertCircle, ChevronRight, Filter,
  Activity, Target, Zap, Award, ChevronDown, ChevronUp, RefreshCw,
  MessageSquare, Sparkles
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useStablePersonalInsights } from '@/hooks/useStablePersonalInsights'
import type { DevelopmentEvent } from '@/hooks/useDevelopmentTimeline'

interface StableDevelopmentTimelineProps {
  userId?: string
  projectId?: string
  className?: string
}

// Event type icons mapping
const EVENT_ICONS = {
  feature: Code,
  bug: Bug,
  refactor: Zap,
  documentation: FileText,
  testing: TestTube,
  deployment: Rocket,
  learning: Brain,
  collaboration: Users
} as const

// Impact color classes
const IMPACT_COLORS = {
  critical: 'text-red-500 border-red-500/30 bg-red-500/10',
  high: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  medium: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
  low: 'text-green-500 border-green-500/30 bg-green-500/10'
} as const

// Status icons and colors
const STATUS_CONFIGS = {
  completed: { icon: Award, color: 'text-green-500' },
  'in-progress': { icon: Activity, color: 'text-blue-500' },
  blocked: { icon: AlertCircle, color: 'text-red-500' },
  abandoned: { icon: ChevronRight, color: 'text-gray-500' }
} as const

// Memoized sub-components
const TimelineEvent = memo(function TimelineEvent({
  event,
  isExpanded,
  onToggle
}: {
  event: DevelopmentEvent
  isExpanded: boolean
  onToggle: () => void
}) {
  const Icon = EVENT_ICONS[event.type]
  const StatusConfig = STATUS_CONFIGS[event.status]

  return (
    <div
      className={cn(
        'border rounded-lg transition-all hover:bg-background/30',
        isExpanded ? 'border-primary/30' : 'border-border'
      )}
    >
      {/* Event header */}
      <div className='p-4 cursor-pointer' onClick={onToggle}>
        <div className='flex items-start gap-3'>
          {/* Event icon */}
          <div className={cn(
            'flex items-center justify-center w-10 h-10 rounded-lg border',
            IMPACT_COLORS[event.impact]
          )}>
            <Icon className='w-5 h-5' />
          </div>

          {/* Event details */}
          <div className='flex-1 min-w-0'>
            <div className='flex items-start justify-between'>
              <div className='space-y-1'>
                <h4 className='font-medium text-foreground text-sm'>
                  {event.title}
                </h4>
                <p className='text-sm text-muted-foreground line-clamp-2'>
                  {event.description}
                </p>
              </div>
              <div className='flex flex-col items-end gap-1'>
                <span className='text-xs text-muted-foreground font-mono'>
                  {event.time}
                </span>
                <div className='flex items-center gap-1'>
                  <StatusConfig.icon className={cn('w-4 h-4', StatusConfig.color)} />
                  <Badge variant='outline' className='text-xs'>
                    {event.status}
                  </Badge>
                </div>
              </div>
            </div>

            {/* Metadata */}
            <div className='flex items-center gap-4 mt-2'>
              {event.duration && (
                <div className='flex items-center gap-1'>
                  <Clock className='w-3 h-3 text-muted-foreground' />
                  <span className='text-xs text-muted-foreground'>
                    {event.duration} min
                  </span>
                </div>
              )}
              {event.technologies && event.technologies.length > 0 && (
                <div className='flex items-center gap-1'>
                  {event.technologies.slice(0, 3).map((tech, i) => (
                    <Badge key={i} variant='outline' className='text-xs'>
                      {tech}
                    </Badge>
                  ))}
                  {event.technologies.length > 3 && (
                    <span className='text-xs text-muted-foreground'>
                      +{event.technologies.length - 3}
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Expand/collapse indicator */}
          <div className='ml-auto'>
            {isExpanded ? (
              <ChevronUp className='w-4 h-4 text-muted-foreground' />
            ) : (
              <ChevronDown className='w-4 h-4 text-muted-foreground' />
            )}
          </div>
        </div>
      </div>

      {/* Expanded content */}
      {isExpanded && event.aiAnalysis && (
        <div className='px-4 pb-4 border-t border-border pt-4'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            {/* AI Analysis */}
            <div className='space-y-2'>
              <h5 className='text-sm font-medium text-foreground flex items-center gap-2'>
                <Brain className='w-4 h-4 text-purple-500' />
                AI Analysis
              </h5>
              <div className='space-y-1'>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Sentiment</span>
                  <Badge variant='outline' className='text-xs'>
                    {event.aiAnalysis.sentiment}
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Complexity</span>
                  <Badge variant='outline' className='text-xs'>
                    {event.aiAnalysis.complexity}
                  </Badge>
                </div>
                <div className='flex items-center justify-between text-xs'>
                  <span className='text-muted-foreground'>Productivity</span>
                  <Progress value={event.aiAnalysis.productivity * 10} className='w-20 h-2' />
                </div>
              </div>
            </div>

            {/* Insights */}
            {event.insights && (
              <div className='space-y-2'>
                <h5 className='text-sm font-medium text-foreground flex items-center gap-2'>
                  <Target className='w-4 h-4 text-yellow-500' />
                  Insights
                </h5>
                <div className='space-y-1'>
                  {event.insights.learningPoints && event.insights.learningPoints.length > 0 && (
                    <div className='text-xs text-muted-foreground'>
                      <span className='font-medium'>Learning:</span>{' '}
                      {event.insights.learningPoints.join(', ')}
                    </div>
                  )}
                  {event.insights.challenges && event.insights.challenges.length > 0 && (
                    <div className='text-xs text-muted-foreground'>
                      <span className='font-medium'>Challenges:</span>{' '}
                      {event.insights.challenges.join(', ')}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
})

// Main component
export const StableDevelopmentTimeline = memo(function StableDevelopmentTimeline({
  userId,
  projectId,
  className
}: StableDevelopmentTimelineProps) {
  const {
    timelineEvents,
    filteredEvents,
    groupedEvents,
    timelineAnalysis,
    llmAnalysis,
    isLoading,
    isAnalyzing,
    expandedSections,
    selectedTab,
    timeRange,
    filterType,
    refresh,
    runLLMAnalysis,
    toggleEventExpansion,
    setSelectedTab,
    setTimeRange,
    setFilterType
  } = useStablePersonalInsights({ userId, projectId })

  // Format date for display (memoized)
  const formatDate = useCallback((dateStr: string) => {
    const date = new Date(dateStr)
    const today = new Date()
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)

    if (date.toDateString() === today.toDateString()) {
      return 'Today'
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Yesterday'
    } else {
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        month: 'short',
        day: 'numeric'
      })
    }
  }, [])

  // Loading state
  if (isLoading && timelineEvents.length === 0) {
    return (
      <Card className={cn('p-6', className)}>
        <div className='space-y-4'>
          <Skeleton className='h-8 w-64' />
          <div className='space-y-3'>
            {[...Array(3)].map((_, i) => (
              <div key={i} className='flex items-start gap-4'>
                <Skeleton className='w-10 h-10 rounded-lg' />
                <div className='flex-1 space-y-2'>
                  <Skeleton className='h-4 w-3/4' />
                  <Skeleton className='h-3 w-1/2' />
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
    )
  }

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header */}
      <div className='p-6 border-b border-border'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center gap-2'>
            <GitCommit className='w-5 h-5 text-muted-foreground' />
            <h2 className='text-lg font-semibold text-foreground'>Development Timeline</h2>
            {timelineEvents.length > 0 && (
              <Badge variant='outline' className='text-xs bg-background/50'>
                {timelineEvents.length} events
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={refresh}
              className='hover:bg-background/50'
              disabled={isLoading}
            >
              <RefreshCw className={cn('w-4 h-4', isLoading && 'animate-spin')} />
            </Button>
            <Button
              variant='outline'
              size='sm'
              onClick={runLLMAnalysis}
              disabled={isAnalyzing}
              className='hover:bg-purple-500/10 border-purple-500/30'
            >
              {isAnalyzing ? (
                <>
                  <Brain className='w-4 h-4 mr-2 animate-pulse' />
                  Analyzing...
                </>
              ) : (
                <>
                  <Sparkles className='w-4 h-4 mr-2' />
                  AI Analysis
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className='flex items-center gap-4'>
          <Select value={timeRange} onValueChange={(v: any) => setTimeRange(v)}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='today'>Today</SelectItem>
              <SelectItem value='week'>This Week</SelectItem>
              <SelectItem value='month'>This Month</SelectItem>
              <SelectItem value='all'>All Time</SelectItem>
            </SelectContent>
          </Select>

          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className='w-40'>
              <Filter className='w-4 h-4 mr-2' />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='all'>All Types</SelectItem>
              <SelectItem value='feature'>Features</SelectItem>
              <SelectItem value='bug'>Bug Fixes</SelectItem>
              <SelectItem value='refactor'>Refactoring</SelectItem>
              <SelectItem value='documentation'>Documentation</SelectItem>
              <SelectItem value='testing'>Testing</SelectItem>
              <SelectItem value='deployment'>Deployment</SelectItem>
              <SelectItem value='learning'>Learning</SelectItem>
              <SelectItem value='collaboration'>Collaboration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className='p-6'>
        <Tabs value={selectedTab} onValueChange={(v: any) => setSelectedTab(v)} className='w-full'>
          <TabsList className='grid w-full grid-cols-3'>
            <TabsTrigger value='timeline'>Timeline</TabsTrigger>
            <TabsTrigger value='insights'>Insights</TabsTrigger>
            <TabsTrigger value='analysis'>AI Analysis</TabsTrigger>
          </TabsList>

          {/* Timeline Tab */}
          <TabsContent value='timeline' className='mt-6'>
            {filteredEvents.length > 0 ? (
              <div className='space-y-6'>
                {Object.entries(groupedEvents).map(([date, dateEvents]) => (
                  <div key={date} className='space-y-4'>
                    {/* Date header */}
                    <div className='flex items-center gap-2 text-sm text-muted-foreground'>
                      <Calendar className='w-4 h-4' />
                      <span className='font-medium'>{formatDate(date)}</span>
                      <Badge variant='outline' className='text-xs'>
                        {dateEvents.length} activities
                      </Badge>
                    </div>

                    {/* Events for this date */}
                    <div className='space-y-3 ml-6'>
                      {dateEvents.map((event) => (
                        <TimelineEvent
                          key={event.id}
                          event={event}
                          isExpanded={expandedSections.has(`event_${event.id}`)}
                          onToggle={() => toggleEventExpansion(event.id)}
                        />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <EmptyState
                icon={MessageSquare}
                title="No Activity Found"
                description="No development activity found for the selected time period."
              />
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value='insights' className='mt-6'>
            {timelineAnalysis ? (
              <TimelineInsights analysis={timelineAnalysis} />
            ) : (
              <EmptyState
                icon={Brain}
                title="No Insights Available"
                description="Start coding to generate development insights."
              />
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value='analysis' className='mt-6'>
            {llmAnalysis?.timeline ? (
              <AITimelineAnalysis analysis={llmAnalysis.timeline} />
            ) : (
              <div className='text-center py-8'>
                <Sparkles className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <h4 className='text-lg font-medium text-foreground mb-2'>AI Analysis Available</h4>
                <p className='text-sm text-muted-foreground mb-4'>
                  Click the AI Analysis button to generate detailed insights about your development timeline.
                </p>
                <Button onClick={runLLMAnalysis} disabled={isAnalyzing}>
                  {isAnalyzing ? (
                    <>
                      <Brain className='w-4 h-4 mr-2 animate-pulse' />
                      Analyzing...
                    </>
                  ) : (
                    <>
                      <Sparkles className='w-4 h-4 mr-2' />
                      Generate Analysis
                    </>
                  )}
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </Card>
  )
})

// Sub-components for insights and analysis
const EmptyState = memo(function EmptyState({
  icon: Icon,
  title,
  description
}: {
  icon: any
  title: string
  description: string
}) {
  return (
    <div className='text-center py-8'>
      <Icon className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
      <h4 className='text-lg font-medium text-foreground mb-2'>{title}</h4>
      <p className='text-sm text-muted-foreground'>{description}</p>
    </div>
  )
})

const TimelineInsights = memo(function TimelineInsights({ analysis }: { analysis: any }) {
  return (
    <div className='space-y-6'>
      {/* Summary Stats */}
      <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
        <StatCard
          label="Total Events"
          value={analysis.summary.totalEvents}
          icon={Activity}
        />
        <StatCard
          label="Productive Hours"
          value={`${analysis.summary.productiveHours}h`}
          icon={Clock}
        />
        <StatCard
          label="Collaboration"
          value={analysis.summary.collaborationLevel}
          icon={Users}
        />
        <StatCard
          label="Momentum"
          value={analysis.summary.overallMomentum}
          icon={TrendingUp}
        />
      </div>

      {/* Additional insights sections... */}
    </div>
  )
})

const StatCard = memo(function StatCard({
  label,
  value,
  icon: Icon
}: {
  label: string
  value: string | number
  icon: any
}) {
  return (
    <Card className='p-4'>
      <div className='flex items-center justify-between mb-2'>
        <span className='text-sm font-medium text-foreground'>{label}</span>
        <Icon className='w-4 h-4 text-muted-foreground' />
      </div>
      <div className='text-2xl font-bold text-foreground capitalize'>
        {value}
      </div>
    </Card>
  )
})

const AITimelineAnalysis = memo(function AITimelineAnalysis({ analysis }: { analysis: any }) {
  if (!analysis) return null

  return (
    <div className='space-y-6'>
      {/* Daily Summary */}
      {analysis.dailySummary && (
        <Card className='p-4'>
          <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
            <Calendar className='w-4 h-4 text-blue-500' />
            Daily Summary
          </h4>
          <div className='space-y-3'>
            <div className='flex items-center justify-between'>
              <span className='text-sm text-muted-foreground'>Overall Productivity</span>
              <div className='flex items-center gap-2'>
                <Progress value={analysis.dailySummary.overallProductivity * 10} className='w-24 h-2' />
                <Badge variant='outline' className='text-xs'>
                  {analysis.dailySummary.overallProductivity}/10
                </Badge>
              </div>
            </div>
            <p className='text-sm text-muted-foreground'>
              <span className='font-medium'>Main Focus:</span> {analysis.dailySummary.mainFocus}
            </p>
          </div>
        </Card>
      )}

      {/* More analysis sections... */}
    </div>
  )
})