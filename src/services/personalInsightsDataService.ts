import { supabase } from '@/lib/supabase'
import usePersonalInsightsStore from '@/stores/usePersonalInsightsStore'
import type { ClaudeChatLog } from '@/hooks/useSupabase'
import type { DeveloperProfile } from '@/types/analysis'
import type { DevelopmentEvent, TimelineAnalysis } from '@/hooks/useDevelopmentTimeline'
import { personalInsightsDailyRecapService } from '@/services/personalInsightsDailyRecap'

// Request deduplication
const pendingRequests = new Map<string, Promise<any>>()

// Helper to deduplicate requests
function deduplicateRequest<T>(key: string, requestFn: () => Promise<T>): Promise<T> {
  const existing = pendingRequests.get(key)
  if (existing) {
    return existing
  }

  const promise = requestFn().finally(() => {
    pendingRequests.delete(key)
  })

  pendingRequests.set(key, promise)
  return promise
}

export class PersonalInsightsDataService {
  private static instance: PersonalInsightsDataService
  private subscriptions: Map<string, any> = new Map()

  private constructor() {}

  static getInstance(): PersonalInsightsDataService {
    if (!PersonalInsightsDataService.instance) {
      PersonalInsightsDataService.instance = new PersonalInsightsDataService()
    }
    return PersonalInsightsDataService.instance
  }

  // Fetch user chat logs with caching
  async fetchUserChatLogs(userId: string, limit = 50): Promise<ClaudeChatLog[]> {
    const store = usePersonalInsightsStore.getState()
    const cacheKey = `chat_logs_${userId}_${limit}`

    // Check cache first
    const cached = store.getCachedData<ClaudeChatLog[]>(cacheKey)
    if (cached) {
      return cached
    }

    // Deduplicate concurrent requests
    return deduplicateRequest(cacheKey, async () => {
      try {
        const { data, error } = await supabase
          .from('claude_chat_logs')
          .select('*')
          .eq('user_id', userId)
          .order('interaction_timestamp', { ascending: false })
          .limit(limit)

        if (error) throw error

        const logs = data || []

        // Update store and cache
        store.setUserLogs(logs)
        store.setCachedData(cacheKey, logs, 5) // Cache for 5 minutes

        return logs
      } catch (error) {
        console.error('Error fetching chat logs:', error)
        store.setError(error instanceof Error ? error.message : 'Failed to fetch chat logs')
        return []
      }
    })
  }

  // Fetch activity metrics
  async fetchActivityMetrics(userId: string, timeframe: 'day' | 'week' | 'month' = 'day'): Promise<any> {
    const store = usePersonalInsightsStore.getState()
    const cacheKey = `activity_metrics_${userId}_${timeframe}`

    // Check cache
    const cached = store.getCachedData<any>(cacheKey)
    if (cached) {
      return cached
    }

    return deduplicateRequest(cacheKey, async () => {
      try {
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

        if (error) throw error

        // Calculate metrics
        const metrics = this.calculateActivityMetrics(logs || [])

        // Update store and cache
        store.setActivityMetrics(metrics)
        store.setCachedData(cacheKey, metrics, 10) // Cache for 10 minutes

        return metrics
      } catch (error) {
        console.error('Error fetching activity metrics:', error)
        store.setError(error instanceof Error ? error.message : 'Failed to fetch activity metrics')
        return null
      }
    })
  }

  // Fetch developer profiles
  async fetchDeveloperProfiles(userId: string): Promise<DeveloperProfile[]> {
    const store = usePersonalInsightsStore.getState()
    const cacheKey = `developer_profiles_${userId}`

    // Check cache
    const cached = store.getCachedData<DeveloperProfile[]>(cacheKey)
    if (cached) {
      return cached
    }

    return deduplicateRequest(cacheKey, async () => {
      try {
        const { data, error } = await supabase
          .from('latest_developer_profiles')
          .select('*')
          .eq('user_id', userId)
          .order('analysis_date', { ascending: false })

        if (error) throw error

        const profiles = data || []

        // Update store and cache
        store.setDeveloperProfiles(profiles)
        store.setCachedData(cacheKey, profiles, 15) // Cache for 15 minutes

        return profiles
      } catch (error) {
        console.error('Error fetching developer profiles:', error)
        // Soft-fail so the UI can continue rendering without surfacing a destructive error
        return []
      }
    })
  }

