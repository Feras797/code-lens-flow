import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import type {
  PersonalDigest,
  DigestRequest,
  DigestResult,
  PersonalConversationData
} from '../types/personalInsights'

// Zod schema for structured output validation
const PersonalDigestSchema = z.object({
  recent_focus: z.string().describe('What the developer has been primarily working on lately'),
  activity_summary: z.string().describe('Compressed summary of recent development activity'),
  key_learnings: z.array(z.string()).describe('Main concepts or technologies learned'),
  progress_highlights: z.array(z.string()).describe('Notable achievements or breakthroughs'),
  current_momentum: z.enum(['high', 'medium', 'low']).describe('Overall development velocity'),
  learning_trajectory: z.string().describe('Description of their learning path'),
  problem_solving_approach: z.string().describe('How they tackle challenges'),
  collaboration_patterns: z.string().describe('How they engage with the AI assistant'),
  growth_areas: z.array(z.string()).describe('Areas showing improvement or focus'),
  technical_depth: z.enum(['beginner', 'intermediate', 'advanced']).describe('Current skill level indicators'),
  confidence_score: z.number().min(0).max(1).describe('Confidence in the analysis')
})

export class PersonalInsightsDigestService {
  private llm: ChatOpenAI
  private digestParser: StructuredOutputParser<z.infer<typeof PersonalDigestSchema>>

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: 'gpt-4o-mini', // Fast and efficient model for digest generation
      temperature: 0.2, // Low temperature for consistent but slightly creative output
      maxTokens: 1500
    })

    this.digestParser = StructuredOutputParser.fromZodSchema(PersonalDigestSchema)
  }

  async generateDigest(request: DigestRequest): Promise<DigestResult> {
    const startTime = Date.now()

    try {
      // Fetch conversation data from Supabase
      const conversations = await this.fetchPersonalConversations(request)

      if (conversations.length === 0) {
        return {
          success: false,
          error: 'No conversations found for analysis',
          analysis_metadata: {
            conversations_analyzed: 0,
            analysis_timestamp: new Date().toISOString(),
            model_used: this.llm.modelName,
            processing_time_ms: Date.now() - startTime,
            cache_used: false
          }
        }
      }

      // Generate the digest using LLM
      const digestData = await this.analyzeDevelopmentPatterns(conversations)

      const personalDigest: PersonalDigest = {
        user_id: request.user_id,
        analysis_date: new Date().toISOString(),
        ...digestData
      }

      return {
        success: true,
        data: personalDigest,
        analysis_metadata: {
          conversations_analyzed: conversations.length,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime,
          cache_used: false
        }
      }
    } catch (error) {
      console.error('Personal insights digest generation failed:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        analysis_metadata: {
          conversations_analyzed: 0,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime,
          cache_used: false
        }
      }
    }
  }

  private async fetchPersonalConversations(request: DigestRequest): Promise<PersonalConversationData[]> {
    const limit = request.conversation_limit || 50

    let query = supabase
      .from('claude_chat_logs')
      .select('*')
      .eq('user_id', request.user_id)
      .order('interaction_timestamp', { ascending: false })
      .limit(limit)

    // Apply time range filter if provided
    if (request.time_range) {
      query = query
        .gte('interaction_timestamp', request.time_range.start_date)
        .lte('interaction_timestamp', request.time_range.end_date)
    }

    const { data, error } = await query

    if (error) {
      throw new Error(`Failed to fetch conversations: ${error.message}`)
    }

    return data || []
  }

  private async analyzeDevelopmentPatterns(conversations: PersonalConversationData[]): Promise<Omit<PersonalDigest, 'user_id' | 'analysis_date'>> {
    // Prepare conversation data for analysis
    const conversationText = conversations
      .slice(0, 30) // Limit to most recent 30 to avoid token limits
      .map((conv, index) => {
        const timestamp = new Date(conv.interaction_timestamp)
        const query = conv.user_query || ''
        const response = (conv.claude_response || '').substring(0, 200) // Truncate long responses

        return `[${index + 1}] Time: ${timestamp.toLocaleDateString()}
Query: "${query}"
Response: "${response}${conv.claude_response && conv.claude_response.length > 200 ? '...' : ''}"
Status: ${conv.status}
Project: ${conv.project_name || 'Unknown'}
---`
      })
      .join('\n')

    // Create prompt for digest analysis
    const prompt = PromptTemplate.fromTemplate(`
You are analyzing a developer's recent conversations with an AI coding assistant. Generate comprehensive insights about their development patterns, learning trajectory, and current focus areas.

Conversation Data (most recent first):
{conversations}

Analysis Guidelines:
- Focus on patterns and trends rather than specific dates
- Identify what they're learning and how they're growing
- Assess their problem-solving approach and collaboration style
- Determine their current technical momentum and focus areas
- Be specific about technologies, concepts, and methodologies mentioned
- Provide actionable insights about their development journey

{format_instructions}

Generate a comprehensive digest that captures the essence of their recent development activity:`)

    const formatInstructions = this.digestParser.getFormatInstructions()

    const chain = prompt.pipe(this.llm).pipe(this.digestParser)

    const result = await chain.invoke({
      conversations: conversationText,
      format_instructions: formatInstructions
    })

    return result
  }

  // Fallback analysis for when LLM fails
  private createFallbackDigest(conversations: PersonalConversationData[]): Omit<PersonalDigest, 'user_id' | 'analysis_date'> {
    const recentQueries = conversations
      .slice(0, 10)
      .map(c => c.user_query || '')
      .join(' ')
      .toLowerCase()

    // Simple keyword-based analysis
    const hasReactKeywords = /react|component|jsx|tsx/.test(recentQueries)
    const hasBackendKeywords = /api|server|database|sql|node/.test(recentQueries)
    const hasErrorKeywords = /error|bug|fix|debug|issue/.test(recentQueries)
    const hasLearningKeywords = /how|what|learn|understand|explain/.test(recentQueries)

    let focus = 'General development work'
    let momentum: 'high' | 'medium' | 'low' = 'medium'
    let technical_depth: 'beginner' | 'intermediate' | 'advanced' = 'intermediate'

    if (hasReactKeywords && hasBackendKeywords) {
      focus = 'Full-stack development with React and backend technologies'
      technical_depth = 'advanced'
    } else if (hasReactKeywords) {
      focus = 'Frontend development with React'
    } else if (hasBackendKeywords) {
      focus = 'Backend development and API work'
    }

    if (conversations.length > 20) {
      momentum = 'high'
    } else if (conversations.length < 5) {
      momentum = 'low'
    }

    return {
      recent_focus: focus,
      activity_summary: `Active development work with ${conversations.length} recent conversations covering various technical topics`,
      key_learnings: hasLearningKeywords ? ['Exploring new concepts', 'Seeking deeper understanding'] : ['Applying existing knowledge'],
      progress_highlights: ['Consistent engagement with development tasks'],
      current_momentum: momentum,
      learning_trajectory: hasLearningKeywords ? 'Actively seeking new knowledge and explanations' : 'Focused on implementation and problem-solving',
      problem_solving_approach: hasErrorKeywords ? 'Debug-oriented with focus on resolving issues' : 'Implementation-focused development',
      collaboration_patterns: 'Regular interaction with AI assistant for guidance and problem-solving',
      growth_areas: hasReactKeywords || hasBackendKeywords ? ['Frontend technologies', 'Backend systems'] : ['General development skills'],
      technical_depth,
      confidence_score: 0.4 // Lower confidence for fallback analysis
    }
  }
}