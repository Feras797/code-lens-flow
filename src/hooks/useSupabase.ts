import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { PostgrestError } from '@supabase/supabase-js'
import {
  analyzeConversationTopics,
  analyzeActivityByDay,
  analyzeUserContributions,
  analyzeDevelopmentPatterns,
  calculateAverageResponseTime,
  getMostActiveProject,
  analyzeTimeDistribution,
  analyzeUserTopics,
  calculateProductivityScore,
  analyzeLearningPatterns
} from '../lib/chatAnalytics'

// Claude Chat Log Types
export interface ClaudeChatLog {
  id: string
  user_query: string
  claude_response: string | null
  user_id: string
  project_id: string
  interaction_timestamp: string
  created_at: string
  updated_at: string
  anonymous_user_id: string
  project_name: string
  installation_id: string
  status: 'pending' | 'completed'
  completed_at: string | null
}

// Generic hook for Supabase queries
export function useSupabaseQuery<T>(
  queryFn: () => Promise<{ data: T | null; error: PostgrestError | null }>,
  dependencies: any[] = []
) {
  const [data, setData] = useState<T | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data: result, error: queryError } = await queryFn()
      
      if (queryError) {
        throw queryError
      }
      
      setData(result)
    } catch (err: any) {
      console.error('Query error:', err)
      setError(err.message || 'Failed to fetch data')
    } finally {
      setIsLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return { data, isLoading, error, refetch: fetchData }
}

// Hook to fetch all companies
export function useCompanies() {
  return useSupabaseQuery(() =>
    supabase
      .from('companies')
      .select('*')
      .order('name')
  )
}

// Hook to fetch a single company
export function useCompany(companyId: string) {
  return useSupabaseQuery(() =>
    supabase
      .from('companies')
      .select('*')
      .eq('id', companyId)
      .single(),
    [companyId]
  )
}

// Hook to fetch facilities for a company
export function useFacilities(companyId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase.from('facilities').select('*')
    
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    return query.order('name')
  }, [companyId])
}

// Hook to fetch environmental metrics
export function useEnvironmentalMetrics(facilityId?: string, limit = 100) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('environmental_metrics')
      .select('*')
      .order('recorded_at', { ascending: false })
      .limit(limit)
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    return query
  }, [facilityId, limit])
}

// Hook to fetch reference patches for a facility
export function useReferencePatches(facilityId: string) {
  return useSupabaseQuery(() =>
    supabase
      .from('reference_patches')
      .select('*')
      .eq('facility_id', facilityId)
      .order('similarity_score', { ascending: false }),
    [facilityId]
  )
}

// Hook to fetch reports
export function useReports(companyId?: string, facilityId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('reports')
      .select('*')
      .order('generated_at', { ascending: false })
    
    if (companyId) {
      query = query.eq('company_id', companyId)
    }
    
    if (facilityId) {
      query = query.eq('facility_id', facilityId)
    }
    
    return query
  }, [companyId, facilityId])
}

// Hook for real-time subscription to environmental metrics
export function useRealtimeMetrics(facilityId?: string) {
  const [metrics, setMetrics] = useState<any[]>([])
  
  useEffect(() => {
    if (!facilityId) return
    
    // Initial fetch
    const fetchInitial = async () => {
      const { data } = await supabase
        .from('environmental_metrics')
        .select('*')
        .eq('facility_id', facilityId)
        .order('recorded_at', { ascending: false })
        .limit(50)
      
      if (data) {
        setMetrics(data)
      }
    }
    
    fetchInitial()
    
    // Subscribe to changes
    const subscription = supabase
      .channel(`metrics:${facilityId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'environmental_metrics',
          filter: `facility_id=eq.${facilityId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setMetrics((prev) => [payload.new, ...prev].slice(0, 50))
          } else if (payload.eventType === 'UPDATE') {
            setMetrics((prev) =>
              prev.map((m) => (m.id === payload.new.id ? payload.new : m))
            )
          } else if (payload.eventType === 'DELETE') {
            setMetrics((prev) => prev.filter((m) => m.id !== payload.old.id))
          }
        }
      )
      .subscribe()
    
    return () => {
      subscription.unsubscribe()
    }
  }, [facilityId])
  
  return metrics
}

