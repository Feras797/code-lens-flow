import { useState, useEffect } from 'react'
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
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import { useDevelopmentTimeline } from '@/hooks/useDevelopmentTimeline'
import { timelineService } from '@/services/developmentTimelineService'
import type { DevelopmentEvent } from '@/hooks/useDevelopmentTimeline'
import type { ClaudeChatLog } from '@/hooks/useSupabase'

interface DevelopmentTimelineProps {
  userId?: string
  projectId?: string
  className?: string
}

const eventIcons = {
  feature: Code,
  bug: Bug,
  refactor: Zap,
  documentation: FileText,
  testing: TestTube,
  deployment: Rocket,
  learning: Brain,
  collaboration: Users
}

const impactColors = {
  critical: 'text-red-500 border-red-500/30 bg-red-500/10',
  high: 'text-orange-500 border-orange-500/30 bg-orange-500/10',
  medium: 'text-yellow-500 border-yellow-500/30 bg-yellow-500/10',
  low: 'text-green-500 border-green-500/30 bg-green-500/10'
}

const statusIcons = {
  completed: { icon: Award, color: 'text-green-500' },
  'in-progress': { icon: Activity, color: 'text-blue-500' },
  blocked: { icon: AlertCircle, color: 'text-red-500' },
  abandoned: { icon: ChevronRight, color: 'text-gray-500' }
}

