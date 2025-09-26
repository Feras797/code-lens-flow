import { ClaudeChatLog } from '../hooks/useSupabase'

// =============================================================================
// CONVERSATION ANALYSIS UTILITIES
// =============================================================================

export interface TopicAnalysis {
  topic: string
  count: number
  percentage: number
  examples: string[]
}

export interface ActivityByDay {
  date: string
  count: number
  completedCount: number
  topics: string[]
}

export interface UserContribution {
  userId: string
  username?: string
  interactions: number
  completedInteractions: number
  topTopics: string[]
  lastActive: string
}

export interface DevelopmentPattern {
  pattern: string
  frequency: number
  description: string
  relatedTopics: string[]
}

// Development topic keywords mapping
const TOPIC_KEYWORDS = {
  'Authentication': ['auth', 'login', 'jwt', 'token', 'authentication', 'user', 'session'],
  'Database': ['database', 'supabase', 'sql', 'query', 'table', 'db', 'postgresql'],
  'Frontend': ['react', 'component', 'ui', 'frontend', 'tsx', 'jsx', 'css', 'styling'],
  'Backend': ['api', 'endpoint', 'server', 'backend', 'function', 'webhook'],
  'Bug Fixes': ['bug', 'error', 'fix', 'issue', 'problem', 'broken', 'not working'],
  'Optimization': ['optimize', 'performance', 'speed', 'slow', 'improve', 'efficiency'],
  'Testing': ['test', 'testing', 'jest', 'cypress', 'unit test', 'integration'],
  'Deployment': ['deploy', 'deployment', 'production', 'build', 'ci/cd', 'docker'],
  'State Management': ['state', 'context', 'redux', 'zustand', 'store', 'management'],
  'UI/UX': ['design', 'layout', 'interface', 'user experience', 'responsive', 'mobile']
}

// Analyze conversation topics based on content
export function analyzeConversationTopics(logs: ClaudeChatLog[]): TopicAnalysis[] {
  const topicCounts: Record<string, { count: number; examples: string[] }> = {}
  const totalLogs = logs.length

  // Initialize topic counts
  Object.keys(TOPIC_KEYWORDS).forEach(topic => {
    topicCounts[topic] = { count: 0, examples: [] }
  })

  // Analyze each conversation
  logs.forEach(log => {
    const content = `${log.user_query} ${log.claude_response || ''}`.toLowerCase()

    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        topicCounts[topic].count++
        if (topicCounts[topic].examples.length < 3) {
          topicCounts[topic].examples.push(log.user_query.substring(0, 100))
        }
      }
    })
  })

  // Convert to analysis format
  return Object.entries(topicCounts)
    .map(([topic, data]) => ({
      topic,
      count: data.count,
      percentage: totalLogs > 0 ? (data.count / totalLogs) * 100 : 0,
      examples: data.examples
    }))
    .filter(analysis => analysis.count > 0)
    .sort((a, b) => b.count - a.count)
}

// Analyze activity by day
export function analyzeActivityByDay(logs: ClaudeChatLog[]): ActivityByDay[] {
  const dayMap: Record<string, { count: number; completed: number; topics: Set<string> }> = {}

  logs.forEach(log => {
    const date = new Date(log.interaction_timestamp).toISOString().split('T')[0]
    const content = `${log.user_query} ${log.claude_response || ''}`.toLowerCase()

    if (!dayMap[date]) {
      dayMap[date] = { count: 0, completed: 0, topics: new Set() }
    }

    dayMap[date].count++
    if (log.status === 'completed') {
      dayMap[date].completed++
    }

    // Identify topics for this day
    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        dayMap[date].topics.add(topic)
      }
    })
  })

  return Object.entries(dayMap)
    .map(([date, data]) => ({
      date,
      count: data.count,
      completedCount: data.completed,
      topics: Array.from(data.topics)
    }))
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
}