// Hook for aggregated environmental data
export function useAggregatedMetrics(facilityId: string, metricType: string, period: 'day' | 'week' | 'month' | 'year' = 'month') {
  return useSupabaseQuery(async () => {
    // This would ideally be a database function or view
    // For now, we'll fetch and aggregate client-side
    const { data, error } = await supabase
      .from('environmental_metrics')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('metric_type', metricType)
      .order('recorded_at')
    
    if (error) return { data: null, error }
    
    // Aggregate data based on period
    // This is a simplified example - you'd want more sophisticated aggregation
    const aggregated = data?.reduce((acc, metric) => {
      const date = new Date(metric.recorded_at)
      let key: string
      
      switch (period) {
        case 'day':
          key = date.toISOString().split('T')[0]
          break
        case 'week':
          const weekNum = Math.ceil((date.getDate() - date.getDay() + 1) / 7)
          key = `${date.getFullYear()}-W${weekNum}`
          break
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
          break
        case 'year':
          key = String(date.getFullYear())
          break
        default:
          key = date.toISOString()
      }
      
      if (!acc[key]) {
        acc[key] = {
          period: key,
          values: [],
          average: 0,
          min: Infinity,
          max: -Infinity,
          count: 0
        }
      }
      
      acc[key].values.push(metric.value)
      acc[key].count++
      acc[key].min = Math.min(acc[key].min, metric.value)
      acc[key].max = Math.max(acc[key].max, metric.value)
      
      return acc
    }, {} as Record<string, any>)
    
    // Calculate averages
    if (aggregated) {
      Object.values(aggregated).forEach((item: any) => {
        item.average = item.values.reduce((a: number, b: number) => a + b, 0) / item.values.length
      })
    }
    
    return { 
      data: aggregated ? Object.values(aggregated) : null, 
      error: null 
    }
  }, [facilityId, metricType, period])
}

// Hook to create a new company
export function useCreateCompany() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createCompany = async (company: {
    name: string
    description?: string
    logo_url?: string
  }) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: createError } = await supabase
        .from('companies')
        .insert(company)
        .select()
        .single()
      
      if (createError) throw createError
      
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to create company')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { createCompany, isLoading, error }
}

// Hook to update environmental metrics
export function useUpdateMetric() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const updateMetric = async (
    metricId: string,
    updates: { value?: number; unit?: string }
  ) => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { data, error: updateError } = await supabase
        .from('environmental_metrics')
        .update(updates)
        .eq('id', metricId)
        .select()
        .single()
      
      if (updateError) throw updateError
      
      return data
    } catch (err: any) {
      setError(err.message || 'Failed to update metric')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { updateMetric, isLoading, error }
}

// =============================================================================
// CLAUDE CHAT HISTORY HOOKS
// =============================================================================

// Hook to fetch all Claude chat logs
export function useClaudeChatLogs(limit = 100) {
  return useSupabaseQuery<ClaudeChatLog[]>(() =>
    supabase
      .from('claude_chat_logs')
      .select('*')
      .order('interaction_timestamp', { ascending: false })
      .limit(limit)
  )
}

// Hook to fetch chat logs for a specific project
export function useProjectChatLogs(projectId?: string, limit = 50) {
  return useSupabaseQuery<ClaudeChatLog[]>(() => {
    let query = supabase
      .from('claude_chat_logs')
      .select('*')
      .order('interaction_timestamp', { ascending: false })
      .limit(limit)

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    return query
  }, [projectId, limit])
}

// Hook to fetch chat logs for a specific user
export function useUserChatLogs(userId?: string, limit = 50) {
  return useSupabaseQuery<ClaudeChatLog[]>(() => {
    let query = supabase
      .from('claude_chat_logs')
      .select('*')
      .order('interaction_timestamp', { ascending: false })
      .limit(limit)

    if (userId) {
      query = query.eq('user_id', userId)
    }

    return query
  }, [userId, limit])
}

// Hook for project-specific chat analysis with insights
export function useProjectChatAnalysis(projectId?: string) {
  return useSupabaseQuery(async () => {
    if (!projectId) return { data: null, error: null }

    const { data: logs, error } = await supabase
      .from('claude_chat_logs')
      .select('*')
      .eq('project_id', projectId)
      .order('interaction_timestamp', { ascending: true })

    if (error) return { data: null, error }
    if (!logs) return { data: null, error: null }

    // Analyze the conversation data
    const analysis = {
      totalConversations: logs.length,
      completedConversations: logs.filter(log => log.status === 'completed').length,
      pendingConversations: logs.filter(log => log.status === 'pending').length,
      uniqueUsers: new Set(logs.map(log => log.user_id)).size,
      dateRange: {
        earliest: logs[0]?.interaction_timestamp,
        latest: logs[logs.length - 1]?.interaction_timestamp
      },
      topicAnalysis: analyzeConversationTopics(logs),
      activityByDay: analyzeActivityByDay(logs),
      userContributions: analyzeUserContributions(logs),
      developmentPatterns: analyzeDevelopmentPatterns(logs)
    }

    return { data: analysis, error: null }
  }, [projectId])
}

