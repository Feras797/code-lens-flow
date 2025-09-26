import { useState, useEffect, useCallback } from 'react'
import { useSimpleLLMAnalysis, useMergeLLMWithStatus } from './useSimpleLLMAnalysis'
import type { ConversationData as LLMConversationData } from '../services/simpleLLMAnalysis'

export interface DeveloperTask {
  id: string
  title: string
  status: 'high' | 'medium' | 'low'
  description: string
  filePath: string
  timeSpent: string
  commits?: number
  pullRequests?: number
  messages?: number
  startedAt?: string
}

export interface DeveloperStatus {
  id: string
  name: string
  initials: string
  avatar?: string
  status: 'flow' | 'problem_solving' | 'blocked' | 'idle'
  statusMessage: string
  currentTasks: DeveloperTask[]
  totalTasks: number
  completedTasks: number
  lastActive?: string
  // LLM enhancement fields
  llmInsights?: {
    confidence: number
    keyTopics: string[]
    mood: 'positive' | 'neutral' | 'frustrated' | 'focused'
    productivity: 'high' | 'medium' | 'low'
    recommendations?: string[]
  }
  originalStatus?: 'flow' | 'problem_solving' | 'blocked' | 'idle'
  originalStatusMessage?: string
}

interface ConversationData {
  id: string
  user_id: string
  project_id: string
  project_name: string | null
  user_query: string
  claude_response: string | null
  interaction_timestamp: string
  status: 'pending' | 'completed'
}