// Analyze user contributions
export function analyzeUserContributions(logs: ClaudeChatLog[]): UserContribution[] {
  const userMap: Record<string, {
    interactions: number
    completed: number
    topics: Record<string, number>
    lastActive: string
  }> = {}

  logs.forEach(log => {
    const userId = log.user_id
    const content = `${log.user_query} ${log.claude_response || ''}`.toLowerCase()

    if (!userMap[userId]) {
      userMap[userId] = {
        interactions: 0,
        completed: 0,
        topics: {},
        lastActive: log.interaction_timestamp
      }
    }

    userMap[userId].interactions++
    if (log.status === 'completed') {
      userMap[userId].completed++
    }

    // Update last active
    if (new Date(log.interaction_timestamp) > new Date(userMap[userId].lastActive)) {
      userMap[userId].lastActive = log.interaction_timestamp
    }

    // Track topics
    Object.entries(TOPIC_KEYWORDS).forEach(([topic, keywords]) => {
      if (keywords.some(keyword => content.includes(keyword))) {
        userMap[userId].topics[topic] = (userMap[userId].topics[topic] || 0) + 1
      }
    })
  })

  return Object.entries(userMap).map(([userId, data]) => ({
    userId,
    interactions: data.interactions,
    completedInteractions: data.completed,
    topTopics: Object.entries(data.topics)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .map(([topic]) => topic),
    lastActive: data.lastActive
  }))
}

// Analyze development patterns
export function analyzeDevelopmentPatterns(logs: ClaudeChatLog[]): DevelopmentPattern[] {
  const patterns: DevelopmentPattern[] = []

  // Pattern 1: Bug Fix Sessions
  const bugFixLogs = logs.filter(log =>
    ['bug', 'error', 'fix', 'issue', 'problem'].some(keyword =>
      log.user_query.toLowerCase().includes(keyword)
    )
  )

  if (bugFixLogs.length > 0) {
    patterns.push({
      pattern: 'Bug Fix Sessions',
      frequency: bugFixLogs.length,
      description: 'User frequently asks for help with debugging and error resolution',
      relatedTopics: analyzeConversationTopics(bugFixLogs).slice(0, 3).map(t => t.topic)
    })
  }

  // Pattern 2: Learning New Technologies
  const learningIndicators = ['how to', 'implement', 'create', 'setup', 'tutorial', 'example']
  const learningLogs = logs.filter(log =>
    learningIndicators.some(indicator =>
      log.user_query.toLowerCase().includes(indicator)
    )
  )

  if (learningLogs.length > 0) {
    patterns.push({
      pattern: 'Technology Learning',
      frequency: learningLogs.length,
      description: 'User actively learning new technologies and implementations',
      relatedTopics: analyzeConversationTopics(learningLogs).slice(0, 3).map(t => t.topic)
    })
  }

  // Pattern 3: Code Review and Optimization
  const optimizationLogs = logs.filter(log =>
    ['optimize', 'improve', 'better way', 'performance', 'refactor'].some(keyword =>
      log.user_query.toLowerCase().includes(keyword)
    )
  )

  if (optimizationLogs.length > 0) {
    patterns.push({
      pattern: 'Code Optimization',
      frequency: optimizationLogs.length,
      description: 'User focuses on improving existing code quality and performance',
      relatedTopics: analyzeConversationTopics(optimizationLogs).slice(0, 3).map(t => t.topic)
    })
  }

  return patterns.sort((a, b) => b.frequency - a.frequency)
}

// =============================================================================
// USER ACTIVITY ANALYSIS UTILITIES
// =============================================================================

// Calculate average response time for completed conversations
export function calculateAverageResponseTime(logs: ClaudeChatLog[]): number {
  const completedLogs = logs.filter(log => log.status === 'completed' && log.completed_at)

  if (completedLogs.length === 0) return 0

  const totalTime = completedLogs.reduce((sum, log) => {
    const start = new Date(log.interaction_timestamp).getTime()
    const end = new Date(log.completed_at!).getTime()
    return sum + (end - start)
  }, 0)

  return totalTime / completedLogs.length / 1000 / 60 // Return in minutes
}

