import { useState, useCallback } from 'react'
import { SimpleLLMAnalysis, type LLMAnalysisResult, type ConversationData } from '../services/simpleLLMAnalysis'

export interface SimpleLLMOptions {
  enabled: boolean
  cacheMinutes?: number
  maxConversations?: number
}

export function useSimpleLLMAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [analysisService] = useState(() => new SimpleLLMAnalysis())
  const [cache, setCache] = useState<Map<string, { data: LLMAnalysisResult[], timestamp: number }>>(new Map())

  const analyzeConversations = useCallback(async (
    conversations: ConversationData[],
    options: SimpleLLMOptions = { enabled: true, cacheMinutes: 15, maxConversations: 50 }
  ): Promise<LLMAnalysisResult[]> => {
    if (!options.enabled) {
      return []
    }

    // Check cache first
    const cacheKey = JSON.stringify(conversations.map(c => c.id).sort())
    const cached = cache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < (options.cacheMinutes || 15) * 60 * 1000) {
      return cached.data
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      // Limit conversations to avoid large prompts
      const limitedConversations = conversations.slice(0, options.maxConversations || 50)

      const results = await analysisService.analyzeTeamConversations(limitedConversations)

      // Cache results
      setCache(prev => new Map(prev).set(cacheKey, {
        data: results,
        timestamp: Date.now()
      }))

      return results
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'LLM analysis failed'
      setError(errorMessage)
      console.error('LLM analysis error:', err)
      return []
    } finally {
      setIsAnalyzing(false)
    }
  }, [analysisService, cache])

  const clearCache = useCallback(() => {
    setCache(new Map())
  }, [])

  const hasCache = useCallback((conversations: ConversationData[]): boolean => {
    const cacheKey = JSON.stringify(conversations.map(c => c.id).sort())
    const cached = cache.get(cacheKey)
    return cached ? Date.now() - cached.timestamp < 15 * 60 * 1000 : false
  }, [cache])

  return {
    analyzeConversations,
    isAnalyzing,
    error,
    clearCache,
    hasCache,
    cacheSize: cache.size
  }
}

// Helper hook to merge LLM analysis with basic team status
export function useMergeLLMWithStatus() {
  const mergeAnalysis = useCallback((
    basicStatus: any,
    llmResults: LLMAnalysisResult[]
  ) => {
    if (!llmResults.length) return basicStatus

    return basicStatus.map((dev: any) => {
      const llmAnalysis = llmResults.find(result => result.user_id === dev.id)

      if (!llmAnalysis) return dev

      return {
        ...dev,
        // Enhance with LLM insights
        status: llmAnalysis.enhanced_status,
        statusMessage: llmAnalysis.status_reason,
        llmInsights: {
          confidence: llmAnalysis.confidence,
          keyTopics: llmAnalysis.key_topics,
          mood: llmAnalysis.mood_indicator,
          productivity: llmAnalysis.productivity_level,
          recommendations: llmAnalysis.recommendations
        },
        // Keep original for comparison
        originalStatus: dev.status,
        originalStatusMessage: dev.statusMessage
      }
    })
  }, [])

  return { mergeAnalysis }
}

// Simple hook for enabling/disabling LLM analysis
export function useLLMToggle(defaultEnabled = false) {
  const [llmEnabled, setLLMEnabled] = useState(defaultEnabled)
  const [showLLMInsights, setShowLLMInsights] = useState(true)

  return {
    llmEnabled,
    setLLMEnabled,
    showLLMInsights,
    setShowLLMInsights,
    toggleLLM: () => setLLMEnabled(!llmEnabled),
    toggleInsights: () => setShowLLMInsights(!showLLMInsights)
  }
}