// RUBE integration hook for fetching real-time team status from Supabase
export function useRubeTeamStatus(enableLLM = false) {
  const [teamStatus, setTeamStatus] = useState<DeveloperStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())

  // LLM analysis hooks
  const { analyzeConversations, isAnalyzing: isLLMAnalyzing, error: llmError } = useSimpleLLMAnalysis()
  const { mergeAnalysis } = useMergeLLMWithStatus()

  // Supabase configuration from environment
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Fetch team status data using direct API calls (since RUBE connection isn't available)
  const fetchTeamStatusData = useCallback(async (): Promise<ConversationData[]> => {
    const headers = {
      'apikey': SUPABASE_KEY,
      'Authorization': `Bearer ${SUPABASE_KEY}`,
      'Content-Type': 'application/json'
    }

    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/claude_chat_logs?select=*&order=interaction_timestamp.desc&limit=100`,
      { headers }
    )

    if (!response.ok) {
      throw new Error(`Failed to fetch data: ${response.statusText}`)
    }

    return response.json()
  }, [SUPABASE_URL, SUPABASE_KEY])

  // Transform conversation data into developer status format
  const transformToTeamStatus = useCallback((conversations: ConversationData[]): DeveloperStatus[] => {
    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Group conversations by user
    const userGroups = conversations.reduce((acc, conv) => {
      if (!acc[conv.user_id]) {
        acc[conv.user_id] = []
      }
      acc[conv.user_id].push(conv)
      return acc
    }, {} as Record<string, ConversationData[]>)

    return Object.entries(userGroups).map(([userId, userConversations]) => {
      const sortedConversations = userConversations.sort(
        (a, b) => new Date(b.interaction_timestamp).getTime() - new Date(a.interaction_timestamp).getTime()
      )

      const latestConversation = sortedConversations[0]
      const latestTimestamp = new Date(latestConversation.interaction_timestamp)

      // Recent conversations (last 4 hours)
      const recentConversations = sortedConversations.filter(
        conv => new Date(conv.interaction_timestamp) > fourHoursAgo
      )

      // All conversations in last 24 hours
      const todayConversations = sortedConversations.filter(
        conv => new Date(conv.interaction_timestamp) > twentyFourHoursAgo
      )

      // Determine user status based on activity and content
      let status: DeveloperStatus['status'] = 'idle'
      let statusMessage = 'No recent activity'

      if (recentConversations.length > 0) {
        const latestQuery = latestConversation.user_query.toLowerCase()

        // Check for blocked indicators
        const blockedKeywords = ['error', 'stuck', 'help', 'issue', 'problem', 'bug', 'fail', 'not working']
        const hasBlockedKeywords = blockedKeywords.some(keyword => latestQuery.includes(keyword))

        // Check for problem-solving indicators
        const problemKeywords = ['debug', 'fix', 'troubleshoot', 'optimize', 'refactor', 'test']
        const hasProblemKeywords = problemKeywords.some(keyword => latestQuery.includes(keyword))

        // Check for flow indicators
        const flowKeywords = ['implement', 'create', 'add', 'build', 'develop', 'make']
        const hasFlowKeywords = flowKeywords.some(keyword => latestQuery.includes(keyword))

        if (hasBlockedKeywords) {
          status = 'blocked'
          statusMessage = `Blocked on: ${latestConversation.user_query.substring(0, 80)}...`
        } else if (recentConversations.length > 3) {
          status = 'problem_solving'
          statusMessage = `Problem solving with ${recentConversations.length} recent queries`
        } else if (hasFlowKeywords || hasProblemKeywords) {
          status = 'flow'
          statusMessage = `Working on: ${latestConversation.user_query.substring(0, 80)}...`
        } else {
          status = 'flow'
          statusMessage = `Active: ${latestConversation.user_query.substring(0, 80)}...`
        }
      } else if (todayConversations.length > 0) {
        status = 'idle'
        statusMessage = `Last active: ${formatTimeAgo(latestTimestamp)}`
      }

      // Generate user display name and initials
      const displayName = userId === 'VishiATChoudhary' ? 'Vishi Choudhary' :
                         userId === 'Max' ? 'Max Akishin' :
                         userId === 'e3b41869-1444-4bf0-a625-90b0f1d1dffb' ? 'Anonymous Developer' :
                         userId.includes('test') ? `Test User ${userId.slice(-3)}` :
                         userId

      const initials = displayName
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

      // Create current tasks from recent conversations
      const currentTasks: DeveloperTask[] = recentConversations.slice(0, 4).map((conv, index) => {
        const timeSince = now.getTime() - new Date(conv.interaction_timestamp).getTime()
        const minutesAgo = Math.floor(timeSince / (1000 * 60))
        const timeSpent = minutesAgo > 60 ? `${Math.floor(minutesAgo / 60)} hrs` : `${minutesAgo} min`

        // Extract file paths from conversation
        const text = `${conv.user_query} ${conv.claude_response || ''}`
        const fileMatch = text.match(/[\w\-./]+\.(js|ts|tsx|jsx|py|css|html|json|md|sql)/i)
        const filePath = fileMatch ? fileMatch[0] :
                        text.includes('component') ? 'src/components/Component.tsx' :
                        text.includes('auth') ? 'src/auth/service.ts' :
                        text.includes('api') ? 'src/api/endpoint.ts' :
                        'src/utils/helper.ts'

        // Determine task priority
        const isHighPriority = conv.user_query.toLowerCase().includes('error') ||
                              conv.user_query.toLowerCase().includes('urgent') ||
                              conv.user_query.toLowerCase().includes('blocked')
        const isMediumPriority = conv.user_query.toLowerCase().includes('implement') ||
                               conv.user_query.toLowerCase().includes('debug')

        const taskStatus: DeveloperTask['status'] = isHighPriority ? 'high' :
                                                   isMediumPriority ? 'medium' : 'low'

        return {
          id: conv.id,
          title: conv.user_query.length > 40 ?
                `${conv.user_query.substring(0, 40)}...` :
                conv.user_query,
          status: taskStatus,
          description: conv.claude_response ?
                      conv.claude_response.substring(0, 100) + '...' :
                      'Working on this task',
          filePath,
          timeSpent,
          messages: 1,
          startedAt: conv.interaction_timestamp
        }
      })

      return {
        id: userId,
        name: displayName,
        initials,
        status,
        statusMessage,
        currentTasks,
        totalTasks: todayConversations.length,
        completedTasks: todayConversations.filter(c => c.status === 'completed').length,
        lastActive: latestConversation.interaction_timestamp
      }
    })
  }, [])

  // Helper function to format time ago
  const formatTimeAgo = (date: Date): string => {
    const now = new Date()
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)

    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Main fetch function
  const fetchTeamStatus = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)

      const conversations = await fetchTeamStatusData()
      const transformedData = transformToTeamStatus(conversations)

      // Filter out users with no recent activity (optional)
      let activeTeamStatus = transformedData.filter(dev => dev.status !== 'idle' || dev.totalTasks > 0)

      // Apply LLM analysis if enabled
      if (enableLLM && conversations.length > 0) {
        try {
          // Convert conversations to LLM format
          const llmConversations: LLMConversationData[] = conversations.map(conv => ({
            id: conv.id,
            user_id: conv.user_id,
            user_query: conv.user_query,
            claude_response: conv.claude_response,
            interaction_timestamp: conv.interaction_timestamp,
            project_name: conv.project_name
          }))

          const llmResults = await analyzeConversations(llmConversations, {
            enabled: true,
            cacheMinutes: 15,
            maxConversations: 50
          })

          // Merge LLM insights with basic status
          activeTeamStatus = mergeAnalysis(activeTeamStatus, llmResults)
        } catch (llmErr) {
          console.error('LLM analysis failed:', llmErr)
          // Continue with basic analysis
        }
      }

      setTeamStatus(activeTeamStatus)
      setLastUpdated(new Date())
    } catch (err) {
      console.error('Error fetching team status:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch team status')

      // Fallback to mock data on error
      setTeamStatus(getMockTeamStatus())
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamStatusData, transformToTeamStatus])

  // Initial fetch
  useEffect(() => {
    fetchTeamStatus()
  }, [fetchTeamStatus])

  // Auto-refresh every 30 seconds
  useEffect(() => {
    const interval = setInterval(fetchTeamStatus, 30000)
    return () => clearInterval(interval)
  }, [fetchTeamStatus])

  return {
    teamStatus,
    isLoading: isLoading || isLLMAnalyzing,
    error: error || llmError,
    lastUpdated,
    refresh: fetchTeamStatus,
    // LLM specific info
    llmEnabled: enableLLM,
    isLLMAnalyzing
  }
}

// Fallback mock data
function getMockTeamStatus(): DeveloperStatus[] {
  return [
    {
      id: 'vishi',
      name: 'Vishi Choudhary',
      initials: 'VC',
      status: 'flow',
      statusMessage: 'Implementing Live Team Status Board with RUBE integration',
      totalTasks: 15,
      completedTasks: 8,
      currentTasks: [
        {
          id: 'team-status',
          title: 'Live Team Status Board',
          status: 'high',
          description: 'Integrating real Supabase data with RUBE MCP server',
          filePath: 'src/hooks/useRubeTeamStatus.ts',
          timeSpent: '2 hrs',
          messages: 12
        }
      ]
    }
  ]
}