// Hook for user activity metrics and development patterns
export function useUserActivityMetrics(userId?: string, timeframe?: 'day' | 'week' | 'month') {
  return useSupabaseQuery(async () => {
    if (!userId) return { data: null, error: null }

    let timeFilter = ''
    const now = new Date()

    switch (timeframe) {
      case 'day':
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
        timeFilter = today.toISOString()
        break
      case 'week':
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        timeFilter = weekAgo.toISOString()
        break
      case 'month':
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        timeFilter = monthAgo.toISOString()
        break
    }

    let query = supabase
      .from('claude_chat_logs')
      .select('*')
      .eq('user_id', userId)
      .order('interaction_timestamp', { ascending: true })

    if (timeFilter) {
      query = query.gte('interaction_timestamp', timeFilter)
    }

    const { data: logs, error } = await query

    if (error) return { data: null, error }
    if (!logs) return { data: null, error: null }

    const metrics = {
      totalInteractions: logs.length,
      completedInteractions: logs.filter(log => log.status === 'completed').length,
      averageResponseTime: calculateAverageResponseTime(logs),
      projectsWorkedOn: new Set(logs.map(log => log.project_id)).size,
      mostActiveProject: getMostActiveProject(logs),
      timeDistribution: analyzeTimeDistribution(logs),
      topicFrequency: analyzeUserTopics(logs),
      productivityScore: calculateProductivityScore(logs),
      learningPatterns: analyzeLearningPatterns(logs)
    }

    return { data: metrics, error: null }
  }, [userId, timeframe])
}

// Hook for aggregated project metrics across all projects
export function useProjectMetricsOverview() {
  return useSupabaseQuery(async () => {
    const { data: logs, error } = await supabase
      .from('claude_chat_logs')
      .select('*')
      .order('interaction_timestamp', { ascending: false })

    if (error) return { data: null, error }
    if (!logs) return { data: null, error: null }

    // Group by project
    const projectGroups = logs.reduce((acc, log) => {
      if (!acc[log.project_id]) {
        acc[log.project_id] = []
      }
      acc[log.project_id].push(log)
      return acc
    }, {} as Record<string, ClaudeChatLog[]>)

    // Calculate metrics for each project
    const projectMetrics = Object.entries(projectGroups).map(([projectId, projectLogs]) => {
      const analysis = {
        projectId,
        projectName: projectLogs[0]?.project_name || 'Unknown',
        totalConversations: projectLogs.length,
        completedConversations: projectLogs.filter(log => log.status === 'completed').length,
        uniqueUsers: new Set(projectLogs.map(log => log.user_id)).size,
        lastActivity: projectLogs[0]?.interaction_timestamp,
        topTopics: analyzeConversationTopics(projectLogs).slice(0, 3),
        activityLevel: calculateProjectActivityLevel(projectLogs),
        completionRate: projectLogs.filter(log => log.status === 'completed').length / projectLogs.length
      }
      return analysis
    })

    const overview = {
      totalProjects: projectMetrics.length,
      totalConversations: logs.length,
      totalUsers: new Set(logs.map(log => log.user_id)).size,
      averageCompletionRate: projectMetrics.reduce((sum, p) => sum + p.completionRate, 0) / projectMetrics.length,
      mostActiveProject: projectMetrics.sort((a, b) => b.totalConversations - a.totalConversations)[0],
      projectBreakdown: projectMetrics.sort((a, b) => b.totalConversations - a.totalConversations),
      globalTopics: analyzeConversationTopics(logs).slice(0, 5),
      activityTrends: analyzeActivityByDay(logs).slice(-30) // Last 30 days
    }

    return { data: overview, error: null }
  })
}

// Helper function to calculate project activity level
function calculateProjectActivityLevel(logs: ClaudeChatLog[]): 'high' | 'medium' | 'low' {
  const recentLogs = logs.filter(log => {
    const logDate = new Date(log.interaction_timestamp)
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
    return logDate > weekAgo
  })

  if (recentLogs.length >= 10) return 'high'
  if (recentLogs.length >= 3) return 'medium'
  return 'low'
}

