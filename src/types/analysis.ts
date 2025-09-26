// TypeScript types that mirror LangChain Pydantic schemas for structured output

export interface TeamInsight {
  project_id: string
  project_name: string
  analysis_date: string
  team_health_score: number // 1-10 scale
  key_topics: string[]
  collaboration_patterns: string
  risk_indicators?: string[]
  productivity_trends: string
  communication_quality: number // 1-10 scale
  knowledge_sharing_level: number // 1-10 scale
  bottlenecks: string[]
  recommendations: string[]
}

export interface DeveloperProfile {
  user_id: string
  analysis_date: string
  expertise_areas: string[]
  learning_trajectory: string
  communication_style: string
  productivity_indicators: string[]
  collaboration_score: number // 1-10 scale
  problem_solving_patterns: string[]
  preferred_topics: string[]
  growth_areas: string[]
  mentoring_potential: number // 1-10 scale
}

export interface ConversationInsights {
  conversation_id: string
  user_query: string
  claude_response: string
  extracted_topics: string[]
  conversation_type: 'learning' | 'problem_solving' | 'collaboration' | 'exploration' | 'debugging'
  complexity_level: 'beginner' | 'intermediate' | 'advanced'
  emotional_tone: 'positive' | 'neutral' | 'frustrated' | 'excited'
  learning_indicators: string[]
  technical_concepts: string[]
  decision_points: string[]
}

export interface ProjectHealthMetrics {
  project_id: string
  project_name: string
  analysis_period: {
    start_date: string
    end_date: string
  }
  overall_health: number // 1-10 scale
  velocity_trend: 'increasing' | 'stable' | 'decreasing'
  team_cohesion: number // 1-10 scale
  knowledge_distribution: number // 1-10 scale (how well knowledge is shared)
  risk_level: 'low' | 'medium' | 'high'
  critical_issues: string[]
  strengths: string[]
  improvement_areas: string[]
  predicted_outcomes: string[]
}

export interface RiskAssessment {
  project_id: string
  risk_type: 'technical' | 'communication' | 'resource' | 'timeline' | 'knowledge'
  severity: 'low' | 'medium' | 'high' | 'critical'
  description: string
  indicators: string[]
  potential_impact: string
  recommended_actions: string[]
  confidence_score: number // 0-1 scale
}

// Request types for the analysis service
export interface TeamAnalysisRequest {
  project_id?: string
  user_id?: string
  time_range?: {
    start_date: string
    end_date: string
  }
  analysis_type: 'team_health' | 'developer_profile' | 'project_health' | 'risk_assessment' | 'conversation_insights'
  conversation_limit?: number
}

// Response types
export interface AnalysisResult<T> {
  success: boolean
  data?: T
  error?: string
  analysis_metadata: {
    conversations_analyzed: number
    analysis_timestamp: string
    model_used: string
    processing_time_ms: number
  }
}

// Aggregated dashboard data
export interface TeamDashboardData {
  team_insights: TeamInsight[]
  developer_profiles: DeveloperProfile[]
  project_health: ProjectHealthMetrics[]
  recent_risks: RiskAssessment[]
  conversation_summary: {
    total_conversations: number
    topics_trending: string[]
    most_active_users: string[]
    learning_momentum: number
  }
}

// LangChain extraction schemas (what we send to the LLM)
export interface ExtractionContext {
  conversations: Array<{
    id: string
    user_query: string
    claude_response: string | null
    timestamp: string
    user_id: string
  }>
  project_context: {
    project_id: string
    project_name: string
    team_size: number
  }
  analysis_focus: string // What specific insights to extract
}