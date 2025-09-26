import { useState, useEffect, useCallback } from 'react'
import { supabase } from '@/lib/supabase'
import type { ClaudeChatLog } from './useSupabase'

export interface DevelopmentEvent {
  id: string
  timestamp: string
  date: string
  time: string
  type: 'feature' | 'bug' | 'refactor' | 'documentation' | 'testing' | 'deployment' | 'learning' | 'collaboration'
  category: 'code' | 'architecture' | 'review' | 'planning' | 'debugging'
  title: string
  description: string
  impact: 'critical' | 'high' | 'medium' | 'low'
  status: 'completed' | 'in-progress' | 'blocked' | 'abandoned'
  duration?: number // in minutes
  files?: string[]
  technologies?: string[]
  collaborators?: string[]
  metrics?: {
    linesChanged?: number
    filesAffected?: number
    testsAdded?: number
    complexityScore?: number
  }
  insights?: {
    learningPoints?: string[]
    challenges?: string[]
    improvements?: string[]
    decisions?: string[]
  }
  aiAnalysis?: {
    sentiment: 'positive' | 'neutral' | 'frustrated' | 'excited'
    complexity: 'beginner' | 'intermediate' | 'advanced'
    productivity: number // 1-10
    focus: string
  }
}

export interface TimelineAnalysis {
  events: DevelopmentEvent[]
  summary: {
    totalEvents: number
    productiveHours: number
    focusAreas: string[]
    topTechnologies: string[]
    collaborationLevel: 'solo' | 'minimal' | 'moderate' | 'high'
    overallMomentum: 'accelerating' | 'steady' | 'slowing' | 'blocked'
  }
  patterns: {
    mostProductiveTime: string
    preferredWorkStyle: string
    commonChallenges: string[]
    strengthAreas: string[]
  }
  recommendations: string[]
}

interface UseDevelopmentTimelineOptions {
  userId?: string
  projectId?: string
  limit?: number
  startDate?: string
  endDate?: string
  includeAIAnalysis?: boolean
}

