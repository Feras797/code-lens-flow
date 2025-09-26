import { useEffect, useCallback, useMemo, useRef } from 'react'
import usePersonalInsightsStore from '@/stores/usePersonalInsightsStore'
import { personalInsightsDataService } from '@/services/personalInsightsDataService'
import { PersonalInsightsDigestService } from '@/services/personalInsightsDigest'
import { timelineService } from '@/services/developmentTimelineService'
import type { DevelopmentEvent } from './useDevelopmentTimeline'

interface UseStablePersonalInsightsOptions {
  userId?: string
  projectId?: string
  enableLLM?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

interface UseStablePersonalInsightsReturn {
  // Core data
  currentProfile: ReturnType<typeof usePersonalInsightsStore>['currentProfile']
  userLogs: ReturnType<typeof usePersonalInsightsStore>['userLogs']
  activityMetrics: ReturnType<typeof usePersonalInsightsStore>['activityMetrics']

  // Timeline data
  timelineEvents: DevelopmentEvent[]
  filteredEvents: DevelopmentEvent[]
  groupedEvents: Record<string, DevelopmentEvent[]>
  timelineAnalysis: ReturnType<typeof usePersonalInsightsStore>['timelineAnalysis']

  // Today's summary (memoized)
  todaysSummary: {
    morning: string
    afternoon: string
    keyDecisions: string[]
    abandoned: string
  }

  // LLM Analysis
  llmAnalysis: ReturnType<typeof usePersonalInsightsStore>['llmAnalysis']

  // UI State
  isLoading: boolean
  isAnalyzing: boolean
  error: string | null
  lastRefresh: Date | null
  expandedSections: Set<string>
  selectedTab: 'timeline' | 'insights' | 'analysis'

  // Settings
  enableLLMAnalysis: boolean
  autoRefresh: boolean
  timeRange: 'today' | 'week' | 'month' | 'all'
  filterType: string

  // Actions (all stable with useCallback)
  refresh: () => Promise<void>
  runLLMAnalysis: () => Promise<void>
  toggleExpandedSection: (section: string) => void
  setSelectedTab: (tab: 'timeline' | 'insights' | 'analysis') => void
  setTimeRange: (range: 'today' | 'week' | 'month' | 'all') => void
  setFilterType: (type: string) => void
  setEnableLLMAnalysis: (enabled: boolean) => void
  setAutoRefresh: (enabled: boolean) => void
  toggleEventExpansion: (eventId: string) => void

  // Helpers
  formatTimeAgo: (date: Date) => string
}

export function useStablePersonalInsights(
  options: UseStablePersonalInsightsOptions = {}
): UseStablePersonalInsightsReturn {
  const {
    userId = 'e3b41869-1444-4bf0-a625-90b0f1d1dffb',
    projectId = 'GoonerSquad',
    enableLLM = false,
    autoRefresh = false,
    refreshInterval = 60000
  } = options

  // Store state
  const store = usePersonalInsightsStore()
  const digestServiceRef = useRef<PersonalInsightsDigestService | null>(null)
  const cleanupRef = useRef<(() => void) | null>(null)

  // Initialize digest service
  if (!digestServiceRef.current) {
    digestServiceRef.current = new PersonalInsightsDigestService()
  }

  // Set initial values
  useEffect(() => {
    store.setUserId(userId)
    store.setProjectId(projectId)
    store.setEnableLLMAnalysis(enableLLM)
    store.setAutoRefresh(autoRefresh)
    store.setRefreshInterval(refreshInterval)
  }, [userId, projectId, enableLLM, autoRefresh, refreshInterval])

  // Initial data fetch
  useEffect(() => {
    personalInsightsDataService.refreshAllData(userId, projectId)
  }, [userId, projectId])

  // Setup real-time subscription
  useEffect(() => {
    cleanupRef.current = personalInsightsDataService.setupRealtimeSubscription(userId)

    return () => {
      if (cleanupRef.current) {
        cleanupRef.current()
      }
    }
  }, [userId])

  // Auto-refresh effect
  useEffect(() => {
    if (!store.autoRefresh) return

    const interval = setInterval(() => {
      personalInsightsDataService.refreshAllData(userId, projectId)
    }, store.refreshInterval)

    return () => clearInterval(interval)
  }, [store.autoRefresh, store.refreshInterval, userId, projectId])

  // Memoized date range calculation
  const dateRange = useMemo(() => {
    const end = new Date()
    const start = new Date()

    switch (store.timeRange) {
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

    return { start: start.toISOString(), end: end.toISOString() }
  }, [store.timeRange])

  // Fetch timeline events when date range changes
  useEffect(() => {
    personalInsightsDataService.fetchTimelineEvents(userId, projectId, dateRange)
  }, [userId, projectId, dateRange])

  // Memoized filtered events
  const filteredEvents = useMemo(() => {
    if (store.filterType === 'all') return store.timelineEvents
    return store.timelineEvents.filter(event => event.type === store.filterType)
  }, [store.timelineEvents, store.filterType])

  // Memoized grouped events
  const groupedEvents = useMemo(() => {
    return filteredEvents.reduce((groups, event) => {
      const date = event.date
      if (!groups[date]) {
        groups[date] = []
      }
      groups[date].push(event)
      return groups
    }, {} as Record<string, DevelopmentEvent[]>)
  }, [filteredEvents])

  // Memoized today's summary
  const todaysSummary = useMemo(() => {
    if (!store.userLogs || !store.activityMetrics) {
      return {
        morning: 'No recent activity found. Start a conversation with Claude Code to see insights!',
        afternoon: 'Loading recent development activity...',
        keyDecisions: [],
        abandoned: 'Analysis pending'
      }
    }

    const todayLogs = store.userLogs.filter(log => {
      const logDate = new Date(log.interaction_timestamp)
      const today = new Date()
      return logDate.toDateString() === today.toDateString()
    })

    const morningLogs = todayLogs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour >= 6 && hour < 12
    })

    const afternoonLogs = todayLogs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour >= 12 && hour < 18
    })

