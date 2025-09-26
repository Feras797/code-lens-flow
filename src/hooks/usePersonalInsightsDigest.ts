import { useState, useCallback } from 'react'
import { PersonalInsightsDigestService } from '../services/personalInsightsDigest'
import type {
  PersonalDigest,
  DigestRequest,
  DigestOptions,
  DigestCacheEntry
} from '../types/personalInsights'

export function usePersonalInsightsDigest() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [digestService] = useState(() => new PersonalInsightsDigestService())
  const [cache, setCache] = useState<Map<string, DigestCacheEntry>>(new Map())

  const generateDigest = useCallback(async (
    userId: string,
    options: DigestOptions = {
      enabled: true,
      cacheMinutes: 15,
      maxConversations: 50,
      includeIncomplete: false
    }
  ): Promise<PersonalDigest | null> => {
    if (!options.enabled) {
      return null
    }

    // Generate cache key
    const cacheKey = `digest_${userId}_${options.maxConversations || 50}`

    // Check cache first
    const cached = cache.get(cacheKey)
    if (cached && Date.now() < cached.expires) {
      return cached.data
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Prepare request
      const request: DigestRequest = {
        user_id: userId,
        conversation_limit: options.maxConversations || 50,
        analysis_focus: 'general'
      }

      // Add time range for recent activity (default: last 30 days)
      if (!request.time_range) {
        const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
        request.time_range = {
          start_date: thirtyDaysAgo.toISOString(),
          end_date: new Date().toISOString()
        }
      }

      const result = await digestService.generateDigest(request)

      if (!result.success) {
        throw new Error(result.error || 'Digest generation failed')
      }

      if (result.data) {
        // Cache the result
        const cacheEntry: DigestCacheEntry = {
          data: result.data,
          timestamp: Date.now(),
          expires: Date.now() + (options.cacheMinutes || 15) * 60 * 1000,
          conversations_analyzed: result.analysis_metadata.conversations_analyzed
        }
        setCache(prev => new Map(prev).set(cacheKey, cacheEntry))

        return result.data
      }

      return null
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Digest generation failed'
      setError(errorMessage)
      console.error('Personal insights digest error:', err)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }, [digestService, cache])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  const hasCache = useCallback((userId: string, maxConversations = 50): boolean => {
    const cacheKey = `digest_${userId}_${maxConversations}`
    const cached = cache.get(cacheKey)
    return cached ? Date.now() < cached.expires : false
  }, [cache])

  const getCachedDigest = useCallback((userId: string, maxConversations = 50): PersonalDigest | null => {
    const cacheKey = `digest_${userId}_${maxConversations}`
    const cached = cache.get(cacheKey)
    return (cached && Date.now() < cached.expires) ? cached.data : null
  }, [cache])

  const getCacheInfo = useCallback((userId: string, maxConversations = 50) => {
    const cacheKey = `digest_${userId}_${maxConversations}`
    const cached = cache.get(cacheKey)

    if (!cached) {
      return { exists: false, expired: true }
    }

    const isExpired = Date.now() >= cached.expires
    const timeUntilExpiry = cached.expires - Date.now()

    return {
      exists: true,
      expired: isExpired,
      timeUntilExpiry: Math.max(0, timeUntilExpiry),
      conversationsAnalyzed: cached.conversations_analyzed,
      createdAt: new Date(cached.timestamp).toISOString()
    }
  }, [cache])

  return {
    generateDigest,
    isAnalyzing,
    error,
    clearCache,
    hasCache,
    getCachedDigest,
    getCacheInfo,
    cacheSize: cache.size
  }
}

// Simple hook for enabling/disabling personal digest analysis
export function usePersonalDigestToggle(defaultEnabled = true) {
  const [digestEnabled, setDigestEnabled] = useState(defaultEnabled)
  const [autoRefresh, setAutoRefresh] = useState(false)

  return {
    digestEnabled,
    setDigestEnabled,
    autoRefresh,
    setAutoRefresh,
    toggleDigest: () => setDigestEnabled(!digestEnabled),
    toggleAutoRefresh: () => setAutoRefresh(!autoRefresh)
  }
}

// Hook for digest analytics and metrics
export function useDigestMetrics() {
  const [metrics, setMetrics] = useState({
    totalGenerations: 0,
    cacheHits: 0,
    averageProcessingTime: 0,
    lastGeneration: null as string | null
  })

  const updateMetrics = useCallback((processingTime: number, fromCache: boolean) => {
    setMetrics(prev => ({
      totalGenerations: prev.totalGenerations + 1,
      cacheHits: prev.cacheHits + (fromCache ? 1 : 0),
      averageProcessingTime: (prev.averageProcessingTime * prev.totalGenerations + processingTime) / (prev.totalGenerations + 1),
      lastGeneration: new Date().toISOString()
    }))
  }, [])

  const resetMetrics = useCallback(() => {
    setMetrics({
      totalGenerations: 0,
      cacheHits: 0,
      averageProcessingTime: 0,
      lastGeneration: null
    })
  }, [])

  return {
    metrics,
    updateMetrics,
    resetMetrics
  }
}