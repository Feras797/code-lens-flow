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
}