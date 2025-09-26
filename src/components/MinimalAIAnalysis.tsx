import { useState } from 'react'
import { Brain, Play } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useClaudeChatLogs } from '@/hooks/useSupabase'
import { useTeamHealthAnalysis } from '@/hooks/useTeamAnalysis'

export function MinimalAIAnalysis() {
  const [analysisResults, setAnalysisResults] = useState<any>(null)

  // Hooks for data and analysis
  const { data: chatLogs, isLoading: logsLoading } = useClaudeChatLogs(20)
  const { analyzeTeamHealth, isLoading: analysisLoading, error: analysisError } = useTeamHealthAnalysis()

  const isAnalyzing = analysisLoading

  const runMinimalAnalysis = async () => {
    try {
      // Check if we have chat logs data
      if (!chatLogs || chatLogs.length === 0) {
        // Fallback to demo mode with sample analysis
        setAnalysisResults({
          user_id: 'workspace',
          email: 'team@code-lens-flow',
          analysis_timestamp: new Date().toISOString(),
          status: 'Demo mode - no chat logs available',
          demo_insights: {
            message: "Running in demo mode with sample analysis",
            sample_metrics: {
              collaboration_score: 8,
              expertise_areas: ["Frontend", "React", "TypeScript"],
              recent_focus: "Component optimization",
              total_conversations: 0
            }
          }
        })
        return
      }

      // Run real AI analysis using the TeamAnalysisService
      const analysisRequest = {
        analysis_type: 'team_health' as const,
        conversation_limit: 20,
        time_range: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          end_date: new Date().toISOString()
        }
      }

      const teamInsight = await analyzeTeamHealth(analysisRequest)

      if (teamInsight) {
        // Transform team insight to format expected by UI
        const analysis = {
          user_id: 'workspace',
          email: 'team@code-lens-flow',
          analysis_timestamp: new Date().toISOString(),
          total_conversations: chatLogs.length,

          // Map team insights to display format
          topics_discussed: teamInsight.key_topics,
          activity_level: teamInsight.team_health_score > 7 ? 'High' :
                         teamInsight.team_health_score > 4 ? 'Medium' : 'Low',
          primary_focus: teamInsight.key_topics[0] || 'General Development',

          // AI-generated insights from real analysis
          ai_insights: {
            summary: teamInsight.collaboration_patterns,
            recommendations: teamInsight.recommendations,
            collaboration_score: teamInsight.communication_quality,
            team_health_score: teamInsight.team_health_score,
            bottlenecks: teamInsight.bottlenecks,
            risk_indicators: teamInsight.risk_indicators
          }
        }

        setAnalysisResults(analysis)
      } else {
        throw new Error('Analysis failed to generate insights')
      }

    } catch (error) {
      console.error('Analysis failed:', error)

      // Fallback with basic stats from chat logs
      const basicAnalysis = {
        user_id: 'workspace',
        email: 'team@code-lens-flow',
        analysis_timestamp: new Date().toISOString(),
        status: 'Basic analysis mode',
        total_conversations: chatLogs?.length || 0,
        topics_discussed: extractTopics(chatLogs || []),
        activity_level: (chatLogs?.length || 0) > 10 ? 'High' :
                       (chatLogs?.length || 0) > 5 ? 'Medium' : 'Low',
        error_message: analysisError || 'AI analysis temporarily unavailable'
      }

      setAnalysisResults(basicAnalysis)
    }
  }

  // Helper functions for basic analysis (no AI needed)
  function extractTopics(messages: any[]): string[] {
    const keywords = {
      'Frontend': ['react', 'component', 'ui', 'css', 'html'],
      'Backend': ['api', 'database', 'server', 'endpoint'],
      'Database': ['sql', 'query', 'table', 'postgres'],
      'DevOps': ['deploy', 'docker', 'ci/cd', 'aws'],
      'Testing': ['test', 'jest', 'cypress', 'unit']
    }

    const topics = new Set<string>()
    messages.forEach(msg => {
      // For claude_chat_logs, combine user_query and claude_response
      const content = `${msg.user_query || ''} ${msg.claude_response || ''}`.toLowerCase()
      Object.entries(keywords).forEach(([topic, words]) => {
        if (words.some(word => content.includes(word))) {
          topics.add(topic)
        }
      })
    })

    return Array.from(topics)
  }

  return (
    <div className="space-y-6 p-6 max-w-4xl mx-auto">
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <Brain className="w-8 h-8 text-purple-500" />
            <div>
              <h2 className="text-2xl font-bold">Minimal AI Analysis</h2>
              <p className="text-sm text-muted-foreground">
                Analyze your data without database storage
              </p>
            </div>
          </div>
        </div>

        <Button
          onClick={runMinimalAnalysis}
          disabled={isAnalyzing || logsLoading}
          className="w-full"
        >
          {isAnalyzing ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-pulse" />
              Analyzing Your Data...
            </>
          ) : logsLoading ? (
            <>
              <Brain className="w-4 h-4 mr-2 animate-spin" />
              Loading Chat Data...
            </>
          ) : (
            <>
              <Play className="w-4 h-4 mr-2" />
              Run AI Analysis
            </>
          )}
        </Button>

        {analysisError && (
          <p className="text-sm text-red-600 mt-2">
            Analysis error: {analysisError}
          </p>
        )}
      </Card>

      {analysisResults && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-500" />
            Analysis Results (Session Only)
          </h3>
          
          <div className="space-y-4">
            {/* User Info */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-muted/30 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">User ID</p>
                <p className="font-mono text-sm">{analysisResults.user_id}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Analysis Time</p>
                <p className="text-sm">
                  {new Date(analysisResults.analysis_timestamp).toLocaleString()}
                </p>
              </div>
            </div>

            {/* Topics */}
            {analysisResults.topics_discussed && (
              <div>
                <p className="text-sm font-medium mb-2">Topics Discussed</p>
                <div className="flex gap-2 flex-wrap">
                  {analysisResults.topics_discussed.map((topic: string) => (
                    <Badge key={topic} variant="secondary">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Activity Level */}
            {analysisResults.activity_level && (
              <div>
                <p className="text-sm font-medium mb-2">Activity Level</p>
                <Badge
                  variant={
                    analysisResults.activity_level === 'High' ? 'default' :
                    analysisResults.activity_level === 'Medium' ? 'secondary' : 'outline'
                  }
                >
                  {analysisResults.activity_level}
                </Badge>
              </div>
            )}

            {/* Total Conversations */}
            {analysisResults.total_conversations !== undefined && (
              <div>
                <p className="text-sm font-medium mb-2">Total Conversations</p>
                <Badge variant="outline">
                  {analysisResults.total_conversations} conversations analyzed
                </Badge>
              </div>
            )}

            {/* AI Insights (if available) */}
            {analysisResults.ai_insights && (
              <div className="space-y-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-lg">
                <p className="text-sm font-medium">AI Insights</p>
                <p className="text-sm">{analysisResults.ai_insights.summary}</p>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Collaboration Score</p>
                    <p className="text-xl font-bold text-purple-600">
                      {analysisResults.ai_insights.collaboration_score}/10
                    </p>
                  </div>
                  {analysisResults.ai_insights.team_health_score && (
                    <div>
                      <p className="text-xs text-muted-foreground">Team Health Score</p>
                      <p className="text-xl font-bold text-green-600">
                        {analysisResults.ai_insights.team_health_score}/10
                      </p>
                    </div>
                  )}
                </div>

                {/* Recommendations */}
                {analysisResults.ai_insights.recommendations && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Recommendations</p>
                    <div className="space-y-1">
                      {analysisResults.ai_insights.recommendations.slice(0, 3).map((rec: string, index: number) => (
                        <p key={index} className="text-sm bg-white dark:bg-gray-800 p-2 rounded border-l-2 border-purple-500">
                          {rec}
                        </p>
                      ))}
                    </div>
                  </div>
                )}

                {/* Bottlenecks */}
                {analysisResults.ai_insights.bottlenecks && analysisResults.ai_insights.bottlenecks.length > 0 && (
                  <div>
                    <p className="text-xs text-muted-foreground mb-2">Identified Bottlenecks</p>
                    <div className="flex gap-1 flex-wrap">
                      {analysisResults.ai_insights.bottlenecks.map((bottleneck: string, index: number) => (
                        <Badge key={index} variant="destructive" className="text-xs">
                          {bottleneck}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Demo Mode Notice */}
            {analysisResults.demo_insights && (
              <div className="p-4 bg-yellow-50 dark:bg-yellow-950/20 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200 mb-2">
                  {analysisResults.demo_insights.message}
                </p>
                {analysisResults.demo_insights.sample_metrics && (
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-muted-foreground">Collaboration:</span>
                      <span className="ml-1 font-medium">
                        {analysisResults.demo_insights.sample_metrics.collaboration_score}/10
                      </span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Focus:</span>
                      <span className="ml-1 font-medium">
                        {analysisResults.demo_insights.sample_metrics.recent_focus}
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Error Message */}
            {analysisResults.error_message && (
              <div className="p-4 bg-red-50 dark:bg-red-950/20 rounded-lg">
                <p className="text-sm text-red-800 dark:text-red-200">
                  {analysisResults.error_message}
                </p>
              </div>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-muted-foreground">
                View Raw Data
              </summary>
              <pre className="mt-2 p-3 bg-muted rounded text-xs overflow-auto">
                {JSON.stringify(analysisResults, null, 2)}
              </pre>
            </details>
          </div>
        </Card>
      )}

      {/* Status Information */}
      <Card className="p-4 border-blue-200 bg-blue-50 dark:bg-blue-950/20">
        <div className="space-y-2">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            <strong>Analysis Status:</strong> {logsLoading ? 'Loading data...' :
              chatLogs && chatLogs.length > 0 ?
                `Ready - ${chatLogs.length} conversations available` :
                'No conversation data found - running in demo mode'}
          </p>
          {chatLogs && chatLogs.length > 0 && (
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Latest conversation: {new Date(chatLogs[0].interaction_timestamp).toLocaleString()}
            </p>
          )}
        </div>
      </Card>
    </div>
  )
}
