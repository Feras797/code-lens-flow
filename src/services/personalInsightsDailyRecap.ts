import { ChatOpenAI } from '@langchain/openai'
import { PromptTemplate } from '@langchain/core/prompts'
import { StructuredOutputParser } from '@langchain/core/output_parsers'
import { z } from 'zod'
import type { ClaudeChatLog } from '@/hooks/useSupabase'
import type { DailyRecapSummary } from '@/types/personalInsights'

const DailyRecapSchema = z.object({
  morning_summary: z.string().describe('Short, action-oriented sentence (<= 22 words) summarizing morning activity'),
  afternoon_summary: z.string().describe('Short, action-oriented sentence (<= 22 words) summarizing afternoon activity'),
  key_decisions: z.array(z.string()).describe('Up to three crisp decisions or learnings').max(3),
  next_focus: z.string().describe('Single sentence on the most important follow-up or risk'),
  quick_stats: z.array(z.object({
    label: z.string(),
    value: z.string()
  })).describe('Two or three quick stats for chips').max(4)
})

export interface DailyRecapContext {
  logs: ClaudeChatLog[]
  metrics?: {
    totalInteractions?: number
    completedInteractions?: number
    completionRate?: number
    projectsWorkedOn?: number
    topicFrequency?: string[]
  } | null
}

export class PersonalInsightsDailyRecapService {
  private llm: ChatOpenAI
  private parser: StructuredOutputParser<z.infer<typeof DailyRecapSchema>>

  constructor() {
    this.llm = new ChatOpenAI({
      openAIApiKey: import.meta.env.VITE_OPENAI_API_KEY,
      modelName: 'gpt-4o-mini',
      temperature: 0.2,
      maxTokens: 700
    })

    this.parser = StructuredOutputParser.fromZodSchema(DailyRecapSchema)
  }

  async generateDailyRecap(context: DailyRecapContext): Promise<DailyRecapSummary | null> {
    const todaysLogs = this.filterTodaysLogs(context.logs)
    if (todaysLogs.length === 0) {
      return null
    }

    const metricsText = this.buildMetricsSummary(context.metrics)
    const conversationSummary = this.renderConversationSnippets(todaysLogs)

    try {
      const prompt = PromptTemplate.fromTemplate(`
You are an engineering manager summarizing how a developer spent today. Use the data to craft concise, useful insights that feel like a daily standup recap.

Conversation snippets (newest first):
{conversations}

Activity metrics:
{metrics}

Guidelines:
- Keep sentences compact and in active voice.
- Highlight outcomes, blockers, and themes, not play-by-play.
- key_decisions should surface the most consequential choices, learnings, or shifts (3 max).
- quick_stats should be punchy metrics (label/value) that fit in UI chips.
- If information is missing, make a sensible best-effort inference without fabricating specifics.

{format_instructions}
`)

      const chain = prompt
        .pipe(this.llm)
        .pipe(this.parser)

      const raw = await chain.invoke({
        conversations: conversationSummary,
        metrics: metricsText,
        format_instructions: this.parser.getFormatInstructions()
      })

      return this.normalizeResult(raw, context)
    } catch (error) {
      console.error('Daily recap generation failed, using fallback:', error)
      return this.buildFallbackSummary(todaysLogs, context.metrics)
    }
  }

  private filterTodaysLogs(logs: ClaudeChatLog[]): ClaudeChatLog[] {
    const today = new Date().toDateString()
    return logs.filter(log => {
      if (!log.interaction_timestamp) return false
      const timestamp = new Date(log.interaction_timestamp)
      return timestamp.toDateString() === today
    })
  }

  private renderConversationSnippets(logs: ClaudeChatLog[]): string {
    return logs
      .slice(0, 18)
      .map(log => {
        const time = new Date(log.interaction_timestamp).toLocaleTimeString('en-US', {
          hour: '2-digit',
          minute: '2-digit'
        })
        const query = (log.user_query || '').slice(0, 140).replace(/\s+/g, ' ').trim()
        const response = (log.claude_response || '').slice(0, 140).replace(/\s+/g, ' ').trim()

        return `- [${time}] Q: ${query || 'N/A'} | A: ${response || 'N/A'} | status: ${log.status || 'unknown'} | project: ${log.project_id || 'unknown'}`
      })
      .join('\n') || 'No meaningful snippets available.'
  }