    return {
      morning: morningLogs.length > 0 ?
        `Worked on ${morningLogs.length} development tasks, focusing on ${store.activityMetrics.topicFrequency?.[0] || 'general development'}` :
        'No morning activity recorded today',
      afternoon: afternoonLogs.length > 0 ?
        `Continued with ${afternoonLogs.length} development discussions, emphasizing ${store.activityMetrics.topicFrequency?.[1] || 'problem solving'}` :
        'No afternoon activity recorded today',
      keyDecisions: store.currentProfile?.problem_solving_patterns?.slice(0, 2) || [],
      abandoned: store.currentProfile?.growth_areas?.[0] || 'No abandoned tasks identified'
    }
  }, [store.userLogs, store.activityMetrics, store.currentProfile])

  // Stable actions
  const refresh = useCallback(async () => {
    await personalInsightsDataService.refreshAllData(userId, projectId)
  }, [userId, projectId])

  const runLLMAnalysis = useCallback(async () => {
    if (!store.enableLLMAnalysis || !digestServiceRef.current) return

    store.setIsAnalyzing(true)
    store.setError(null)

    try {
      // Run digest analysis
      const digestResult = await digestServiceRef.current.generateDigest({
        user_id: userId,
        project_id: projectId,
        conversation_limit: 50,
        analysis_focus: 'general'
      })

      if (digestResult.success && digestResult.data) {
        store.setLLMAnalysis('digest', digestResult.data)
      }

      // Run timeline analysis if we have events
      if (store.timelineEvents.length > 0 && store.userLogs) {
        const timelineResult = await timelineService.analyzeTimeline({
          userId,
          projectId,
          logs: store.userLogs.slice(0, 30),
          timeRange: dateRange
        })

        if (timelineResult.success && timelineResult.data) {
          store.setLLMAnalysis('timeline', timelineResult.data)
        }
      }
    } catch (error) {
      console.error('LLM analysis failed:', error)
      store.setError(error instanceof Error ? error.message : 'LLM analysis failed')
    } finally {
      store.setIsAnalyzing(false)
    }
  }, [userId, projectId, store.enableLLMAnalysis, store.timelineEvents, store.userLogs, dateRange])

  const toggleExpandedSection = useCallback((section: string) => {
    store.toggleExpandedSection(section)
  }, [])

  const setSelectedTab = useCallback((tab: 'timeline' | 'insights' | 'analysis') => {
    store.setSelectedTab(tab)
  }, [])

  const setTimeRange = useCallback((range: 'today' | 'week' | 'month' | 'all') => {
    store.setTimeRange(range)
  }, [])

  const setFilterType = useCallback((type: string) => {
    store.setFilterType(type)
  }, [])

  const setEnableLLMAnalysis = useCallback((enabled: boolean) => {
    store.setEnableLLMAnalysis(enabled)
  }, [])

  const setAutoRefresh = useCallback((enabled: boolean) => {
    store.setAutoRefresh(enabled)
  }, [])

  const toggleEventExpansion = useCallback((eventId: string) => {
    store.toggleExpandedSection(`event_${eventId}`)
  }, [])

  const formatTimeAgo = useCallback((date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }, [])

  return {
    // Core data
    currentProfile: store.currentProfile,
    userLogs: store.userLogs,
    activityMetrics: store.activityMetrics,

    // Timeline data
    timelineEvents: store.timelineEvents,
    filteredEvents,
    groupedEvents,
    timelineAnalysis: store.timelineAnalysis,

    // Today's summary
    todaysSummary,

    // LLM Analysis
    llmAnalysis: store.llmAnalysis,

    // UI State
    isLoading: store.isLoading,
    isAnalyzing: store.isAnalyzing,
    error: store.error,
    lastRefresh: store.lastRefresh,
    expandedSections: store.expandedSections,
    selectedTab: store.selectedTab,

    // Settings
    enableLLMAnalysis: store.enableLLMAnalysis,
    autoRefresh: store.autoRefresh,
    timeRange: store.timeRange,
    filterType: store.filterType,

    // Actions
    refresh,
    runLLMAnalysis,
    toggleExpandedSection,
    setSelectedTab,
    setTimeRange,
    setFilterType,
    setEnableLLMAnalysis,
    setAutoRefresh,
    toggleEventExpansion,

    // Helpers
    formatTimeAgo
  }
}