  // Fetch timeline events with proper date range
  async fetchTimelineEvents(
    userId: string,
    projectId?: string,
    dateRange?: { start: string; end: string },
    limit = 50
  ): Promise<DevelopmentEvent[]> {
    const store = usePersonalInsightsStore.getState()
    const cacheKey = `timeline_events_${userId}_${projectId}_${dateRange?.start}_${dateRange?.end}_${limit}`

    // Check cache
    const cached = store.getCachedData<DevelopmentEvent[]>(cacheKey)
    if (cached) {
      return cached
    }

    return deduplicateRequest(cacheKey, async () => {
      try {
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

        if (dateRange?.start) {
          query = query.gte('interaction_timestamp', dateRange.start)
        }

        if (dateRange?.end) {
          query = query.lte('interaction_timestamp', dateRange.end)
        }

        const { data: logs, error } = await query

        if (error) throw error

        // Transform logs to events
        const events = await this.transformLogsToEvents(logs || [])

        // Update store and cache
        store.setTimelineEvents(events)
        store.setCachedData(cacheKey, events, 5) // Cache for 5 minutes

        return events
      } catch (error) {
        console.error('Error fetching timeline events:', error)
        store.setError(error instanceof Error ? error.message : 'Failed to fetch timeline events')
        return []
      }
    })
  }

