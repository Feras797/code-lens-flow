import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import { supabase } from '../lib/supabase'
import type { ClaudeChatLog } from '../hooks/useSupabase'
import type { DevelopmentEvent } from '../hooks/useDevelopmentTimeline'

// Zod schema for structured timeline analysis
const DevelopmentTimelineSchema = z.object({
  events: z.array(z.object({
    eventId: z.string(),
    type: z.enum(['feature', 'bug', 'refactor', 'documentation', 'testing', 'deployment', 'learning', 'collaboration']),
    category: z.enum(['code', 'architecture', 'review', 'planning', 'debugging']),
    impact: z.enum(['critical', 'high', 'medium', 'low']),
    title: z.string(),
    summary: z.string(),
    keyAchievements: z.array(z.string()),
    technologies: z.array(z.string()),
    learningOutcomes: z.array(z.string()).optional(),
    nextSteps: z.array(z.string()).optional()
  })),
  dailySummary: z.object({
    date: z.string(),
    overallProductivity: z.number().min(1).max(10),
    mainFocus: z.string(),
    keyAccomplishments: z.array(z.string()),
    challengesFaced: z.array(z.string()),
    timeWellSpent: z.boolean(),
    momentum: z.enum(['building', 'maintaining', 'struggling'])
  }),
  patterns: z.object({
    workingStyle: z.string(),
    peakProductivityTime: z.string(),
    preferredTaskTypes: z.array(z.string()),
    collaborationPattern: z.string(),
    learningApproach: z.string()
  }),
  insights: z.object({
    strengths: z.array(z.string()),
    improvementAreas: z.array(z.string()),
    emergingSkills: z.array(z.string()),
    bottlenecks: z.array(z.string())
  }),
  recommendations: z.array(z.object({
    priority: z.enum(['high', 'medium', 'low']),
    action: z.string(),
    reasoning: z.string(),
    expectedOutcome: z.string()
  }))
})

export interface TimelineAnalysisRequest {
  userId: string
  projectId?: string
  logs: ClaudeChatLog[]
  timeRange?: {
    start: string
    end: string
  }
  focusArea?: 'productivity' | 'learning' | 'collaboration' | 'quality'
}

export interface TimelineAnalysisResult {
  success: boolean
  data?: z.infer<typeof DevelopmentTimelineSchema>
  error?: string
  metadata: {
    logsAnalyzed: number
    analysisTimestamp: string
    modelUsed: string
    processingTimeMs: number
  }
}

export class DevelopmentTimelineService {
  private llm: ChatOpenAI
  private parser: StructuredOutputParser<z.infer<typeof DevelopmentTimelineSchema>>

