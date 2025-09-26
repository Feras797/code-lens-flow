import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { DeveloperProfile } from '@/types/analysis'
import type { ClaudeChatLog } from '@/hooks/useSupabase'
import type { DevelopmentEvent, TimelineAnalysis } from '@/hooks/useDevelopmentTimeline'

// Cache entry type
interface CacheEntry<T> {
  data: T
  timestamp: number
  expiresAt: number
}

// Store state interface
interface PersonalInsightsState {
  // Core data
  userId: string | null
  projectId: string | null

  // Cached data from Supabase
  userLogs: ClaudeChatLog[] | null
  activityMetrics: any | null
  developerProfiles: DeveloperProfile[] | null
  currentProfile: DeveloperProfile | null

  // Timeline data
  timelineEvents: DevelopmentEvent[]
  timelineAnalysis: TimelineAnalysis | null
  timeRange: 'today' | 'week' | 'month' | 'all'
  filterType: string

  // LLM Analysis results
  llmAnalysis: {
    profile: any | null
    timeline: any | null
    digest: any | null
    lastUpdated: Date | null
  }

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
  refreshInterval: number
  cacheEnabled: boolean
  cacheDuration: number // in minutes

  // Cache management
  cache: Map<string, CacheEntry<any>>

  // Actions
  setUserId: (userId: string) => void
  setProjectId: (projectId: string) => void
  setUserLogs: (logs: ClaudeChatLog[]) => void
  setActivityMetrics: (metrics: any) => void
  setDeveloperProfiles: (profiles: DeveloperProfile[]) => void
  setCurrentProfile: (profile: DeveloperProfile | null) => void
  setTimelineEvents: (events: DevelopmentEvent[]) => void
  setTimelineAnalysis: (analysis: TimelineAnalysis | null) => void
  setTimeRange: (range: 'today' | 'week' | 'month' | 'all') => void
  setFilterType: (type: string) => void
  setLLMAnalysis: (type: 'profile' | 'timeline' | 'digest', data: any) => void
  setIsLoading: (loading: boolean) => void
  setIsAnalyzing: (analyzing: boolean) => void
  setError: (error: string | null) => void
  setLastRefresh: (date: Date) => void
  toggleExpandedSection: (section: string) => void
  setSelectedTab: (tab: 'timeline' | 'insights' | 'analysis') => void
  setEnableLLMAnalysis: (enabled: boolean) => void
  setAutoRefresh: (enabled: boolean) => void
  setRefreshInterval: (interval: number) => void

  // Cache actions
  getCachedData: <T>(key: string) => T | null
  setCachedData: <T>(key: string, data: T, ttlMinutes?: number) => void
  clearCache: () => void
  clearExpiredCache: () => void

  // Composite actions
  reset: () => void
  refreshAllData: () => Promise<void>
  runLLMAnalysis: (type: 'all' | 'profile' | 'timeline' | 'digest') => Promise<void>
}

