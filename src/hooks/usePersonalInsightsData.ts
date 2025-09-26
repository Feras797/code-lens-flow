import { useState, useEffect, useCallback, useMemo } from 'react'
import { useUserChatLogs, useUserActivityMetrics, useLatestDeveloperProfiles } from './useSupabase'
import { usePersonalInsightsDigest } from './usePersonalInsightsDigest'
import type { DeveloperProfile } from '@/types/analysis'
import type { ClaudeChatLog } from './useSupabase'

export interface PersonalInsightsData {
  // Raw data
  userLogs: ClaudeChatLog[] | null
  activityMetrics: any
  existingProfiles: any[] | null

  // Processed data
  currentProfile: DeveloperProfile | null
  todaysSummary: {
    morning: string
    afternoon: string
    keyDecisions: string[]
    nextFocus: string
    quickStats: Array<{ label: string; value: string }>
  }

  // Meta information
  isLoading: boolean
  error: string | null
  lastUpdated: Date

  // LLM analysis
  isAnalyzing: boolean
  analysisError: string | null

  // Actions
  refresh: () => Promise<void>
  runNewAnalysis: () => Promise<void>

  // Settings
  enableLLMAnalysis: boolean
  setEnableLLMAnalysis: (enabled: boolean) => void
  autoRefresh: boolean
  setAutoRefresh: (enabled: boolean) => void
}

interface UsePersonalInsightsDataOptions {
  userId?: string
  projectId?: string
  enableLLM?: boolean
  autoRefresh?: boolean
  refreshInterval?: number
}

