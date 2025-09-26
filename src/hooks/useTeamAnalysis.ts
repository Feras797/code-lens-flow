import { useState, useCallback } from 'react'
import { TeamAnalysisService } from '../services/teamAnalysisService'
import type {
  TeamInsight,
  DeveloperProfile,
  ConversationInsights,
  ProjectHealthMetrics,
  TeamAnalysisRequest,
  AnalysisResult,
  TeamDashboardData
} from '../types/analysis'

// Hook for team health analysis
export function useTeamHealthAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisService] = useState(() => new TeamAnalysisService())

  const analyzeTeamHealth = useCallback(async (request: TeamAnalysisRequest): Promise<TeamInsight | null> => {
    setIsLoading(true)
    setError(null)

    try {
      const result = await analysisService.analyzeTeamHealth(request)

      if (!result.success) {
        throw new Error(result.error || 'Analysis failed')
      }

      return result.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [analysisService])

  return {
    analyzeTeamHealth,
    isLoading,
    error
  }
}

// Hook for developer profile analysis
export function useDeveloperProfileAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisService] = useState(() => new TeamAnalysisService())

  const analyzeDeveloperProfile = useCallback(async (request: TeamAnalysisRequest): Promise<DeveloperProfile | null> => {
    if (!request.user_id) {
      setError('User ID is required for developer profile analysis')
      return null
    }

    setIsLoading(true)
    setError(null)

    try {
      const result = await analysisService.analyzeDeveloperProfile(request)

      if (!result.success) {
        throw new Error(result.error || 'Profile analysis failed')
      }

      return result.data || null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred'
      setError(errorMessage)
      return null
    } finally {
      setIsLoading(false)
    }
  }, [analysisService])

  return {
    analyzeDeveloperProfile,
    isLoading,
    error
  }
}

// Hook for batch conversation analysis
export function useConversationAnalysis() {
  const [isLoading, setIsLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [analysisService] = useState(() => new TeamAnalysisService())

  const analyzeConversations = useCallback(async (
    projectId?: string,
    limit = 50
  ): Promise<ConversationInsights[]> => {
    setIsLoading(true)
    setError(null)
    setProgress(0)

    try {
      // Fetch conversations first
      const request: TeamAnalysisRequest = {
        project_id: projectId,
        analysis_type: 'conversation_insights',
        conversation_limit: limit
      }

      const conversations = await (analysisService as any).fetchConversations(request)

      if (conversations.length === 0) {
        return []
      }

      // Batch analyze with progress tracking
      const batchSize = 10
      const totalBatches = Math.ceil(conversations.length / batchSize)
      const results: ConversationInsights[] = []

      for (let i = 0; i < conversations.length; i += batchSize) {
        const batch = conversations.slice(i, i + batchSize)
        const batchResults = await analysisService.batchAnalyzeConversations(batch)
        results.push(...batchResults)

        setProgress(((i / batchSize + 1) / totalBatches) * 100)
      }

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Conversation analysis failed'
      setError(errorMessage)
      return []
    } finally {
      setIsLoading(false)
      setProgress(100)
    }
  }, [analysisService])

  return {
    analyzeConversations,
    isLoading,
    progress,
    error
  }
}

// Composite hook for complete team dashboard data
export function useTeamDashboard(projectId?: string) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<TeamDashboardData | null>(null)
  const [analysisService] = useState(() => new TeamAnalysisService())

  const loadDashboardData = useCallback(async () => {
    if (!projectId) {
      setError('Project ID is required')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Prepare analysis requests
      const baseRequest: TeamAnalysisRequest = {
        project_id: projectId,
        analysis_type: 'team_health',
        conversation_limit: 100,
        time_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Last 30 days
          end_date: new Date().toISOString()
        }
      }

      // Run parallel analyses
      const [teamHealthResult, conversationsData] = await Promise.all([
        analysisService.analyzeTeamHealth(baseRequest),
        (analysisService as any).fetchConversations(baseRequest)
      ])

      if (!teamHealthResult.success) {
        throw new Error(teamHealthResult.error || 'Team analysis failed')
      }

      // Get unique users for individual profiles
      const uniqueUsers = [...new Set(conversationsData.map((c: any) => c.user_id))]
      const profilePromises = uniqueUsers.slice(0, 5).map(userId => // Limit to 5 users to avoid API limits
        analysisService.analyzeDeveloperProfile({
          ...baseRequest,
          user_id: userId,
          analysis_type: 'developer_profile'
        })
      )

      const profileResults = await Promise.all(profilePromises)
      const validProfiles = profileResults
        .filter(result => result.success && result.data)
        .map(result => result.data!)

      // Create conversation summary
      const conversationSummary = {
        total_conversations: conversationsData.length,
        topics_trending: teamHealthResult.data?.key_topics.slice(0, 5) || [],
        most_active_users: uniqueUsers.slice(0, 3),
        learning_momentum: teamHealthResult.data?.team_health_score || 5
      }

      const dashboardData: TeamDashboardData = {
        team_insights: teamHealthResult.data ? [teamHealthResult.data] : [],
        developer_profiles: validProfiles,
        project_health: [], // This would be implemented in a separate analysis
        recent_risks: [], // This would be implemented in risk assessment
        conversation_summary: conversationSummary
      }

      setData(dashboardData)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Dashboard data loading failed'
      setError(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }, [projectId, analysisService])

  return {
    data,
    isLoading,
    error,
    loadDashboardData,
    refresh: loadDashboardData
  }
}

// Hook for real-time analysis triggers
export function useAnalysisTrigger() {
  const [analysisService] = useState(() => new TeamAnalysisService())

  const triggerAnalysis = useCallback(async (
    type: 'team_health' | 'developer_profile' | 'conversation_insights',
    request: TeamAnalysisRequest
  ) => {
    switch (type) {
      case 'team_health':
        return await analysisService.analyzeTeamHealth(request)
      case 'developer_profile':
        return await analysisService.analyzeDeveloperProfile(request)
      case 'conversation_insights':
        // This would trigger batch conversation analysis
        const conversations = await (analysisService as any).fetchConversations(request)
        return await analysisService.batchAnalyzeConversations(conversations)
      default:
        throw new Error(`Unknown analysis type: ${type}`)
    }
  }, [analysisService])

  return { triggerAnalysis }
}

// Hook for caching and storage
export function useAnalysisCache() {
  const [cache, setCache] = useState<Map<string, any>>(new Map())

  const getCachedAnalysis = useCallback((key: string) => {
    return cache.get(key)
  }, [cache])

  const setCachedAnalysis = useCallback((key: string, data: any) => {
    setCache(prev => new Map(prev).set(key, {
      data,
      timestamp: Date.now(),
      expires: Date.now() + 30 * 60 * 1000 // 30 minutes cache
    }))
  }, [])

  const isCacheValid = useCallback((key: string): boolean => {
    const cached = cache.get(key)
    return cached && cached.expires > Date.now()
  }, [cache])

  return {
    getCachedAnalysis,
    setCachedAnalysis,
    isCacheValid,
    clearCache: () => setCache(new Map())
  }
}