// Create the store
const usePersonalInsightsStore = create<PersonalInsightsState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        userId: null,
        projectId: null,
        userLogs: null,
        activityMetrics: null,
        developerProfiles: null,
        currentProfile: null,
        timelineEvents: [],
        timelineAnalysis: null,
        timeRange: 'week',
        filterType: 'all',
        llmAnalysis: {
          profile: null,
          timeline: null,
          digest: null,
          lastUpdated: null
        },
        isLoading: false,
        isAnalyzing: false,
        error: null,
        lastRefresh: null,
        expandedSections: new Set(['morning', 'afternoon']),
        selectedTab: 'timeline',
        enableLLMAnalysis: false,
        autoRefresh: false,
        refreshInterval: 60000,
        cacheEnabled: true,
        cacheDuration: 15,
        cache: new Map(),

        // Basic setters
        setUserId: (userId) => set({ userId }),
        setProjectId: (projectId) => set({ projectId }),
        setUserLogs: (logs) => set({ userLogs: logs }),
        setActivityMetrics: (metrics) => set({ activityMetrics: metrics }),
        setDeveloperProfiles: (profiles) => set({
          developerProfiles: profiles,
          currentProfile: profiles && profiles.length > 0 ? profiles[0] : null
        }),
        setCurrentProfile: (profile) => set({ currentProfile: profile }),
        setTimelineEvents: (events) => set({ timelineEvents: events }),
        setTimelineAnalysis: (analysis) => set({ timelineAnalysis: analysis }),
        setTimeRange: (range) => set({ timeRange: range }),
        setFilterType: (type) => set({ filterType: type }),

        // LLM Analysis setter
        setLLMAnalysis: (type, data) => set(state => ({
          llmAnalysis: {
            ...state.llmAnalysis,
            [type]: data,
            lastUpdated: new Date()
          }
        })),

        // UI state setters
        setIsLoading: (loading) => set({ isLoading: loading }),
        setIsAnalyzing: (analyzing) => set({ isAnalyzing: analyzing }),
        setError: (error) => set({ error }),
        setLastRefresh: (date) => set({ lastRefresh: date }),

        // Toggle expanded section
        toggleExpandedSection: (section) => set(state => {
          const newExpanded = new Set(state.expandedSections)
          if (newExpanded.has(section)) {
            newExpanded.delete(section)
          } else {
            newExpanded.add(section)
          }
          return { expandedSections: newExpanded }
        }),

        setSelectedTab: (tab) => set({ selectedTab: tab }),
        setEnableLLMAnalysis: (enabled) => set({ enableLLMAnalysis: enabled }),
        setAutoRefresh: (enabled) => set({ autoRefresh: enabled }),
        setRefreshInterval: (interval) => set({ refreshInterval: interval }),

        // Cache management
        getCachedData: <T>(key: string): T | null => {
          const state = get()
          if (!state.cacheEnabled) return null

          const entry = state.cache.get(key)
          if (!entry) return null

          // Check if cache is expired
          if (Date.now() > entry.expiresAt) {
            // Remove expired entry
            const newCache = new Map(state.cache)
            newCache.delete(key)
            set({ cache: newCache })
            return null
          }

          return entry.data as T
        },

        setCachedData: <T>(key: string, data: T, ttlMinutes?: number) => {
          const state = get()
          if (!state.cacheEnabled) return

          const ttl = ttlMinutes || state.cacheDuration
          const entry: CacheEntry<T> = {
            data,
            timestamp: Date.now(),
            expiresAt: Date.now() + (ttl * 60 * 1000)
          }

          const newCache = new Map(state.cache)
          newCache.set(key, entry)
          set({ cache: newCache })
        },

        clearCache: () => set({ cache: new Map() }),

        clearExpiredCache: () => set(state => {
          const now = Date.now()
          const newCache = new Map()

          state.cache.forEach((entry, key) => {
            if (now <= entry.expiresAt) {
              newCache.set(key, entry)
            }
          })

          return { cache: newCache }
        }),

        // Reset store
        reset: () => set({
          userId: null,
          projectId: null,
          userLogs: null,
          activityMetrics: null,
          developerProfiles: null,
          currentProfile: null,
          timelineEvents: [],
          timelineAnalysis: null,
          llmAnalysis: {
            profile: null,
            timeline: null,
            digest: null,
            lastUpdated: null
          },
          isLoading: false,
          isAnalyzing: false,
          error: null,
          lastRefresh: null,
          cache: new Map()
        }),

        // Composite actions (to be implemented in service layer)
        refreshAllData: async () => {
          // This will be implemented by the service layer
          set({ isLoading: true, error: null })
          try {
            // Service layer will handle the actual data fetching
            set({ lastRefresh: new Date() })
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'Failed to refresh data' })
          } finally {
            set({ isLoading: false })
          }
        },

        runLLMAnalysis: async (type) => {
          // This will be implemented by the service layer
          set({ isAnalyzing: true, error: null })
          try {
            // Service layer will handle the actual LLM analysis
          } catch (error) {
            set({ error: error instanceof Error ? error.message : 'LLM analysis failed' })
          } finally {
            set({ isAnalyzing: false })
          }
        }
      }),
      {
        name: 'personal-insights-store',
        // Only persist settings, not data
        partialize: (state) => ({
          enableLLMAnalysis: state.enableLLMAnalysis,
          autoRefresh: state.autoRefresh,
          refreshInterval: state.refreshInterval,
          cacheEnabled: state.cacheEnabled,
          cacheDuration: state.cacheDuration,
          timeRange: state.timeRange,
          filterType: state.filterType,
          selectedTab: state.selectedTab
        })
      }
    )
  )
)

// Export hooks for specific selectors
export const usePersonalInsightsUserId = () => usePersonalInsightsStore(state => state.userId)
export const usePersonalInsightsLoading = () => usePersonalInsightsStore(state => state.isLoading)
export const usePersonalInsightsError = () => usePersonalInsightsStore(state => state.error)
export const usePersonalInsightsProfile = () => usePersonalInsightsStore(state => state.currentProfile)
export const usePersonalInsightsTimeline = () => usePersonalInsightsStore(state => ({
  events: state.timelineEvents,
  analysis: state.timelineAnalysis
}))

export default usePersonalInsightsStore