export function useDevelopmentTimeline(options: UseDevelopmentTimelineOptions = {}) {
  const {
    userId,
    projectId,
    limit = 20,
    startDate,
    endDate,
    includeAIAnalysis = true
  } = options

  const [timeline, setTimeline] = useState<TimelineAnalysis | null>(null)
  const [events, setEvents] = useState<DevelopmentEvent[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchTimelineData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Build query for claude_chat_logs
      let query = supabase
        .from('claude_chat_logs')
        .select('*')
        .order('interaction_timestamp', { ascending: false })
        .limit(limit)

      if (userId) {
        query = query.eq('user_id', userId)
      }

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      if (startDate) {
        query = query.gte('interaction_timestamp', startDate)
      }

      if (endDate) {
        query = query.lte('interaction_timestamp', endDate)
      }

      const { data: logs, error: logsError } = await query

      if (logsError) {
        throw logsError
      }

      if (!logs || logs.length === 0) {
        setEvents([])
        setTimeline({
          events: [],
          summary: {
            totalEvents: 0,
            productiveHours: 0,
            focusAreas: [],
            topTechnologies: [],
            collaborationLevel: 'solo',
            overallMomentum: 'steady'
          },
          patterns: {
            mostProductiveTime: 'No data',
            preferredWorkStyle: 'No data',
            commonChallenges: [],
            strengthAreas: []
          },
          recommendations: ['Start coding to see your development timeline']
        })
        return
      }

      // Transform logs into development events
      const transformedEvents = await transformLogsToEvents(logs, includeAIAnalysis)
      
      // Analyze patterns and generate insights
      const analysis = analyzeTimeline(transformedEvents)

      setEvents(transformedEvents)
      setTimeline(analysis)
    } catch (err) {
      console.error('Error fetching timeline:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch development timeline')
    } finally {
      setIsLoading(false)
    }
  }, [userId, projectId, limit, startDate, endDate, includeAIAnalysis])

  useEffect(() => {
    fetchTimelineData()
  }, [fetchTimelineData])

  // Set up real-time subscription
  useEffect(() => {
    if (!userId) return

    const channel = supabase
      .channel(`user-timeline-${userId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'claude_chat_logs',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Add new event to timeline
          const newLog = payload.new as ClaudeChatLog
          const newEvent = await transformSingleLogToEvent(newLog)
          
          setEvents(prev => [newEvent, ...prev].slice(0, limit))
          
          // Re-analyze timeline with new event
          setTimeline(prev => {
            if (!prev) return null
            const updatedEvents = [newEvent, ...prev.events].slice(0, limit)
            return analyzeTimeline(updatedEvents)
          })
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [userId, limit])

  return {
    timeline,
    events,
    isLoading,
    error,
    refresh: fetchTimelineData
  }
}

// Transform chat logs into development events
async function transformLogsToEvents(
  logs: ClaudeChatLog[],
  includeAIAnalysis: boolean
): Promise<DevelopmentEvent[]> {
  const events: DevelopmentEvent[] = []

  for (const log of logs) {
    const event = await transformSingleLogToEvent(log, includeAIAnalysis)
    events.push(event)
  }

  return events
}

// Transform a single log into a development event
async function transformSingleLogToEvent(
  log: ClaudeChatLog,
  includeAIAnalysis = true
): Promise<DevelopmentEvent> {
  const timestamp = new Date(log.interaction_timestamp)
  const query = log.user_query?.toLowerCase() || ''
  const response = log.claude_response?.toLowerCase() || ''

  // Categorize the event type
  let type: DevelopmentEvent['type'] = 'feature'
  let category: DevelopmentEvent['category'] = 'code'
  let impact: DevelopmentEvent['impact'] = 'medium'
  let status: DevelopmentEvent['status'] = log.status === 'completed' ? 'completed' : 'in-progress'

  // Analyze query to determine type and category
  if (query.includes('bug') || query.includes('error') || query.includes('fix')) {
    type = 'bug'
    category = 'debugging'
    impact = 'high'
  } else if (query.includes('test') || query.includes('testing')) {
    type = 'testing'
    category = 'code'
  } else if (query.includes('refactor') || query.includes('clean') || query.includes('optimize')) {
    type = 'refactor'
    category = 'code'
  } else if (query.includes('document') || query.includes('comment') || query.includes('readme')) {
    type = 'documentation'
    category = 'planning'
  } else if (query.includes('deploy') || query.includes('build') || query.includes('release')) {
    type = 'deployment'
    impact = 'critical'
  } else if (query.includes('learn') || query.includes('how') || query.includes('what') || query.includes('explain')) {
    type = 'learning'
    category = 'planning'
    impact = 'low'
  } else if (query.includes('review') || query.includes('feedback') || query.includes('suggest')) {
    type = 'collaboration'
    category = 'review'
  } else if (query.includes('architect') || query.includes('design') || query.includes('structure')) {
    category = 'architecture'
    impact = 'high'
  }

  // Extract technologies mentioned
  const technologies = extractTechnologies(query + ' ' + (response || ''))

  // Extract file paths if mentioned
  const files = extractFilePaths(query + ' ' + (response || ''))

  // Calculate duration based on response length and complexity
  const duration = estimateDuration(log)

  // Build the event object
  const event: DevelopmentEvent = {
    id: log.id,
    timestamp: log.interaction_timestamp,
    date: timestamp.toISOString().split('T')[0],
    time: timestamp.toTimeString().slice(0, 5),
    type,
    category,
    title: truncateString(log.user_query || 'Development activity', 100),
    description: truncateString(response || 'Processing...', 200),
    impact,
    status,
    duration,
    files: files.length > 0 ? files : undefined,
    technologies: technologies.length > 0 ? technologies : undefined
  }

  // Add AI analysis if requested
  if (includeAIAnalysis) {
    event.aiAnalysis = {
      sentiment: analyzeSentiment(query),
      complexity: analyzeComplexity(query, response),
      productivity: calculateProductivityScore(log),
      focus: determineFocus(query)
    }

    event.insights = {
      learningPoints: extractLearningPoints(response),
      challenges: extractChallenges(query),
      decisions: extractDecisions(response)
    }
  }

  return event
}

// Analyze timeline to generate insights
function analyzeTimeline(events: DevelopmentEvent[]): TimelineAnalysis {
  if (events.length === 0) {
    return {
      events: [],
      summary: {
        totalEvents: 0,
        productiveHours: 0,
        focusAreas: [],
        topTechnologies: [],
        collaborationLevel: 'solo',
        overallMomentum: 'steady'
      },
      patterns: {
        mostProductiveTime: 'No data',
        preferredWorkStyle: 'No data',
        commonChallenges: [],
        strengthAreas: []
      },
      recommendations: []
    }
  }

  // Calculate summary metrics
  const totalDuration = events.reduce((sum, e) => sum + (e.duration || 0), 0)
  const productiveHours = Math.round(totalDuration / 60)

  // Extract focus areas
  const categoryCount = events.reduce((acc, e) => {
    acc[e.category] = (acc[e.category] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  const focusAreas = Object.entries(categoryCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([category]) => category)

  // Extract top technologies
  const techCount = events.reduce((acc, e) => {
    (e.technologies || []).forEach(tech => {
      acc[tech] = (acc[tech] || 0) + 1
    })
    return acc
  }, {} as Record<string, number>)
  const topTechnologies = Object.entries(techCount)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5)
    .map(([tech]) => tech)

  // Determine collaboration level
  const collaborationEvents = events.filter(e => e.type === 'collaboration').length
  const collaborationLevel = 
    collaborationEvents > 10 ? 'high' :
    collaborationEvents > 5 ? 'moderate' :
    collaborationEvents > 0 ? 'minimal' : 'solo'

  // Analyze momentum
  const recentEvents = events.slice(0, 5)
  const completedRecent = recentEvents.filter(e => e.status === 'completed').length
  const blockedRecent = recentEvents.filter(e => e.status === 'blocked').length
  const overallMomentum = 
    blockedRecent > 2 ? 'blocked' :
    completedRecent >= 4 ? 'accelerating' :
    completedRecent >= 2 ? 'steady' : 'slowing'

  // Analyze patterns
  const timeDistribution = analyzeTimeDistribution(events)
  const mostProductiveTime = timeDistribution.peak || 'Varies'

  const workStyle = analyzeWorkStyle(events)
  const challenges = extractCommonChallenges(events)
  const strengths = analyzeStrengths(events)

  // Generate recommendations
  const recommendations = generateRecommendations(events, {
    momentum: overallMomentum,
    challenges,
    strengths,
    focusAreas
  })

  return {
    events,
    summary: {
      totalEvents: events.length,
      productiveHours,
      focusAreas,
      topTechnologies,
      collaborationLevel,
      overallMomentum
    },
    patterns: {
      mostProductiveTime,
      preferredWorkStyle: workStyle,
      commonChallenges: challenges,
      strengthAreas: strengths
    },
    recommendations
  }
}

// Helper functions
function extractTechnologies(text: string): string[] {
  const technologies = [
    'react', 'typescript', 'javascript', 'node', 'python', 'java',
    'css', 'html', 'sql', 'graphql', 'rest', 'api', 'docker',
    'kubernetes', 'aws', 'azure', 'gcp', 'git', 'webpack', 'vite',
    'next', 'vue', 'angular', 'svelte', 'tailwind', 'supabase',
    'postgresql', 'mongodb', 'redis', 'elasticsearch'
  ]

  const found = new Set<string>()
  const lowerText = text.toLowerCase()

  technologies.forEach(tech => {
    if (lowerText.includes(tech)) {
      found.add(tech.charAt(0).toUpperCase() + tech.slice(1))
    }
  })

  return Array.from(found)
}

function extractFilePaths(text: string): string[] {
  const filePathRegex = /[\w\-\/]+\.\w+/g
  const matches = text.match(filePathRegex) || []
  return [...new Set(matches)].slice(0, 5)
}

function estimateDuration(log: ClaudeChatLog): number {
  const queryLength = log.user_query?.length || 0
  const responseLength = log.claude_response?.length || 0
  
  // Estimate based on interaction complexity
  const baseTime = 5 // Base 5 minutes
  const complexityFactor = Math.min((queryLength + responseLength) / 500, 10)
  
  return Math.round(baseTime + complexityFactor * 5)
}

function analyzeSentiment(query: string): 'positive' | 'neutral' | 'frustrated' | 'excited' {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('awesome') || lowerQuery.includes('great') || lowerQuery.includes('perfect')) {
    return 'excited'
  }
  if (lowerQuery.includes('error') || lowerQuery.includes('stuck') || lowerQuery.includes('help')) {
    return 'frustrated'
  }
  if (lowerQuery.includes('!') && !lowerQuery.includes('error')) {
    return 'positive'
  }
  
  return 'neutral'
}

function analyzeComplexity(query: string, response: string): 'beginner' | 'intermediate' | 'advanced' {
  const complexKeywords = ['architecture', 'optimize', 'performance', 'scale', 'algorithm', 'complexity']
  const advancedCount = complexKeywords.filter(kw => 
    query.toLowerCase().includes(kw) || response.toLowerCase().includes(kw)
  ).length
  
  if (advancedCount >= 2) return 'advanced'
  if (advancedCount >= 1) return 'intermediate'
  return 'beginner'
}

function calculateProductivityScore(log: ClaudeChatLog): number {
  if (log.status === 'completed') return 8
  if (log.claude_response && log.claude_response.length > 500) return 7
  return 5
}

function determineFocus(query: string): string {
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('implement') || lowerQuery.includes('create') || lowerQuery.includes('add')) {
    return 'Building new features'
  }
  if (lowerQuery.includes('fix') || lowerQuery.includes('debug') || lowerQuery.includes('error')) {
    return 'Debugging and fixes'
  }
  if (lowerQuery.includes('refactor') || lowerQuery.includes('optimize')) {
    return 'Code optimization'
  }
  if (lowerQuery.includes('test')) {
    return 'Testing'
  }
  
  return 'General development'
}

function extractLearningPoints(response: string): string[] {
  if (!response) return []
  
  // Simple extraction based on common patterns
  const points: string[] = []
  if (response.includes('should') || response.includes('best practice')) {
    points.push('Best practices identified')
  }
  if (response.includes('instead of') || response.includes('better')) {
    points.push('Alternative approaches learned')
  }
  
  return points.slice(0, 3)
}

function extractChallenges(query: string): string[] {
  const challenges: string[] = []
  const lowerQuery = query.toLowerCase()
  
  if (lowerQuery.includes('error')) challenges.push('Error resolution')
  if (lowerQuery.includes('slow') || lowerQuery.includes('performance')) challenges.push('Performance optimization')
  if (lowerQuery.includes('complex')) challenges.push('Complexity management')
  
  return challenges
}

function extractDecisions(response: string): string[] {
  if (!response) return []
  
  const decisions: string[] = []
  if (response.includes('recommend') || response.includes('suggest')) {
    decisions.push('Technical decision made')
  }
  
  return decisions
}

function truncateString(str: string, maxLength: number): string {
  if (str.length <= maxLength) return str
  return str.substring(0, maxLength) + '...'
}

function analyzeTimeDistribution(events: DevelopmentEvent[]): { peak: string } {
  const hourCounts = events.reduce((acc, e) => {
    const hour = parseInt(e.time.split(':')[0])
    const timeSlot = 
      hour < 6 ? 'Early morning' :
      hour < 12 ? 'Morning' :
      hour < 18 ? 'Afternoon' :
      hour < 22 ? 'Evening' : 'Night'
    
    acc[timeSlot] = (acc[timeSlot] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const peak = Object.entries(hourCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'Varies'

  return { peak }
}

function analyzeWorkStyle(events: DevelopmentEvent[]): string {
  const typeDistribution = events.reduce((acc, e) => {
    acc[e.type] = (acc[e.type] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  const dominant = Object.entries(typeDistribution)
    .sort(([, a], [, b]) => b - a)[0]?.[0]

  switch (dominant) {
    case 'feature': return 'Feature-focused builder'
    case 'bug': return 'Quality-focused debugger'
    case 'refactor': return 'Code perfectionist'
    case 'learning': return 'Continuous learner'
    case 'collaboration': return 'Team collaborator'
    default: return 'Versatile developer'
  }
}

function extractCommonChallenges(events: DevelopmentEvent[]): string[] {
  const challenges = new Set<string>()
  
  events.forEach(e => {
    (e.insights?.challenges || []).forEach(c => challenges.add(c))
  })
  
  return Array.from(challenges).slice(0, 3)
}

function analyzeStrengths(events: DevelopmentEvent[]): string[] {
  const strengths: string[] = []
  const completedCount = events.filter(e => e.status === 'completed').length
  
  if (completedCount / events.length > 0.8) {
    strengths.push('High completion rate')
  }
  
  const highImpactCount = events.filter(e => e.impact === 'high' || e.impact === 'critical').length
  if (highImpactCount / events.length > 0.3) {
    strengths.push('Focus on high-impact work')
  }
  
  const techDiversity = new Set(events.flatMap(e => e.technologies || [])).size
  if (techDiversity > 5) {
    strengths.push('Technology versatility')
  }
  
  return strengths
}

function generateRecommendations(
  events: DevelopmentEvent[],
  insights: {
    momentum: string
    challenges: string[]
    strengths: string[]
    focusAreas: string[]
  }
): string[] {
  const recommendations: string[] = []

  if (insights.momentum === 'blocked') {
    recommendations.push('Consider breaking down complex tasks into smaller, manageable pieces')
  }

  if (insights.momentum === 'slowing') {
    recommendations.push('Take a break or switch to a different type of task to regain momentum')
  }

  if (insights.challenges.includes('Performance optimization')) {
    recommendations.push('Dedicate time to learn performance profiling tools')
  }

  if (!insights.strengths.includes('Technology versatility')) {
    recommendations.push('Explore new technologies to broaden your skill set')
  }

  const testingEvents = events.filter(e => e.type === 'testing').length
  if (testingEvents / events.length < 0.1) {
    recommendations.push('Increase focus on testing to improve code quality')
  }

  const docEvents = events.filter(e => e.type === 'documentation').length
  if (docEvents / events.length < 0.05) {
    recommendations.push('Add more documentation to improve code maintainability')
  }

  return recommendations.slice(0, 4)
}

