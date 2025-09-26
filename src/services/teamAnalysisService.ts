import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import type { ClaudeChatLog } from '../hooks/useSupabase'
import type {
  TeamInsight,
  DeveloperProfile,
  ConversationInsights,
  ProjectHealthMetrics,
  RiskAssessment,
  TeamAnalysisRequest,
  AnalysisResult,
  ExtractionContext
} from '../types/analysis'

// Zod schemas for structured output validation
const TeamInsightSchema = z.object({
  project_id: z.string(),
  project_name: z.string(),
  analysis_date: z.string(),
  team_health_score: z.number().min(1).max(10),
  key_topics: z.array(z.string()),
  collaboration_patterns: z.string(),
  risk_indicators: z.array(z.string()).optional(),
  productivity_trends: z.string(),
  communication_quality: z.number().min(1).max(10),
  knowledge_sharing_level: z.number().min(1).max(10),
  bottlenecks: z.array(z.string()),
  recommendations: z.array(z.string())
})

const DeveloperProfileSchema = z.object({
  user_id: z.string(),
  analysis_date: z.string(),
  expertise_areas: z.array(z.string()),
  learning_trajectory: z.string(),
  communication_style: z.string(),
  productivity_indicators: z.array(z.string()),
  collaboration_score: z.number().min(1).max(10),
  problem_solving_patterns: z.array(z.string()),
  preferred_topics: z.array(z.string()),
  growth_areas: z.array(z.string()),
  mentoring_potential: z.number().min(1).max(10)
})

const ConversationInsightsSchema = z.object({
  conversation_id: z.string(),
  user_query: z.string(),
  claude_response: z.string(),
  extracted_topics: z.array(z.string()),
  conversation_type: z.enum(['learning', 'problem_solving', 'collaboration', 'exploration', 'debugging']),
  complexity_level: z.enum(['beginner', 'intermediate', 'advanced']),
  emotional_tone: z.enum(['positive', 'neutral', 'frustrated', 'excited']),
  learning_indicators: z.array(z.string()),
  technical_concepts: z.array(z.string()),
  decision_points: z.array(z.string())
})

export class TeamAnalysisService {
  private llm: ChatOpenAI
  private teamInsightParser: StructuredOutputParser<z.infer<typeof TeamInsightSchema>>
  private developerProfileParser: StructuredOutputParser<z.infer<typeof DeveloperProfileSchema>>
  private conversationInsightsParser: StructuredOutputParser<z.infer<typeof ConversationInsightsSchema>>

