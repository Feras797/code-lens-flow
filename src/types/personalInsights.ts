// TypeScript types for Personal Insights Digest functionality

export interface PersonalDigest {
  user_id: string
  analysis_date: string
  recent_focus: string // What they've been primarily working on lately
  activity_summary: string // Compressed summary of recent development activity
  key_learnings: string[] // Main concepts or technologies learned
  progress_highlights: string[] // Notable achievements or breakthroughs
  current_momentum: 'high' | 'medium' | 'low' // Overall development velocity
  learning_trajectory: string // Description of their learning path
  problem_solving_approach: string // How they tackle challenges
  collaboration_patterns: string // How they engage with the AI assistant
  growth_areas: string[] // Areas showing improvement or focus
  technical_depth: 'beginner' | 'intermediate' | 'advanced' // Current skill level indicators
  confidence_score: number // 0-1 confidence in the analysis
}

export interface DigestRequest {
  user_id: string
  conversation_limit?: number // Number of recent conversations to analyze (default: 50)
  time_range?: {
    start_date: string
    end_date: string
  }
  analysis_focus?: 'general' | 'learning' | 'productivity' | 'technical_growth'
}

export interface DigestResult {
  success: boolean
  data?: PersonalDigest
  error?: string
  analysis_metadata: {
    conversations_analyzed: number
    analysis_timestamp: string
    model_used: string
    processing_time_ms: number
    cache_used: boolean
  }
}

// Input data structure from Supabase
export interface PersonalConversationData {
  id: string
  user_id: string
  user_query: string
  claude_response: string | null
  interaction_timestamp: string
  project_name?: string
  status: 'pending' | 'completed'
}

// Cache entry structure
export interface DigestCacheEntry {
  data: PersonalDigest
  timestamp: number
  expires: number
  conversations_analyzed: number
}

// Options for digest generation
export interface DigestOptions {
  enabled: boolean
  cacheMinutes?: number // Default: 15
  maxConversations?: number // Default: 50
  includeIncomplete?: boolean // Include pending conversations
}