export function DevelopmentTimeline({
  userId = 'e3b41869-1444-4bf0-a625-90b0f1d1dffb',
  projectId = 'GoonerSquad',
  className
}: DevelopmentTimelineProps) {
  const [timeRange, setTimeRange] = useState<'today' | 'week' | 'month' | 'all'>('week')
  const [filterType, setFilterType] = useState<string>('all')
  const [expandedEvents, setExpandedEvents] = useState<Set<string>>(new Set())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [llmAnalysis, setLlmAnalysis] = useState<any>(null)

  const { toast } = useToast()

  // Calculate date range based on selection
  const getDateRange = () => {
    const end = new Date()
    const start = new Date()

    switch (timeRange) {
      case 'today':
        start.setHours(0, 0, 0, 0)
        break
      case 'week':
        start.setDate(start.getDate() - 7)
        break
      case 'month':
        start.setMonth(start.getMonth() - 1)
        break
      case 'all':
        start.setFullYear(start.getFullYear() - 1)
        break
    }

    return {
      startDate: start.toISOString(),
      endDate: end.toISOString()
    }
  }

  const dateRange = getDateRange()

  // Fetch timeline data with real-time updates
  const {
    timeline,
    events,
    isLoading,
    error,
    refresh
  } = useDevelopmentTimeline({
    userId,
    projectId,
    limit: 50,
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    includeAIAnalysis: true
  })

  // Filter events based on type
  const filteredEvents = events.filter(event => {
    if (filterType === 'all') return true
    return event.type === filterType
  })

  // Group events by date
  const groupedEvents = filteredEvents.reduce((groups, event) => {
    const date = event.date
    if (!groups[date]) {
      groups[date] = []
    }
    groups[date].push(event)
    return groups
  }, {} as Record<string, DevelopmentEvent[]>)

  // Toggle event expansion
  const toggleEventExpansion = (eventId: string) => {
    setExpandedEvents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(eventId)) {
        newSet.delete(eventId)
      } else {
        newSet.add(eventId)
      }
      return newSet
    })
  }

  // Run LLM analysis
  const runLLMAnalysis = async () => {
    if (!events || events.length === 0) {
      toast({
        title: 'No data to analyze',
        description: 'Start coding to generate timeline data for analysis.',
        variant: 'destructive'
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // Fetch the raw logs for LLM analysis
      const { data: logs } = await supabase
        .from('claude_chat_logs')
        .select('*')
        .eq('user_id', userId)
        .gte('interaction_timestamp', dateRange.startDate)
        .lte('interaction_timestamp', dateRange.endDate)
        .order('interaction_timestamp', { ascending: false })
        .limit(30)

      if (logs && logs.length > 0) {
        const analysisResult = await timelineService.analyzeTimeline({
          userId,
          projectId,
          logs: logs as ClaudeChatLog[],
          timeRange: {
            start: dateRange.startDate,
            end: dateRange.endDate
          }
        })

        if (analysisResult.success && analysisResult.data) {
          setLlmAnalysis(analysisResult.data)
          toast({
            title: 'AI Analysis Complete',
            description: 'Your development timeline has been analyzed with AI insights.'
          })
        } else {
          throw new Error(analysisResult.error || 'Analysis failed')
        }
      }
    } catch (error) {
      console.error('LLM analysis failed:', error)
      toast({
        title: 'Analysis Failed',
        description: 'Failed to generate AI insights. Please try again.',
        variant: 'destructive'
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Format date for display
  const formatDate = (dateStr: string) => {
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
  }

  if (isLoading) {
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
            {timeline && (
              <Badge variant='outline' className='text-xs bg-background/50'>
                {timeline.summary.totalEvents} events
              </Badge>
            )}
          </div>
          <div className='flex items-center gap-2'>
            <Button
              variant='outline'
              size='sm'
              onClick={refresh}
              className='hover:bg-background/50'
            >
              <RefreshCw className='w-4 h-4' />
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
        <Tabs defaultValue='timeline' className='w-full'>
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
                      {dateEvents.map((event) => {
                        const Icon = eventIcons[event.type]
                        const StatusIcon = statusIcons[event.status]
                        const isExpanded = expandedEvents.has(event.id)

                        return (
                          <div
                            key={event.id}
                            className={cn(
                              'border rounded-lg transition-all hover:bg-background/30',
                              isExpanded ? 'border-primary/30' : 'border-border'
                            )}
                          >
                            {/* Event header */}
                            <div
                              className='p-4 cursor-pointer'
                              onClick={() => toggleEventExpansion(event.id)}
                            >
                              <div className='flex items-start gap-3'>
                                {/* Event icon */}
                                <div className={cn(
                                  'flex items-center justify-center w-10 h-10 rounded-lg border',
                                  impactColors[event.impact]
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
                                        <StatusIcon.icon className={cn('w-4 h-4', StatusIcon.color)} />
                                        <Badge variant='outline' className='text-xs'>
                                          {event.status}
                                        </Badge>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Metadata */}
                                  <div className='flex items-center gap-4 mt-2'>
                                    <div className='flex items-center gap-1'>
                                      <Clock className='w-3 h-3 text-muted-foreground' />
                                      <span className='text-xs text-muted-foreground'>
                                        {event.duration} min
                                      </span>
                                    </div>
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
                            {isExpanded && (
                              <div className='px-4 pb-4 border-t border-border pt-4'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                  {/* AI Analysis */}
                                  {event.aiAnalysis && (
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
                                  )}

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

                                {/* Files affected */}
                                {event.files && event.files.length > 0 && (
                                  <div className='mt-3 pt-3 border-t border-border'>
                                    <div className='text-xs text-muted-foreground'>
                                      <span className='font-medium'>Files:</span>{' '}
                                      {event.files.join(', ')}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='text-center py-8'>
                <MessageSquare className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <h4 className='text-lg font-medium text-foreground mb-2'>No Activity Found</h4>
                <p className='text-sm text-muted-foreground'>
                  No development activity found for the selected time period.
                </p>
              </div>
            )}
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value='insights' className='mt-6'>
            {timeline ? (
              <div className='space-y-6'>
                {/* Summary Stats */}
                <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                  <Card className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-foreground'>Total Events</span>
                      <Activity className='w-4 h-4 text-muted-foreground' />
                    </div>
                    <div className='text-2xl font-bold text-foreground'>
                      {timeline.summary.totalEvents}
                    </div>
                  </Card>

                  <Card className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-foreground'>Productive Hours</span>
                      <Clock className='w-4 h-4 text-muted-foreground' />
                    </div>
                    <div className='text-2xl font-bold text-foreground'>
                      {timeline.summary.productiveHours}h
                    </div>
                  </Card>

                  <Card className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-foreground'>Collaboration</span>
                      <Users className='w-4 h-4 text-muted-foreground' />
                    </div>
                    <div className='text-2xl font-bold text-foreground capitalize'>
                      {timeline.summary.collaborationLevel}
                    </div>
                  </Card>

                  <Card className='p-4'>
                    <div className='flex items-center justify-between mb-2'>
                      <span className='text-sm font-medium text-foreground'>Momentum</span>
                      <TrendingUp className='w-4 h-4 text-muted-foreground' />
                    </div>
                    <div className='text-2xl font-bold text-foreground capitalize'>
                      {timeline.summary.overallMomentum}
                    </div>
                  </Card>
                </div>

                {/* Focus Areas */}
                <Card className='p-4'>
                  <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                    <Target className='w-4 h-4 text-yellow-500' />
                    Focus Areas
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {timeline.summary.focusAreas.map((area, i) => (
                      <Badge key={i} variant='outline' className='bg-yellow-500/10 text-yellow-400 border-yellow-500/20'>
                        {area}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Technologies */}
                <Card className='p-4'>
                  <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                    <Code className='w-4 h-4 text-blue-500' />
                    Technologies Used
                  </h4>
                  <div className='flex flex-wrap gap-2'>
                    {timeline.summary.topTechnologies.map((tech, i) => (
                      <Badge key={i} variant='outline' className='bg-blue-500/10 text-blue-400 border-blue-500/20'>
                        {tech}
                      </Badge>
                    ))}
                  </div>
                </Card>

                {/* Patterns */}
                <Card className='p-4'>
                  <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                    <Activity className='w-4 h-4 text-green-500' />
                    Work Patterns
                  </h4>
                  <div className='space-y-2'>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Most Productive</span>
                      <span className='text-foreground font-medium'>{timeline.patterns.mostProductiveTime}</span>
                    </div>
                    <div className='flex items-center justify-between text-sm'>
                      <span className='text-muted-foreground'>Work Style</span>
                      <span className='text-foreground font-medium'>{timeline.patterns.preferredWorkStyle}</span>
                    </div>
                  </div>
                </Card>

                {/* Recommendations */}
                {timeline.recommendations.length > 0 && (
                  <Card className='p-4'>
                    <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                      <Zap className='w-4 h-4 text-purple-500' />
                      Recommendations
                    </h4>
                    <div className='space-y-2'>
                      {timeline.recommendations.map((rec, i) => (
                        <div key={i} className='flex items-start gap-2'>
                          <ChevronRight className='w-4 h-4 text-muted-foreground mt-0.5 flex-shrink-0' />
                          <span className='text-sm text-muted-foreground'>{rec}</span>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
            ) : (
              <div className='text-center py-8'>
                <Brain className='w-12 h-12 mx-auto text-muted-foreground mb-4' />
                <h4 className='text-lg font-medium text-foreground mb-2'>No Insights Available</h4>
                <p className='text-sm text-muted-foreground'>
                  Start coding to generate development insights.
                </p>
              </div>
            )}
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value='analysis' className='mt-6'>
            {llmAnalysis ? (
              <div className='space-y-6'>
                {/* Daily Summary */}
                {llmAnalysis.dailySummary && (
                  <Card className='p-4'>
                    <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                      <Calendar className='w-4 h-4 text-blue-500' />
                      Daily Summary
                    </h4>
                    <div className='space-y-3'>
                      <div className='flex items-center justify-between'>
                        <span className='text-sm text-muted-foreground'>Overall Productivity</span>
                        <div className='flex items-center gap-2'>
                          <Progress value={llmAnalysis.dailySummary.overallProductivity * 10} className='w-24 h-2' />
                          <Badge variant='outline' className='text-xs'>
                            {llmAnalysis.dailySummary.overallProductivity}/10
                          </Badge>
                        </div>
                      </div>
                      <p className='text-sm text-muted-foreground'>
                        <span className='font-medium'>Main Focus:</span> {llmAnalysis.dailySummary.mainFocus}
                      </p>
                      <div>
                        <p className='text-sm font-medium text-foreground mb-1'>Key Accomplishments</p>
                        <div className='space-y-1'>
                          {llmAnalysis.dailySummary.keyAccomplishments.map((acc: string, i: number) => (
                            <div key={i} className='flex items-start gap-2 text-sm text-muted-foreground'>
                              <Award className='w-3 h-3 mt-0.5 text-green-500 flex-shrink-0' />
                              {acc}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Insights */}
                {llmAnalysis.insights && (
                  <Card className='p-4'>
                    <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                      <Brain className='w-4 h-4 text-purple-500' />
                      AI Insights
                    </h4>
                    <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                      <div>
                        <p className='text-sm font-medium text-foreground mb-2'>Strengths</p>
                        <div className='space-y-1'>
                          {llmAnalysis.insights.strengths.map((strength: string, i: number) => (
                            <div key={i} className='flex items-start gap-2 text-sm text-muted-foreground'>
                              <div className='w-1.5 h-1.5 rounded-full bg-green-500 mt-1.5 flex-shrink-0' />
                              {strength}
                            </div>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className='text-sm font-medium text-foreground mb-2'>Improvement Areas</p>
                        <div className='space-y-1'>
                          {llmAnalysis.insights.improvementAreas.map((area: string, i: number) => (
                            <div key={i} className='flex items-start gap-2 text-sm text-muted-foreground'>
                              <div className='w-1.5 h-1.5 rounded-full bg-orange-500 mt-1.5 flex-shrink-0' />
                              {area}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </Card>
                )}

                {/* Recommendations */}
                {llmAnalysis.recommendations && (
                  <Card className='p-4'>
                    <h4 className='text-sm font-medium text-foreground mb-3 flex items-center gap-2'>
                      <Sparkles className='w-4 h-4 text-yellow-500' />
                      AI Recommendations
                    </h4>
                    <div className='space-y-3'>
                      {llmAnalysis.recommendations.map((rec: any, i: number) => (
                        <div key={i} className='p-3 border border-border rounded-lg'>
                          <div className='flex items-center justify-between mb-2'>
                            <span className='text-sm font-medium text-foreground'>{rec.action}</span>
                            <Badge 
                              variant='outline' 
                              className={cn(
                                'text-xs',
                                rec.priority === 'high' ? 'text-red-400 border-red-500/30' :
                                rec.priority === 'medium' ? 'text-yellow-400 border-yellow-500/30' :
                                'text-green-400 border-green-500/30'
                              )}
                            >
                              {rec.priority}
                            </Badge>
                          </div>
                          <p className='text-xs text-muted-foreground mb-1'>{rec.reasoning}</p>
                          <p className='text-xs text-muted-foreground'>
                            <span className='font-medium'>Expected Outcome:</span> {rec.expectedOutcome}
                          </p>
                        </div>
                      ))}
                    </div>
                  </Card>
                )}
              </div>
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
}

// Import Supabase client for LLM analysis
import { supabase } from '@/lib/supabase'