  constructor() {
    // Initialize OpenAI model
    this.llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: 'gpt-4-1106-preview', // or 'gpt-3.5-turbo' for faster/cheaper analysis
      temperature: 0.1, // Low temperature for consistent structured output
      maxTokens: 2000
    })

    // Initialize parsers
    this.teamInsightParser = StructuredOutputParser.fromZodSchema(TeamInsightSchema)
    this.developerProfileParser = StructuredOutputParser.fromZodSchema(DeveloperProfileSchema)
    this.conversationInsightsParser = StructuredOutputParser.fromZodSchema(ConversationInsightsSchema)
  }

  async analyzeTeamHealth(request: TeamAnalysisRequest): Promise<AnalysisResult<TeamInsight>> {
    const startTime = Date.now()

    try {
      // Fetch conversation data
      const conversations = await this.fetchConversations(request)

      if (conversations.length === 0) {
        return {
          success: false,
          error: 'No conversations found for analysis',
          analysis_metadata: {
            conversations_analyzed: 0,
            analysis_timestamp: new Date().toISOString(),
            model_used: this.llm.modelName,
            processing_time_ms: Date.now() - startTime
          }
        }
      }

      // Create extraction context
      const context = this.createExtractionContext(conversations, request)

      // Create prompt for team analysis
      const prompt = PromptTemplate.fromTemplate(`
        You are an expert software team analyst. Analyze the following conversation data to extract team health insights.

        Project Context:
        - Project: {project_name}
        - Team Size: {team_size}
        - Analysis Period: {analysis_period}

        Conversation Data:
        {conversations}

        Please analyze this data and provide structured insights focusing on:
        1. Team collaboration patterns and communication effectiveness
        2. Knowledge sharing and learning dynamics
        3. Productivity trends and bottlenecks
        4. Risk indicators and potential issues
        5. Overall team health score (1-10)
        6. Actionable recommendations

        {format_instructions}
      `)

      const formatInstructions = this.teamInsightParser.getFormatInstructions()

      const chain = prompt.pipe(this.llm).pipe(this.teamInsightParser)

      const result = await chain.invoke({
        project_name: context.project_context.project_name,
        team_size: context.project_context.team_size,
        analysis_period: request.time_range ? `${request.time_range.start_date} to ${request.time_range.end_date}` : 'Recent activity',
        conversations: this.formatConversationsForPrompt(context.conversations),
        format_instructions: formatInstructions
      })

      // Enrich result with metadata
      const enrichedResult: TeamInsight = {
        ...result,
        project_id: request.project_id || 'unknown',
        analysis_date: new Date().toISOString()
      }

      return {
        success: true,
        data: enrichedResult,
        analysis_metadata: {
          conversations_analyzed: conversations.length,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        analysis_metadata: {
          conversations_analyzed: 0,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime
        }
      }
    }
  }

  async analyzeDeveloperProfile(request: TeamAnalysisRequest): Promise<AnalysisResult<DeveloperProfile>> {
    const startTime = Date.now()

    try {
      if (!request.user_id) {
        throw new Error('User ID is required for developer profile analysis')
      }

      const conversations = await this.fetchConversations(request)

      if (conversations.length === 0) {
        return {
          success: false,
          error: 'No conversations found for this user',
          analysis_metadata: {
            conversations_analyzed: 0,
            analysis_timestamp: new Date().toISOString(),
            model_used: this.llm.modelName,
            processing_time_ms: Date.now() - startTime
          }
        }
      }

      const context = this.createExtractionContext(conversations, request)

      const prompt = PromptTemplate.fromTemplate(`
        You are an expert developer coach and analyst. Analyze the following conversation data to create a comprehensive developer profile.

        Developer Context:
        - User ID: {user_id}
        - Analysis Period: {analysis_period}
        - Total Conversations: {conversation_count}

        Conversation Data:
        {conversations}

        Please analyze this data and provide structured insights focusing on:
        1. Technical expertise areas and skill levels
        2. Learning patterns and trajectory
        3. Communication and collaboration style
        4. Problem-solving approaches and patterns
        5. Growth areas and learning opportunities
        6. Mentoring potential and leadership indicators

        {format_instructions}
      `)

      const formatInstructions = this.developerProfileParser.getFormatInstructions()

      const chain = prompt.pipe(this.llm).pipe(this.developerProfileParser)

      const result = await chain.invoke({
        user_id: request.user_id,
        analysis_period: request.time_range ? `${request.time_range.start_date} to ${request.time_range.end_date}` : 'Recent activity',
        conversation_count: conversations.length,
        conversations: this.formatConversationsForPrompt(context.conversations),
        format_instructions: formatInstructions
      })

      // Enrich result with metadata
      const enrichedResult: DeveloperProfile = {
        ...result,
        user_id: request.user_id,
        analysis_date: new Date().toISOString()
      }

      return {
        success: true,
        data: enrichedResult,
        analysis_metadata: {
          conversations_analyzed: conversations.length,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime
        }
      }
    } catch (error) {
      return {
        success: false,
        error: `Profile analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        analysis_metadata: {
          conversations_analyzed: 0,
          analysis_timestamp: new Date().toISOString(),
          model_used: this.llm.modelName,
          processing_time_ms: Date.now() - startTime
        }
      }
    }
  }

  private async fetchConversations(request: TeamAnalysisRequest): Promise<ClaudeChatLog[]> {
    let query = supabase
      .from('claude_chat_logs')
      .select('*')
      .order('interaction_timestamp', { ascending: false })
      .limit(request.conversation_limit || 50)

    if (request.project_id) {
      query = query.eq('project_id', request.project_id)
    }

    if (request.user_id) {
      query = query.eq('user_id', request.user_id)
    }

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

  private createExtractionContext(conversations: ClaudeChatLog[], request: TeamAnalysisRequest): ExtractionContext {
    return {
      conversations: conversations.map(conv => ({
        id: conv.id,
        user_query: conv.user_query,
        claude_response: conv.claude_response,
        timestamp: conv.interaction_timestamp,
        user_id: conv.user_id
      })),
      project_context: {
        project_id: request.project_id || 'unknown',
        project_name: conversations[0]?.project_name || 'Unknown Project',
        team_size: new Set(conversations.map(c => c.user_id)).size
      },
      analysis_focus: request.analysis_type
    }
  }

  private formatConversationsForPrompt(conversations: ExtractionContext['conversations']): string {
    return conversations
      .slice(0, 20) // Limit to avoid token limits
      .map((conv, index) =>
        `Conversation ${index + 1}:
User Query: ${conv.user_query}
Claude Response: ${conv.claude_response || 'No response'}
Timestamp: ${conv.timestamp}
---`
      ).join('\n')
  }

  // Batch processing for large datasets
  async batchAnalyzeConversations(conversations: ClaudeChatLog[], batchSize = 10): Promise<ConversationInsights[]> {
    const results: ConversationInsights[] = []

    for (let i = 0; i < conversations.length; i += batchSize) {
      const batch = conversations.slice(i, i + batchSize)
      const batchResults = await this.analyzeBatchConversations(batch)
      results.push(...batchResults)

      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000))
    }

    return results
  }

  private async analyzeBatchConversations(conversations: ClaudeChatLog[]): Promise<ConversationInsights[]> {
    const prompt = PromptTemplate.fromTemplate(`
      Analyze each of the following conversations and extract structured insights.

      Conversations:
      {conversations}

      For each conversation, identify:
      1. Main topics discussed
      2. Type of conversation (learning, problem-solving, etc.)
      3. Complexity level
      4. Emotional tone
      5. Learning indicators
      6. Technical concepts mentioned

      {format_instructions}
    `)

    const formatInstructions = this.conversationInsightsParser.getFormatInstructions()

    try {
      const chain = prompt.pipe(this.llm).pipe(this.conversationInsightsParser)

      const results = await Promise.all(
        conversations.map(async (conv) => {
          const result = await chain.invoke({
            conversations: this.formatSingleConversation(conv),
            format_instructions: formatInstructions
          })
          return result
        })
      )

      return results
    } catch (error) {
      console.error('Batch analysis failed:', error)
      return []
    }
  }

  private formatSingleConversation(conversation: ClaudeChatLog): string {
    return `Query: ${conversation.user_query}
Response: ${conversation.claude_response || 'No response'}
Timestamp: ${conversation.interaction_timestamp}`
  }
}