export function usePersonalInsightsData(options: UsePersonalInsightsDataOptions = {}): PersonalInsightsData {
  const {
    userId = 'e3b41869-1444-4bf0-a625-90b0f1d1dffb',
    projectId = 'GoonerSquad',
    enableLLM = false,
    autoRefresh: initialAutoRefresh = false,
    refreshInterval = 60000 // 1 minute
  } = options

  // Settings state
  const [enableLLMAnalysis, setEnableLLMAnalysis] = useState(enableLLM)
  const [autoRefresh, setAutoRefresh] = useState(initialAutoRefresh)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisError, setAnalysisError] = useState<string | null>(null)
  const [currentProfile, setCurrentProfile] = useState<DeveloperProfile | null>(null)

  // Fetch raw data using existing hooks
  const { data: userLogs, isLoading: logsLoading, refetch: refetchLogs, error: logsError } = useUserChatLogs(userId, 50)
  const { data: activityMetrics, isLoading: metricsLoading, refetch: refetchMetrics, error: metricsError } = useUserActivityMetrics(userId, 'day')
  const { data: existingProfiles, isLoading: profilesLoading, refetch: refetchProfiles, error: profilesError } = useLatestDeveloperProfiles(userId)

  // LLM analysis hook
  const { generateDigest } = usePersonalInsightsDigest()

  // Combine loading states
  const isLoading = logsLoading || metricsLoading || profilesLoading

  // Combine errors
  const error = logsError || metricsError || profilesError || analysisError

  // Set current profile from existing data
  useEffect(() => {
    if (existingProfiles && Array.isArray(existingProfiles) && existingProfiles.length > 0) {
      setCurrentProfile(existingProfiles[0] as DeveloperProfile)
    }
  }, [existingProfiles])

  // Memoized today's summary generation to prevent constant recalculation
  const todaysSummary = useMemo(() => {
    const quickStats: Array<{ label: string; value: string }> = []

    if (!activityMetrics || !userLogs) {
      return {
        morning: 'No recent activity found. Start a conversation with Claude Code to see insights!',
        afternoon: 'Loading recent development activity...',
        keyDecisions: [],
        nextFocus: 'Analysis pending',
        quickStats
      }
    }

    if (typeof activityMetrics.totalInteractions === 'number') {
      quickStats.push({ label: 'Interactions', value: String(activityMetrics.totalInteractions) })
    }

    if (typeof activityMetrics.projectsWorkedOn === 'number') {
      quickStats.push({ label: 'Projects', value: String(activityMetrics.projectsWorkedOn) })
    }

    if (typeof activityMetrics.completionRate === 'number') {
      quickStats.push({ label: 'Completion', value: `${Math.round(activityMetrics.completionRate * 100)}%` })
    }

    const today = new Date().toDateString()
    const todayLogs = userLogs.filter(log => {
      const logDate = new Date(log.interaction_timestamp)
      return logDate.toDateString() === today
    })

    const morningLogs = todayLogs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour >= 6 && hour < 12
    })

    const afternoonLogs = todayLogs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour >= 12 && hour < 18
    })

    const focusTopic = activityMetrics.topicFrequency?.[0] || 'general development'
    const secondaryTopic = activityMetrics.topicFrequency?.[1] || focusTopic

    return {
      morning: morningLogs.length > 0
        ? `Worked through ${morningLogs.length} conversations, centering on ${focusTopic}.`
        : 'No morning activity recorded yet.',
      afternoon: afternoonLogs.length > 0
        ? `Continued with ${afternoonLogs.length} interactions, shifting toward ${secondaryTopic}.`
        : 'Afternoon updates will appear as new activity arrives.',
      keyDecisions: currentProfile?.problem_solving_patterns?.slice(0, 2) || [],
      nextFocus: currentProfile?.growth_areas?.[0] || 'No follow-up items identified',
      quickStats
    }
  }, [userLogs, activityMetrics, currentProfile])

  // Refresh all data
  const refresh = useCallback(async () => {
    try {
      await Promise.all([
        refetchLogs(),
        refetchMetrics(),
        refetchProfiles()
      ])
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Failed to refresh personal insights data:', err)
    }
  }, [refetchLogs, refetchMetrics, refetchProfiles])

  // Run new LLM analysis
  const runNewAnalysis = useCallback(async () => {
    if (!enableLLMAnalysis) return

    setIsAnalyzing(true)
    setAnalysisError(null)

    try {
      const digestResult = await generateDigest(userId, {
        enabled: true,
        cacheMinutes: 15,
        maxConversations: 50
      })

      if (digestResult) {
        // Convert digest result to DeveloperProfile format
        const enhancedProfile: DeveloperProfile = {
          user_id: digestResult.user_id,
          analysis_date: digestResult.analysis_date,
          collaboration_score: 8, // Default value, can be enhanced later
          mentoring_potential: 7, // Default value, can be enhanced later
          expertise_areas: digestResult.key_learnings || [],
          learning_trajectory: digestResult.learning_trajectory || 'Steady development progress',
          communication_style: digestResult.collaboration_patterns || 'Active collaboration with AI assistant',
          problem_solving_patterns: digestResult.progress_highlights || [],
          growth_areas: digestResult.growth_areas || [],
          technical_competencies: [],
          project_contributions: [],
          risk_indicators: []
        }

        setCurrentProfile(enhancedProfile)
        await refetchProfiles() // Refresh to get any stored profiles
        setLastUpdated(new Date())
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Analysis failed'
      setAnalysisError(errorMessage)
      console.error('Personal insights analysis failed:', err)
    } finally {
      setIsAnalyzing(false)
    }
  }, [enableLLMAnalysis, generateDigest, userId, refetchProfiles])

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refresh()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refresh, refreshInterval])

  // Auto-run LLM analysis when LLM is enabled and we have data but no current profile
  useEffect(() => {
    if (enableLLMAnalysis && userLogs && userLogs.length > 0 && !currentProfile && !isAnalyzing) {
      runNewAnalysis()
    }
  }, [enableLLMAnalysis, userLogs, currentProfile, isAnalyzing, runNewAnalysis])

  return {
    // Raw data
    userLogs,
    activityMetrics,
    existingProfiles,

    // Processed data
    currentProfile,
    todaysSummary,

    // Meta information
    isLoading,
    error,
    lastUpdated,

    // LLM analysis
    isAnalyzing,
    analysisError,

    // Actions
    refresh,
    runNewAnalysis,

    // Settings
    enableLLMAnalysis,
    setEnableLLMAnalysis,
    autoRefresh,
    setAutoRefresh
  }
}
