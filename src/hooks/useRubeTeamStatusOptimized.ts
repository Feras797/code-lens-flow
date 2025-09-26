import { useState, useEffect, useCallback, useMemo } from 'react'

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

// Enhanced RUBE integration with caching and performance optimization
export function useRubeTeamStatusOptimized() {
  const [teamStatus, setTeamStatus] = useState<DeveloperStatus[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date())
  const [cachedData, setCachedData] = useState<ConversationData[]>([])

  // Supabase configuration
  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL
  const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY

  // Cache configuration
  const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  const [lastCacheTime, setLastCacheTime] = useState(0)

  // Optimized fetch with caching
  const fetchTeamStatusData = useCallback(async (useCache = true): Promise<ConversationData[]> => {
    const now = Date.now()

    // Use cache if valid and requested
    if (useCache && cachedData.length > 0 && (now - lastCacheTime) < CACHE_DURATION) {
      console.log('🚀 Using cached team status data')
      return cachedData
    }

    console.log('📡 Fetching fresh team status data...')

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

    const data = await response.json()

    // Update cache
    setCachedData(data)
    setLastCacheTime(now)

    return data
  }, [SUPABASE_URL, SUPABASE_KEY, cachedData, lastCacheTime])

  // Memoized status classification functions
  const statusClassifiers = useMemo(() => ({
    blockedKeywords: ['error', 'stuck', 'help', 'issue', 'problem', 'bug', 'fail', 'not working', 'broken'],
    problemKeywords: ['debug', 'fix', 'troubleshoot', 'optimize', 'refactor', 'test', 'review'],
    flowKeywords: ['implement', 'create', 'add', 'build', 'develop', 'make', 'design', 'setup']
  }), [])

  // Optimized user display name mapping
  const userDisplayNames = useMemo(() => ({
    'VishiATChoudhary': 'Vishi Choudhary',
    'Max': 'Max Akishin',
    'e3b41869-1444-4bf0-a625-90b0f1d1dffb': 'Anonymous Developer',
    'teammate_john': 'John Martinez'
  }), [])

  // Enhanced status determination with machine learning-like scoring
  const determineUserStatus = useCallback((
    userConversations: ConversationData[],
    recentConversations: ConversationData[]
  ): { status: DeveloperStatus['status'], message: string } => {
    if (recentConversations.length === 0) {
      return { status: 'idle', message: 'No recent activity' }
    }

    const latestConversation = recentConversations[0]
    const latestQuery = latestConversation.user_query.toLowerCase()

    // Calculate status scores
    let blockedScore = 0
    let problemScore = 0
    let flowScore = 0

    // Score based on keywords in recent queries
    recentConversations.forEach((conv, index) => {
      const weight = 1 / (index + 1) // More recent conversations have higher weight
      const query = conv.user_query.toLowerCase()

      statusClassifiers.blockedKeywords.forEach(keyword => {
        if (query.includes(keyword)) blockedScore += weight
      })

      statusClassifiers.problemKeywords.forEach(keyword => {
        if (query.includes(keyword)) problemScore += weight
      })

      statusClassifiers.flowKeywords.forEach(keyword => {
        if (query.includes(keyword)) flowScore += weight
      })
    })

    // Additional factors
    const conversationFrequency = recentConversations.length
    const hasMultipleQuickQueries = conversationFrequency > 3
    const hasLongResponse = latestConversation.claude_response && latestConversation.claude_response.length > 500

    // Determine status based on scores and patterns
    if (blockedScore > 0.5 || (conversationFrequency > 5 && problemScore < flowScore)) {
      return {
        status: 'blocked',
        message: `Blocked: ${latestConversation.user_query.substring(0, 80)}...`
      }
    } else if (hasMultipleQuickQueries || problemScore > flowScore + 0.5) {
      return {
        status: 'problem_solving',
        message: `Problem solving (${conversationFrequency} recent queries)`
      }
    } else {
      return {
        status: 'flow',
        message: `In flow: ${latestConversation.user_query.substring(0, 80)}...`
      }
    }
  }, [statusClassifiers])

  // Enhanced file path extraction with better regex patterns
  const extractFilePath = useCallback((text: string): string => {
    const patterns = [
      // Specific file extensions with paths
      /(?:src\/|components\/|pages\/|hooks\/|lib\/|utils\/|api\/)?[\w\-./]+\.(js|ts|tsx|jsx|py|css|html|json|md|sql|vue|svelte)/i,
      // Common project paths
      /src\/[\w\-./]+/i,
      /components\/[\w\-./]+/i,
      /pages\/[\w\-./]+/i,
      /hooks\/[\w\-./]+/i,
      /lib\/[\w\-./]+/i,
      /api\/[\w\-./]+/i
    ]

    for (const pattern of patterns) {
      const match = text.match(pattern)
      if (match) return match[0]
    }

    // Fallback based on content analysis
    if (text.toLowerCase().includes('component')) return 'src/components/Component.tsx'
    if (text.toLowerCase().includes('auth')) return 'src/auth/service.ts'
    if (text.toLowerCase().includes('api')) return 'src/api/endpoint.ts'
    if (text.toLowerCase().includes('hook')) return 'src/hooks/useCustom.ts'
    if (text.toLowerCase().includes('database') || text.toLowerCase().includes('db')) return 'src/lib/database.ts'

    return 'src/utils/helper.ts'
  }, [])

  // Enhanced transformation with better task categorization
  const transformToTeamStatus = useCallback((conversations: ConversationData[]): DeveloperStatus[] => {
    const now = new Date()
    const fourHoursAgo = new Date(now.getTime() - 4 * 60 * 60 * 1000)
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)

    // Group and sort conversations by user
    const userGroups = conversations.reduce((acc, conv) => {
      if (!acc[conv.user_id]) acc[conv.user_id] = []
      acc[conv.user_id].push(conv)
      return acc
    }, {} as Record<string, ConversationData[]>)

    return Object.entries(userGroups)
      .map(([userId, userConversations]) => {
        const sortedConversations = userConversations.sort(
          (a, b) => new Date(b.interaction_timestamp).getTime() - new Date(a.interaction_timestamp).getTime()
        )

        const recentConversations = sortedConversations.filter(
          conv => new Date(conv.interaction_timestamp) > fourHoursAgo
        )

        const todayConversations = sortedConversations.filter(
          conv => new Date(conv.interaction_timestamp) > twentyFourHoursAgo
        )

        // Skip inactive users (no activity in 24h)
        if (todayConversations.length === 0) return null

        const { status, message } = determineUserStatus(sortedConversations, recentConversations)

        // Generate enhanced user info
        const displayName = userDisplayNames[userId] ||
          (userId.includes('test') ? `Test User ${userId.slice(-3)}` :
           userId.length > 20 ? 'Anonymous Developer' : userId)

        const initials = displayName
          .split(' ')
          .map(word => word[0])
          .join('')
          .toUpperCase()
          .slice(0, 2)

        // Create enhanced tasks with better metadata
        const currentTasks: DeveloperTask[] = recentConversations
          .slice(0, 6) // Show up to 6 recent tasks
          .map((conv) => {
            const timeSince = now.getTime() - new Date(conv.interaction_timestamp).getTime()
            const minutesAgo = Math.floor(timeSince / (1000 * 60))
            const timeSpent = minutesAgo > 60 ?
              `${Math.floor(minutesAgo / 60)}h ${minutesAgo % 60}m` :
              `${minutesAgo}m`

            const fullText = `${conv.user_query} ${conv.claude_response || ''}`
            const filePath = extractFilePath(fullText)

            // Enhanced task priority logic
            const query = conv.user_query.toLowerCase()
            const isUrgent = ['error', 'urgent', 'blocked', 'critical', 'breaking'].some(word => query.includes(word))
            const isImportant = ['implement', 'feature', 'debug', 'fix', 'optimize'].some(word => query.includes(word))
            const taskStatus: DeveloperTask['status'] = isUrgent ? 'high' : isImportant ? 'medium' : 'low'

            // Better task titles
            let title = conv.user_query.length > 50 ?
              `${conv.user_query.substring(0, 47)}...` :
              conv.user_query

            return {
              id: conv.id,
              title,
              status: taskStatus,
              description: conv.claude_response ?
                conv.claude_response.substring(0, 120) + '...' :
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
          statusMessage: message,
          currentTasks,
          totalTasks: todayConversations.length,
          completedTasks: todayConversations.filter(c => c.status === 'completed').length,
          lastActive: sortedConversations[0]?.interaction_timestamp
        }
      })
      .filter((dev): dev is DeveloperStatus => dev !== null)
      .sort((a, b) => {
        // Sort by status priority: blocked > problem_solving > flow > idle
        const statusPriority = { blocked: 4, problem_solving: 3, flow: 2, idle: 1 }
        return statusPriority[b.status] - statusPriority[a.status]
      })
  }, [determineUserStatus, userDisplayNames, extractFilePath])

  // Main fetch function with enhanced error handling
  const fetchTeamStatus = useCallback(async (forceRefresh = false) => {
    try {
      setIsLoading(true)
      setError(null)

      const conversations = await fetchTeamStatusData(!forceRefresh)
      const transformedData = transformToTeamStatus(conversations)

      setTeamStatus(transformedData)
      setLastUpdated(new Date())

      console.log(`✅ Team status updated: ${transformedData.length} active developers`)
    } catch (err) {
      console.error('❌ Error fetching team status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch team status'
      setError(errorMessage)

      // Only fall back to mock data if we have no existing data
      if (teamStatus.length === 0) {
        setTeamStatus(getMockTeamStatus())
      }
    } finally {
      setIsLoading(false)
    }
  }, [fetchTeamStatusData, transformToTeamStatus, teamStatus.length])

  // Force refresh function
  const forceRefresh = useCallback(() => {
    fetchTeamStatus(true)
  }, [fetchTeamStatus])

  // Initial fetch
  useEffect(() => {
    fetchTeamStatus()
  }, [fetchTeamStatus])

  return {
    teamStatus,
    isLoading,
    error,
    lastUpdated,
    refresh: fetchTeamStatus,
    forceRefresh,
    cacheStatus: {
      isCached: cachedData.length > 0 && (Date.now() - lastCacheTime) < CACHE_DURATION,
      cacheAge: Date.now() - lastCacheTime,
      nextRefresh: lastCacheTime + CACHE_DURATION
    }
  }
}

// Enhanced mock data for fallback
function getMockTeamStatus(): DeveloperStatus[] {
  return [
    {
      id: 'vishi',
      name: 'Vishi Choudhary',
      initials: 'VC',
      status: 'flow',
      statusMessage: 'Successfully implemented Live Team Status Board with real Supabase integration',
      totalTasks: 18,
      completedTasks: 15,
      currentTasks: [
        {
          id: 'team-status-complete',
          title: 'Live Team Status Board - COMPLETE',
          status: 'high',
          description: 'Real-time team collaboration tracking with RUBE MCP integration',
          filePath: 'src/hooks/useRubeTeamStatus.ts',
          timeSpent: '3h 45m',
          messages: 25
        },
        {
          id: 'performance-optimization',
          title: 'Performance optimization and caching',
          status: 'medium',
          description: 'Enhanced with intelligent caching and status classification',
          filePath: 'src/hooks/useRubeTeamStatusOptimized.ts',
          timeSpent: '1h 20m',
          messages: 8
        }
      ]
    }
  ]
}