  private buildMetricsSummary(metrics?: DailyRecapContext['metrics']): string {
    if (!metrics) {
      return 'No aggregate metrics were available.'
    }

    const parts: string[] = []

    if (typeof metrics.totalInteractions === 'number') {
      parts.push(`Total interactions: ${metrics.totalInteractions}`)
    }

    if (typeof metrics.completedInteractions === 'number') {
      parts.push(`Completed interactions: ${metrics.completedInteractions}`)
    }

    if (typeof metrics.completionRate === 'number') {
      parts.push(`Completion rate: ${(metrics.completionRate * 100).toFixed(0)}%`)
    }

    if (typeof metrics.projectsWorkedOn === 'number') {
      parts.push(`Projects touched: ${metrics.projectsWorkedOn}`)
    }

    if (metrics.topicFrequency && metrics.topicFrequency.length > 0) {
      parts.push(`Top topics: ${metrics.topicFrequency.slice(0, 3).join(', ')}`)
    }

    return parts.length > 0 ? parts.join(' | ') : 'Metrics collection returned empty.'
  }

  private normalizeResult(raw: z.infer<typeof DailyRecapSchema>, context: DailyRecapContext): DailyRecapSummary {
    const fallbackStats = this.defaultQuickStats(context.metrics)

    return {
      morning: raw.morning_summary.trim(),
      afternoon: raw.afternoon_summary.trim(),
      keyDecisions: raw.key_decisions.filter(Boolean).map(item => item.trim()).slice(0, 3),
      nextFocus: raw.next_focus.trim(),
      quickStats: raw.quick_stats.length > 0 ? raw.quick_stats.slice(0, 3).map(entry => ({
        label: entry.label.trim(),
        value: entry.value.trim()
      })) : fallbackStats
    }
  }

  private defaultQuickStats(metrics?: DailyRecapContext['metrics']): DailyRecapSummary['quickStats'] {
    if (!metrics) {
      return []
    }

    const stats: DailyRecapSummary['quickStats'] = []

    if (typeof metrics.totalInteractions === 'number') {
      stats.push({ label: 'Interactions', value: String(metrics.totalInteractions) })
    }

    if (typeof metrics.projectsWorkedOn === 'number') {
      stats.push({ label: 'Projects', value: String(metrics.projectsWorkedOn) })
    }

    if (typeof metrics.completionRate === 'number') {
      stats.push({ label: 'Completion', value: `${Math.round(metrics.completionRate * 100)}%` })
    }

    if (metrics.topicFrequency && metrics.topicFrequency.length > 0) {
      stats.push({ label: 'Focus', value: metrics.topicFrequency[0] })
    }

    return stats.slice(0, 3)
  }

  private buildFallbackSummary(logs: ClaudeChatLog[], metrics?: DailyRecapContext['metrics']): DailyRecapSummary {
    const quickStats = this.defaultQuickStats(metrics)

    const morningLogs = logs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour < 12
    })

    const afternoonLogs = logs.filter(log => {
      const hour = new Date(log.interaction_timestamp).getHours()
      return hour >= 12 && hour < 18
    })

    const describe = (items: ClaudeChatLog[]): string => {
      if (items.length === 0) return 'No notable activity captured.'

      const sample = items[0]?.user_query?.slice(0, 90) || 'general development work'
      return `Touched ${items.length} tasks, anchor example: ${sample}`
    }

    const keyTopics = metrics?.topicFrequency?.slice(0, 2) || []

    return {
      morning: describe(morningLogs),
      afternoon: describe(afternoonLogs),
      keyDecisions: keyTopics.length > 0 ? keyTopics.map(topic => `Explored ${topic}`) : ['Review conversation history for decisions.'],
      nextFocus: 'Continue closing out outstanding threads and document any blockers.',
      quickStats
    }
  }
}

export const personalInsightsDailyRecapService = new PersonalInsightsDailyRecapService()