// Get most active project for a user
export function getMostActiveProject(logs: ClaudeChatLog[]): { projectId: string; projectName: string; count: number } | null {
  const projectCounts: Record<string, { name: string; count: number }> = {}

  logs.forEach(log => {
    if (!projectCounts[log.project_id]) {
      projectCounts[log.project_id] = { name: log.project_name, count: 0 }
    }
    projectCounts[log.project_id].count++
  })

  const entries = Object.entries(projectCounts)
  if (entries.length === 0) return null

  const [projectId, data] = entries.sort(([,a], [,b]) => b.count - a.count)[0]
  return { projectId, projectName: data.name, count: data.count }
}

// Analyze time distribution of user activity
export function analyzeTimeDistribution(logs: ClaudeChatLog[]): Record<string, number> {
  const hourCounts: Record<number, number> = {}

  logs.forEach(log => {
    const hour = new Date(log.interaction_timestamp).getHours()
    hourCounts[hour] = (hourCounts[hour] || 0) + 1
  })

  // Group into time periods
  const periods = {
    'Early Morning (6-9)': [6, 7, 8, 9],
    'Morning (9-12)': [9, 10, 11],
    'Afternoon (12-17)': [12, 13, 14, 15, 16],
    'Evening (17-21)': [17, 18, 19, 20],
    'Night (21-6)': [21, 22, 23, 0, 1, 2, 3, 4, 5]
  }

  const distribution: Record<string, number> = {}
  Object.entries(periods).forEach(([period, hours]) => {
    distribution[period] = hours.reduce((sum, hour) => sum + (hourCounts[hour] || 0), 0)
  })

  return distribution
}

// Analyze user topics
export function analyzeUserTopics(logs: ClaudeChatLog[]): TopicAnalysis[] {
  return analyzeConversationTopics(logs)
}

// Calculate productivity score based on completion rate and activity
export function calculateProductivityScore(logs: ClaudeChatLog[]): number {
  if (logs.length === 0) return 0

  const completionRate = logs.filter(log => log.status === 'completed').length / logs.length
  const activityScore = Math.min(logs.length / 10, 1) // Normalize to max 10 interactions

  return Math.round((completionRate * 0.7 + activityScore * 0.3) * 100)
}

// Analyze learning patterns from conversation content
export function analyzeLearningPatterns(logs: ClaudeChatLog[]): {
  learningStyle: string
  focusAreas: string[]
  progressionIndicators: string[]
} {
  const learningIndicators = {
    'Hands-on Learner': ['example', 'show me', 'how to implement', 'code'],
    'Conceptual Learner': ['explain', 'why', 'difference', 'concept', 'theory'],
    'Problem Solver': ['fix', 'debug', 'issue', 'problem', 'error'],
    'Explorer': ['what if', 'alternative', 'best practice', 'different way']
  }

  const content = logs.map(log => log.user_query.toLowerCase()).join(' ')

  // Determine learning style
  let dominantStyle = 'Balanced Learner'
  let maxScore = 0

  Object.entries(learningIndicators).forEach(([style, indicators]) => {
    const score = indicators.reduce((sum, indicator) => {
      return sum + (content.split(indicator).length - 1)
    }, 0)

    if (score > maxScore) {
      maxScore = score
      dominantStyle = style
    }
  })

  // Focus areas from topics
  const topics = analyzeConversationTopics(logs)
  const focusAreas = topics.slice(0, 3).map(t => t.topic)

  // Progression indicators
  const progressionIndicators = []
  if (logs.length > 10) progressionIndicators.push('High engagement')
  if (topics.length > 5) progressionIndicators.push('Diverse interests')

  const completionRate = logs.filter(log => log.status === 'completed').length / logs.length
  if (completionRate > 0.8) progressionIndicators.push('Good follow-through')

  return {
    learningStyle: dominantStyle,
    focusAreas,
    progressionIndicators
  }
}