  constructor() {
    // Initialize OpenAI model for timeline analysis
    this.llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: 'gpt-4-1106-preview',
      temperature: 0.2, // Low temperature for consistent analysis
      maxTokens: 3000
    })

    // Initialize parser
    this.parser = StructuredOutputParser.fromZodSchema(DevelopmentTimelineSchema)
  }

  async analyzeTimeline(request: TimelineAnalysisRequest): Promise<TimelineAnalysisResult> {
    const startTime = Date.now()

    try {
      if (!request.logs || request.logs.length === 0) {
        return {
          success: false,
          error: 'No conversation logs provided for analysis',
          metadata: {
            logsAnalyzed: 0,
            analysisTimestamp: new Date().toISOString(),
            modelUsed: this.llm.modelName,
            processingTimeMs: Date.now() - startTime
          }
        }
      }

      // Create prompt for timeline analysis
      const prompt = PromptTemplate.fromTemplate(`
        You are an expert development coach analyzing a developer's activity timeline.
        Your goal is to provide actionable insights about their development journey.

        Developer Context:
        - User ID: {userId}
        - Project: {projectId}
        - Time Period: {timeRange}
        - Total Activities: {activityCount}

        Development Activity Logs:
        {activities}

        Please analyze this timeline and provide:
        1. Detailed event categorization and impact assessment
        2. Daily productivity summary with momentum tracking
        3. Work patterns and style identification
        4. Strengths, improvement areas, and emerging skills
        5. Specific, actionable recommendations

        Focus on:
        - Identifying productive patterns and bottlenecks
        - Recognizing learning moments and skill development
        - Assessing collaboration and communication effectiveness
        - Highlighting achievements and areas for growth
        - Providing constructive, encouraging feedback

        Important guidelines:
        - Be specific and reference actual activities
        - Focus on patterns, not isolated incidents
        - Provide actionable recommendations
        - Maintain a supportive, growth-oriented tone
        - Identify both technical and soft skill development

        {format_instructions}
      `)

      const formatInstructions = this.parser.getFormatInstructions()

      // Prepare activity summary
      const activities = this.formatLogsForAnalysis(request.logs)
      const timeRange = request.timeRange 
        ? `${request.timeRange.start} to ${request.timeRange.end}`
        : this.getTimeRangeFromLogs(request.logs)

      // Run the analysis
      const chain = prompt.pipe(this.llm).pipe(this.parser)

      const result = await chain.invoke({
        userId: request.userId,
        projectId: request.projectId || 'Various Projects',
        timeRange,
        activityCount: request.logs.length,
        activities,
        format_instructions: formatInstructions
      })

      // Store the analysis in database
      await this.storeTimelineAnalysis(request.userId, result)

      return {
        success: true,
        data: result,
        metadata: {
          logsAnalyzed: request.logs.length,
          analysisTimestamp: new Date().toISOString(),
          modelUsed: this.llm.modelName,
          processingTimeMs: Date.now() - startTime
        }
      }
    } catch (error) {
      console.error('Timeline analysis failed:', error)
      return {
        success: false,
        error: `Analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        metadata: {
          logsAnalyzed: request.logs.length,
          analysisTimestamp: new Date().toISOString(),
          modelUsed: this.llm.modelName,
          processingTimeMs: Date.now() - startTime
        }
      }
    }
  }

  async generateEventInsight(event: DevelopmentEvent): Promise<string> {
    // Quick insight generation for individual events
    const prompt = PromptTemplate.fromTemplate(`
      Provide a brief, insightful summary of this development event:
      
      Type: {type}
      Title: {title}
      Impact: {impact}
      Status: {status}
      Technologies: {technologies}
      
      Generate a 1-2 sentence insight that:
      - Acknowledges the work done
      - Highlights the significance
      - Provides encouragement or a growth opportunity
      
      Keep it concise, specific, and constructive.
    `)

    try {
      const chain = prompt.pipe(this.llm)
      const insight = await chain.invoke({
        type: event.type,
        title: event.title,
        impact: event.impact,
        status: event.status,
        technologies: event.technologies?.join(', ') || 'Various'
      })

      return insight.content as string
    } catch (error) {
      console.error('Failed to generate event insight:', error)
      return 'Great progress on this task!'
    }
  }

  async analyzeDailyProgress(userId: string, date: string): Promise<any> {
    // Fetch logs for specific date
    const startOfDay = new Date(date)
    startOfDay.setHours(0, 0, 0, 0)
    
    const endOfDay = new Date(date)
    endOfDay.setHours(23, 59, 59, 999)

    const { data: logs } = await supabase
      .from('claude_chat_logs')
      .select('*')
      .eq('user_id', userId)
      .gte('interaction_timestamp', startOfDay.toISOString())
      .lte('interaction_timestamp', endOfDay.toISOString())
      .order('interaction_timestamp', { ascending: true })

    if (!logs || logs.length === 0) {
      return null
    }

    // Quick daily analysis
    const request: TimelineAnalysisRequest = {
      userId,
      logs,
      timeRange: {
        start: startOfDay.toISOString(),
        end: endOfDay.toISOString()
      },
      focusArea: 'productivity'
    }

    const analysis = await this.analyzeTimeline(request)
    return analysis.data?.dailySummary
  }

  private formatLogsForAnalysis(logs: ClaudeChatLog[]): string {
    return logs
      .slice(0, 30) // Limit to prevent token overflow
      .map((log, index) => {
        const timestamp = new Date(log.interaction_timestamp)
        const time = timestamp.toLocaleTimeString('en-US', { 
          hour: '2-digit', 
          minute: '2-digit' 
        })
        
        return `Activity ${index + 1} (${time}):
Query: ${this.truncate(log.user_query, 200)}
Response Summary: ${this.truncate(log.claude_response || 'Pending', 150)}
Status: ${log.status}
Project: ${log.project_name}
---`
      })
      .join('\n\n')
  }

  private getTimeRangeFromLogs(logs: ClaudeChatLog[]): string {
    if (logs.length === 0) return 'No data'
    
    const timestamps = logs.map(log => new Date(log.interaction_timestamp))
    const earliest = new Date(Math.min(...timestamps.map(d => d.getTime())))
    const latest = new Date(Math.max(...timestamps.map(d => d.getTime())))
    
    const formatDate = (date: Date) => date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
    
    if (earliest.toDateString() === latest.toDateString()) {
      return formatDate(earliest)
    }
    
    return `${formatDate(earliest)} to ${formatDate(latest)}`
  }

  private truncate(text: string, maxLength: number): string {
    if (!text) return ''
    if (text.length <= maxLength) return text
    return text.substring(0, maxLength) + '...'
  }

  private async storeTimelineAnalysis(userId: string, analysis: any): Promise<void> {
    try {
      // Store in a custom analysis table if needed
      // For now, we'll just log it
      console.log('Timeline analysis stored for user:', userId)
    } catch (error) {
      console.error('Failed to store timeline analysis:', error)
    }
  }
}

// Export singleton instance
export const timelineService = new DevelopmentTimelineService()