  // Setup real-time subscriptions
  setupRealtimeSubscription(userId: string): () => void {
    const store = usePersonalInsightsStore.getState()

    // Clean up existing subscription
    this.cleanupSubscription(userId)

    const channel = supabase
      .channel(`personal-insights-${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'claude_chat_logs',
          filter: `user_id=eq.${userId}`
        },
        async (payload) => {
          // Handle real-time updates
          if (payload.eventType === 'INSERT') {
            // Invalidate cache and refetch
            const cacheKeys = Array.from(store.cache.keys())
            cacheKeys.forEach(key => {
              if (key.includes(userId)) {
                store.cache.delete(key)
              }
            })

            // Refetch relevant data
            await this.fetchUserChatLogs(userId)
            await this.fetchActivityMetrics(userId)
          }
        }
      )
      .subscribe()

    this.subscriptions.set(userId, channel)

    // Return cleanup function
    return () => this.cleanupSubscription(userId)
  }

  private cleanupSubscription(userId: string) {
    const channel = this.subscriptions.get(userId)
    if (channel) {
      supabase.removeChannel(channel)
      this.subscriptions.delete(userId)
    }
  }

  // Transform logs to development events (optimized)
  private async transformLogsToEvents(logs: ClaudeChatLog[]): Promise<DevelopmentEvent[]> {
    return logs.map(log => {
      const timestamp = new Date(log.interaction_timestamp)
      const query = log.user_query?.toLowerCase() || ''

      // Determine event type and properties
      let type: DevelopmentEvent['type'] = 'feature'
      let category: DevelopmentEvent['category'] = 'code'
      let impact: DevelopmentEvent['impact'] = 'medium'
      let status: DevelopmentEvent['status'] = log.status === 'completed' ? 'completed' : 'in-progress'

      if (query.includes('bug') || query.includes('error') || query.includes('fix')) {
        type = 'bug'
        category = 'debugging'
        impact = 'high'
      } else if (query.includes('test')) {
        type = 'testing'
      } else if (query.includes('refactor')) {
        type = 'refactor'
      } else if (query.includes('document')) {
        type = 'documentation'
        category = 'planning'
      } else if (query.includes('deploy')) {
        type = 'deployment'
        impact = 'critical'
      } else if (query.includes('learn') || query.includes('how') || query.includes('what')) {
        type = 'learning'
        impact = 'low'
      }

      return {
        id: log.id,
        timestamp: log.interaction_timestamp,
        date: timestamp.toISOString().split('T')[0],
        time: timestamp.toTimeString().slice(0, 5),
        type,
        category,
        title: this.truncate(log.user_query || 'Development activity', 100),
        description: this.truncate(log.claude_response || 'Processing...', 200),
        impact,
        status,
        duration: this.estimateDuration(log)
      }
    })
  }

  private calculateActivityMetrics(logs: ClaudeChatLog[]): any {
    const totalInteractions = logs.length
    const completedInteractions = logs.filter(log => log.status === 'completed').length
    const projectsWorkedOn = new Set(logs.map(log => log.project_id)).size

    // Topic frequency analysis
    const topics = logs.reduce((acc, log) => {
      const query = log.user_query?.toLowerCase() || ''

      if (query.includes('react') || query.includes('component')) acc.push('React')
      if (query.includes('api') || query.includes('endpoint')) acc.push('API Development')
      if (query.includes('database') || query.includes('sql')) acc.push('Database')
      if (query.includes('test')) acc.push('Testing')
      if (query.includes('bug') || query.includes('error')) acc.push('Debugging')

      return acc
    }, [] as string[])

    const topicFrequency = [...new Set(topics)]

    return {
      totalInteractions,
      completedInteractions,
      projectsWorkedOn,
      topicFrequency,
      completionRate: totalInteractions > 0 ? completedInteractions / totalInteractions : 0,
      averageResponseTime: this.calculateAverageResponseTime(logs)
    }
  }

  private calculateAverageResponseTime(logs: ClaudeChatLog[]): number {
    const completedLogs = logs.filter(log => log.status === 'completed' && log.completed_at)

    if (completedLogs.length === 0) return 0

    const totalTime = completedLogs.reduce((sum, log) => {
      const start = new Date(log.interaction_timestamp).getTime()
      const end = new Date(log.completed_at!).getTime()
      return sum + (end - start)
    }, 0)

    return Math.round(totalTime / completedLogs.length / 1000) // Return in seconds
  }

  private estimateDuration(log: ClaudeChatLog): number {
    const queryLength = log.user_query?.length || 0
    const responseLength = log.claude_response?.length || 0

    const baseTime = 5 // Base 5 minutes
    const complexityFactor = Math.min((queryLength + responseLength) / 500, 10)

    return Math.round(baseTime + complexityFactor * 5)
  }

  private truncate(text: string, maxLength: number): string {
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  // Refresh all data
  async refreshAllData(userId: string, projectId?: string): Promise<void> {
    const store = usePersonalInsightsStore.getState()

    store.setIsLoading(true)
    store.setError(null)

    try {
      // Fetch all data in parallel
      const [logs, metrics, profiles] = await Promise.all([
        this.fetchUserChatLogs(userId),
        this.fetchActivityMetrics(userId),
        this.fetchDeveloperProfiles(userId)
      ])

      try {
        const recap = await personalInsightsDailyRecapService.generateDailyRecap({
          logs,
          metrics
        })

        store.setDailySummary(recap)
      } catch (recapError) {
        console.error('Failed to build daily recap:', recapError)
        store.setDailySummary(null)
      }

      // Fetch timeline data
      const timeRange = this.getTimeRangeForStore()
      await this.fetchTimelineEvents(userId, projectId, timeRange)

      store.setLastRefresh(new Date())
    } catch (error) {
      console.error('Error refreshing data:', error)
      store.setError(error instanceof Error ? error.message : 'Failed to refresh data')
    } finally {
      store.setIsLoading(false)
    }
  }

  private getTimeRangeForStore(): { start: string; end: string } {
    const store = usePersonalInsightsStore.getState()
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

    return {
      start: start.toISOString(),
      end: end.toISOString()
    }
  }
}

// Export singleton instance
export const personalInsightsDataService = PersonalInsightsDataService.getInstance()