// Hook for real-time chat log subscription
export function useRealtimeChatLogs(projectId?: string) {
  const [logs, setLogs] = useState<ClaudeChatLog[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Initial fetch
    const fetchInitialLogs = async () => {
      setIsLoading(true)
      let query = supabase
        .from('claude_chat_logs')
        .select('*')
        .order('interaction_timestamp', { ascending: false })
        .limit(50)

      if (projectId) {
        query = query.eq('project_id', projectId)
      }

      const { data } = await query
      if (data) {
        setLogs(data)
      }
      setIsLoading(false)
    }

    fetchInitialLogs()

    // Set up real-time subscription
    const channel = supabase
      .channel(projectId ? `project-logs:${projectId}` : 'all-logs')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claude_chat_logs',
          ...(projectId ? { filter: `project_id=eq.${projectId}` } : {})
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setLogs((prev) => [payload.new as ClaudeChatLog, ...prev].slice(0, 50))
          } else if (payload.eventType === 'UPDATE') {
            setLogs((prev) =>
              prev.map((log) =>
                log.id === payload.new.id ? (payload.new as ClaudeChatLog) : log
              )
            )
          } else if (payload.eventType === 'DELETE') {
            setLogs((prev) => prev.filter((log) => log.id !== payload.old.id))
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [projectId])

  return { logs, isLoading }
}

// =============================================================================
// LANGCHAIN ANALYSIS RESULT HOOKS
// =============================================================================

// Hook to store team insight analysis results
export function useStoreTeamInsight() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storeInsight = async (insight: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('team_insights')
        .insert(insight)
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err: any) {
      setError(err.message || 'Failed to store team insight')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { storeInsight, isLoading, error }
}

// Hook to store developer profile analysis results
export function useStoreDeveloperProfile() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const storeProfile = async (profile: any) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('developer_profiles')
        .insert(profile)
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err: any) {
      setError(err.message || 'Failed to store developer profile')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return { storeProfile, isLoading, error }
}

// Hook to fetch latest team insights
export function useLatestTeamInsights(projectId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('latest_team_insights')
      .select('*')
      .order('analysis_date', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    return query
  }, [projectId])
}

// Hook to fetch latest developer profiles
export function useLatestDeveloperProfiles(userId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('latest_developer_profiles')
      .select('*')
      .order('analysis_date', { ascending: false })

    if (userId) {
      query = query.eq('user_id', userId)
    }

    return query
  }, [userId])
}

// Hook to fetch conversation insights
export function useConversationInsights(conversationId?: string, limit = 50) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('conversation_insights')
      .select('*')
      .order('analysis_date', { ascending: false })
      .limit(limit)

    if (conversationId) {
      query = query.eq('conversation_id', conversationId)
    }

    return query
  }, [conversationId, limit])
}

// Hook to fetch active risks
export function useActiveRisks(projectId?: string) {
  return useSupabaseQuery(() => {
    let query = supabase
      .from('active_risks')
      .select('*')
      .order('severity', { ascending: false })

    if (projectId) {
      query = query.eq('project_id', projectId)
    }

    return query
  }, [projectId])
}

// Hook to manage analysis jobs
export function useAnalysisJobs() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const createJob = async (jobData: {
    job_type: string
    project_id?: string
    user_id?: string
    request_parameters: any
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const { data, error: insertError } = await supabase
        .from('analysis_jobs')
        .insert({
          ...jobData,
          status: 'pending'
        })
        .select()
        .single()

      if (insertError) throw insertError

      return data
    } catch (err: any) {
      setError(err.message || 'Failed to create analysis job')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateJob = async (jobId: string, updates: {
    status?: string
    result_data?: any
    error_message?: string
    conversations_analyzed?: number
    processing_time_ms?: number
  }) => {
    setIsLoading(true)
    setError(null)

    try {
      const updateData: any = { ...updates }

      if (updates.status === 'running' && !updates.started_at) {
        updateData.started_at = new Date().toISOString()
      } else if (updates.status === 'completed' || updates.status === 'failed') {
        updateData.completed_at = new Date().toISOString()
      }

      const { data, error: updateError } = await supabase
        .from('analysis_jobs')
        .update(updateData)
        .eq('id', jobId)
        .select()
        .single()

      if (updateError) throw updateError

      return data
    } catch (err: any) {
      setError(err.message || 'Failed to update analysis job')
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const getJobStatus = async (jobId: string) => {
    const { data, error: selectError } = await supabase
      .from('analysis_jobs')
      .select('*')
      .eq('id', jobId)
      .single()

    if (selectError) throw selectError

    return data
  }

  return { createJob, updateJob, getJobStatus, isLoading, error }
}
