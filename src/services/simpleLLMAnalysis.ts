import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'

export interface ConversationData {
  id: string
  user_id: string
  user_query: string
  claude_response: string | null
  interaction_timestamp: string
  project_name?: string
}

export interface LLMAnalysisResult {
  user_id: string
  enhanced_status: 'flow' | 'problem_solving' | 'blocked' | 'idle'
  confidence: number // 0-1
  status_reason: string
  key_topics: string[]
  mood_indicator: 'positive' | 'neutral' | 'frustrated' | 'focused'
  productivity_level: 'high' | 'medium' | 'low'
  recommendations?: string[]
}

export interface DetailedLLMInsights {
  user_id: string
  analysis_timestamp: string
  current_focus: string
  progress_assessment: string
  suggestions: string[]
  next_steps: string[]
  collaboration_opportunities: string[]
  time_management_insights: string
  conversation_summary: string
  confidence: number
}

export class SimpleLLMAnalysis {
  private llm: ChatOpenAI

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: 'gpt-4o-mini', // Faster and cheaper model for simple analysis
      temperature: 0.1,
      maxTokens: 500
    })
  }

  async analyzeTeamConversations(conversations: ConversationData[]): Promise<LLMAnalysisResult[]> {
    if (!conversations.length) return []

    // Group conversations by user
    const userGroups = conversations.reduce((acc, conv) => {
      if (!acc[conv.user_id]) {
        acc[conv.user_id] = []
      }
      acc[conv.user_id].push(conv)
      return acc
    }, {} as Record<string, ConversationData[]>)

    const results: LLMAnalysisResult[] = []

    // Analyze each user's conversations
    for (const [userId, userConversations] of Object.entries(userGroups)) {
      try {
        const analysis = await this.analyzeUserConversations(userId, userConversations)
        results.push(analysis)
      } catch (error) {
        console.error(`Failed to analyze user ${userId}:`, error)
        // Return fallback analysis
        results.push(this.createFallbackAnalysis(userId, userConversations))
      }
    }

    return results
  }

  async generateDetailedInsights(userId: string, conversations: ConversationData[]): Promise<DetailedLLMInsights> {
    if (!conversations.length) {
      return this.createFallbackDetailedInsights(userId)
    }

    try {
      // Take most recent 10 conversations for detailed analysis
      const recentConversations = conversations.slice(0, 10)

      const prompt = PromptTemplate.fromTemplate(`
You are analyzing a developer's recent work conversations with an AI assistant. Provide comprehensive insights in the EXACT JSON structure requested.

Developer ID: {userId}
Recent Conversations (most recent first):
{conversations}

Analyze and respond with ONLY a JSON object with these exact fields:
{{
  "current_focus": "One clear sentence about what they're primarily working on right now",
  "progress_assessment": "Assessment of their current momentum and how they're doing (2-3 sentences)",
  "suggestions": ["Actionable recommendation 1", "Actionable recommendation 2", "Actionable recommendation 3"],
  "next_steps": ["Priority task 1", "Priority task 2", "Priority task 3"],
  "collaboration_opportunities": ["How they can help others", "How others can help them"],
  "time_management_insights": "Insights about their work patterns, efficiency, and time usage (2-3 sentences)",
  "conversation_summary": "High-level summary of their recent development activity and concerns (2-3 sentences)",
  "confidence": 0.85
}}

Guidelines:
- Keep all text concise but meaningful
- Focus on actionable insights
- Be specific about technical topics mentioned
- Consider their work patterns and engagement level
- Maintain professional tone
- Confidence should reflect data quality (0.7-1.0)`)

      const conversationText = recentConversations.map((conv, i) =>
        `${i + 1}. Time: ${conv.interaction_timestamp}
Query: "${conv.user_query}"
Response: "${(conv.claude_response || '').substring(0, 300)}..."
---`
      ).join('\n')

      const chain = prompt.pipe(this.llm)
      const result = await chain.invoke({
        userId: userId,
        conversations: conversationText
      })

      // Parse LLM response
      const parsed = JSON.parse(result.content as string)

      return {
        user_id: userId,
        analysis_timestamp: new Date().toISOString(),
        current_focus: parsed.current_focus || 'Working on development tasks',
        progress_assessment: parsed.progress_assessment || 'Making steady progress',
        suggestions: parsed.suggestions || [],
        next_steps: parsed.next_steps || [],
        collaboration_opportunities: parsed.collaboration_opportunities || [],
        time_management_insights: parsed.time_management_insights || 'Maintaining consistent work patterns',
        conversation_summary: parsed.conversation_summary || 'Active in development discussions',
        confidence: parsed.confidence || 0.7
      }
    } catch (error) {
      console.error(`Failed to generate detailed insights for user ${userId}:`, error)
      return this.createFallbackDetailedInsights(userId)
    }
  }

  private createFallbackDetailedInsights(userId: string): DetailedLLMInsights {
    return {
      user_id: userId,
      analysis_timestamp: new Date().toISOString(),
      current_focus: 'Development work in progress',
      progress_assessment: 'Limited conversation data available for detailed assessment',
      suggestions: ['Continue current work', 'Document progress', 'Consider code review'],
      next_steps: ['Complete current tasks', 'Plan next iteration'],
      collaboration_opportunities: ['Available for team discussions'],
      time_management_insights: 'Insufficient data for time management analysis',
      conversation_summary: 'Limited recent activity in tracked conversations',
      confidence: 0.3
    }
  }

  private async analyzeUserConversations(userId: string, conversations: ConversationData[]): Promise<LLMAnalysisResult> {
    // Take most recent 5 conversations to keep prompt small
    const recentConversations = conversations.slice(0, 5)

    const prompt = PromptTemplate.fromTemplate(`
You are analyzing a developer's recent conversations with an AI assistant. Determine their current work state.

Recent Conversations (most recent first):
{conversations}

Analyze and respond with ONLY a JSON object with these exact fields:
{{
  "status": "flow|problem_solving|blocked|idle",
  "confidence": 0.8,
  "reason": "Brief explanation of why this status was chosen",
  "topics": ["topic1", "topic2"],
  "mood": "positive|neutral|frustrated|focused",
  "productivity": "high|medium|low"
}}

Status Definitions:
- flow: Making steady progress, asking for implementation help
- problem_solving: Multiple attempts, debugging, trying different approaches
- blocked: Stuck on errors, asking for help with same issue repeatedly
- idle: No recent meaningful development activity

Keep the JSON response concise and accurate.`
    )

    const conversationText = recentConversations.map((conv, i) =>
      `${i + 1}. Query: "${conv.user_query}"\nResponse: "${(conv.claude_response || '').substring(0, 200)}..."\nTime: ${conv.interaction_timestamp}\n---`
    ).join('\n')

    const chain = prompt.pipe(this.llm)
    const result = await chain.invoke({
      conversations: conversationText
    })

    // Parse LLM response
    try {
      const parsed = JSON.parse(result.content as string)

      return {
        user_id: userId,
        enhanced_status: parsed.status as any,
        confidence: parsed.confidence || 0.7,
        status_reason: parsed.reason || 'Analysis completed',
        key_topics: parsed.topics || [],
        mood_indicator: parsed.mood as any || 'neutral',
        productivity_level: parsed.productivity as any || 'medium',
        recommendations: this.generateRecommendations(parsed.status, parsed.mood)
      }
    } catch (parseError) {
      console.error('Failed to parse LLM response:', parseError)
      return this.createFallbackAnalysis(userId, conversations)
    }
  }

  private createFallbackAnalysis(userId: string, conversations: ConversationData[]): LLMAnalysisResult {
    // Simple keyword-based fallback
    const recentText = conversations.slice(0, 3)
      .map(c => `${c.user_query} ${c.claude_response || ''}`)
      .join(' ')
      .toLowerCase()

    let status: LLMAnalysisResult['enhanced_status'] = 'idle'
    let mood: LLMAnalysisResult['mood_indicator'] = 'neutral'

    if (recentText.includes('error') || recentText.includes('stuck')) {
      status = 'blocked'
      mood = 'frustrated'
    } else if (recentText.includes('debug') || recentText.includes('fix')) {
      status = 'problem_solving'
      mood = 'focused'
    } else if (conversations.length > 0) {
      status = 'flow'
      mood = 'positive'
    }

    return {
      user_id: userId,
      enhanced_status: status,
      confidence: 0.5, // Lower confidence for fallback
      status_reason: 'Fallback analysis (LLM unavailable)',
      key_topics: this.extractKeywords(recentText),
      mood_indicator: mood,
      productivity_level: conversations.length > 3 ? 'high' : conversations.length > 1 ? 'medium' : 'low',
      recommendations: []
    }
  }

  private extractKeywords(text: string): string[] {
    const keywords = ['react', 'component', 'api', 'database', 'auth', 'ui', 'bug', 'feature', 'test']
    return keywords.filter(keyword => text.includes(keyword)).slice(0, 3)
  }

  private generateRecommendations(status: string, mood: string): string[] {
    const recommendations: string[] = []

    if (status === 'blocked' && mood === 'frustrated') {
      recommendations.push('Consider taking a short break')
      recommendations.push('Try pair programming or ask for help')
    } else if (status === 'flow' && mood === 'positive') {
      recommendations.push('Great momentum! Document your progress')
      recommendations.push('Consider helping blocked teammates')
    } else if (status === 'problem_solving') {
      recommendations.push('Break down the problem into smaller parts')
      recommendations.push('Consider alternative approaches')
    }

    return recommendations
  }

  async analyzeTaskDetails(taskContext: any): Promise<any> {
    const isError = taskContext.title.toLowerCase().includes('error') || 
                    taskContext.title.toLowerCase().includes('bug') ||
                    taskContext.title.toLowerCase().includes('500');
    const isProduction = taskContext.title.toLowerCase().includes('prod');
    
    try {
      if (taskContext.conversations && taskContext.conversations.length > 0) {
        // Create a more detailed analysis based on conversations
        const prompt = PromptTemplate.fromTemplate(`
You are an expert software debugger analyzing a specific development task.

Task Details:
- Title: {title}
- Description: {description}
- Priority: {status}
- Time Spent: {timeSpent}
- File Path: {filePath}
- Developer Status: {developerStatus}

Recent Related Activity:
{conversations}

Provide a JSON response with EXACTLY these fields:
{{
  "problem_diagnosis": "Detailed analysis of the issue/task",
  "root_cause_analysis": ["cause 1", "cause 2", "cause 3"],
  "suggested_solutions": ["solution 1", "solution 2", "solution 3", "solution 4"],
  "similar_issues": ["pattern 1", "pattern 2"],
  "estimated_complexity": "low|medium|high|critical",
  "blockers": ["blocker 1", "blocker 2"],
  "dependencies": ["dependency 1", "dependency 2"],
  "resources": ["resource 1", "resource 2", "resource 3"],
  "next_actions": ["action 1", "action 2", "action 3"],
  "time_estimate": "time estimate string",
  "confidence": 0.8
}}`)

        const conversationSummary = taskContext.conversations.slice(0, 3)
          .map((c: ConversationData) => `- ${c.user_query}`)
          .join('\n')

        const chain = prompt.pipe(this.model).pipe(this.parser)
        
        const result = await chain.invoke({
          title: taskContext.title,
          description: taskContext.description,
          status: taskContext.status,
          timeSpent: taskContext.timeSpent,
          filePath: taskContext.filePath,
          developerStatus: taskContext.developerStatus,
          conversations: conversationSummary || 'No recent conversations'
        })

        return result
      }
    } catch (error) {
      console.error('Failed to analyze task with LLM:', error)
    }

    // Return fallback analysis
    return {
      problem_diagnosis: isError 
        ? `This appears to be a ${isProduction ? 'production-specific' : ''} error requiring systematic debugging. The ${taskContext.status} priority indicates ${taskContext.status === 'high' ? 'immediate' : 'timely'} attention is needed.`
        : `This task involves ${taskContext.description || 'development work'} with ${taskContext.status} priority.`,
      root_cause_analysis: isError ? [
        isProduction ? 'Environment-specific configuration differences' : 'Code logic error or edge case',
        'Missing or incorrect error handling',
        'External service or dependency failure'
      ] : [
        'Implementation complexity requiring careful design',
        'Integration with existing systems',
        'Performance or scalability considerations'
      ],
      suggested_solutions: isError ? [
        isProduction ? 'Compare environment variables between dev and prod' : 'Add detailed logging',
        'Implement proper error boundaries',
        'Write comprehensive tests to reproduce the issue',
        'Review recent commits for changes'
      ] : [
        'Break down into smaller components',
        'Create a proof of concept first',
        'Review similar implementations',
        'Collaborate with team members'
      ],
      similar_issues: isProduction ? [
        'Production-only errors often relate to environment differences',
        'Check for hardcoded development URLs',
        'Review deployment configurations'
      ] : [
        'Check codebase for similar patterns',
        'Review team documentation'
      ],
      estimated_complexity: taskContext.status === 'high' ? 'high' : 
                           taskContext.status === 'medium' ? 'medium' : 'low',
      blockers: taskContext.developerStatus === 'blocked' ? [
        'Requires additional information or access',
        'Waiting for external dependencies'
      ] : [],
      dependencies: [
        'Access to logs and monitoring',
        'Testing environment availability',
        'Code review process'
      ],
      resources: [
        'Internal documentation and runbooks',
        'Similar resolved issues in ticket system',
        'Team knowledge base',
        'Technical forums and Stack Overflow'
      ],
      next_actions: isError ? [
        'Reproduce the issue locally',
        'Add comprehensive logging',
        'Document findings',
        'Create test cases'
      ] : [
        'Define acceptance criteria',
        'Set up development environment',
        'Create initial implementation',
        'Write tests'
      ],
      time_estimate: taskContext.status === 'high' ? '2-4 hours' : 
                     taskContext.status === 'medium' ? '4-8 hours' : '1-2 hours',
      confidence: 0.7
    }
  }
}