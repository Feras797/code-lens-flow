import { useState, useEffect } from 'react'
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  Users,
  CheckCircle,
  ArrowRight,
  MessageSquare,
  FileCode,
  GitBranch,
  Lightbulb,
  Calendar,
  X
} from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useSimpleLLMAnalysis } from '@/hooks/useSimpleLLMAnalysis'
import type { DeveloperStatus, DeveloperTask } from '@/hooks/useRubeTeamStatus'
import type { DetailedLLMInsights, ConversationData } from '@/services/simpleLLMAnalysis'

interface DeveloperDetailModalProps {
  developer: DeveloperStatus
  conversations: ConversationData[]
  trigger: React.ReactNode
}

export function DeveloperDetailModal({ developer, conversations, trigger }: DeveloperDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [detailedInsights, setDetailedInsights] = useState<DetailedLLMInsights | null>(null)
  const [isLoadingInsights, setIsLoadingInsights] = useState(false)

  const { analyzeConversations } = useSimpleLLMAnalysis()

  // Load detailed insights when modal opens
  useEffect(() => {
    if (isOpen && !detailedInsights && !isLoadingInsights) {
      loadDetailedInsights()
    }
  }, [isOpen])

  const loadDetailedInsights = async () => {
    setIsLoadingInsights(true)
    try {
      // Filter conversations for this developer
      const userConversations = conversations.filter(conv => conv.user_id === developer.id)

      if (userConversations.length === 0) {
        // Create a basic insight when no conversations available
        setDetailedInsights({
          user_id: developer.id,
          analysis_timestamp: new Date().toISOString(),
          current_focus: developer.statusMessage || 'Development work in progress',
          progress_assessment: `Currently showing as ${developer.status.replace('_', ' ')} with ${developer.totalTasks} total tasks`,
          suggestions: ['Enable LLM analysis for deeper insights', 'Engage more with AI assistant for better tracking'],
          next_steps: ['Continue current work', 'Document progress'],
          collaboration_opportunities: ['Available for team discussions'],
          time_management_insights: 'Limited conversation data available for detailed time analysis',
          conversation_summary: `Developer has ${developer.currentTasks.length} active tasks but limited conversation history`,
          confidence: 0.3
        })
      } else {
        // Generate detailed insights using LLM service
        const { SimpleLLMAnalysis } = await import('@/services/simpleLLMAnalysis')
        const service = new SimpleLLMAnalysis()
        const insights = await service.generateDetailedInsights(developer.id, userConversations)
        setDetailedInsights(insights)
      }
    } catch (error) {
      console.error('Failed to load detailed insights:', error)
      // Create fallback insights on error
      setDetailedInsights({
        user_id: developer.id,
        analysis_timestamp: new Date().toISOString(),
        current_focus: developer.statusMessage || 'Unable to analyze focus',
        progress_assessment: 'Analysis temporarily unavailable',
        suggestions: ['Try refreshing the analysis', 'Ensure LLM service is configured'],
        next_steps: ['Check system status', 'Contact support if issues persist'],
        collaboration_opportunities: ['Manual coordination recommended'],
        time_management_insights: 'Insights unavailable due to analysis error',
        conversation_summary: 'Unable to analyze recent conversations',
        confidence: 0.1
      })
    } finally {
      setIsLoadingInsights(false)
    }
  }

  const getStatusColor = (status: DeveloperStatus['status']) => {
    switch (status) {
      case 'flow': return 'text-green-400'
      case 'problem_solving': return 'text-yellow-400'
      case 'blocked': return 'text-red-400'
      case 'idle': return 'text-gray-400'
    }
  }

  const getStatusBg = (status: DeveloperStatus['status']) => {
    switch (status) {
      case 'flow': return 'bg-green-500/20 border-green-500/30'
      case 'problem_solving': return 'bg-yellow-500/20 border-yellow-500/30'
      case 'blocked': return 'bg-red-500/20 border-red-500/30'
      case 'idle': return 'bg-gray-500/20 border-gray-500/30'
    }
  }

  const formatTimeAgo = (timestamp: string) => {
    const date = new Date(timestamp)
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-12 w-12">
                <AvatarImage src={developer.avatar} />
                <AvatarFallback className="bg-gray-800 text-white text-lg">
                  {developer.initials}
                </AvatarFallback>
              </Avatar>
              <div>
                <DialogTitle className="text-xl text-white flex items-center gap-2">
                  {developer.name}
                  {developer.llmInsights && (
                    <Brain className="w-4 h-4 text-purple-400" />
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDetailedInsights(null)
                      loadDetailedInsights()
                    }}
                    disabled={isLoadingInsights}
                    className="ml-auto text-xs text-purple-300 hover:text-purple-200 hover:bg-purple-900/50"
                  >
                    <Brain className="w-3 h-3 mr-1" />
                    {isLoadingInsights ? 'Analyzing...' : 'Refresh AI'}
                  </Button>
                </DialogTitle>
                <DialogDescription className={cn("font-medium", getStatusColor(developer.status))}>
                  {developer.statusMessage}
                </DialogDescription>
              </div>
            </div>
            <div className={cn("px-3 py-1 rounded-full border", getStatusBg(developer.status))}>
              <span className={cn("text-sm font-medium", getStatusColor(developer.status))}>
                {developer.status.toUpperCase().replace('_', ' ')}
              </span>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
          {/* Left Column - Overview */}
          <div className="space-y-4">
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Tasks</span>
                  <span className="text-sm text-white">{developer.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Completed</span>
                  <span className="text-sm text-white">{developer.completedTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Active Tasks</span>
                  <span className="text-sm text-white">{developer.currentTasks.length}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Last Active</span>
                  <span className="text-sm text-white">
                    {developer.lastActive ? formatTimeAgo(developer.lastActive) : 'N/A'}
                  </span>
                </div>
                <Progress
                  value={(developer.completedTasks / Math.max(developer.totalTasks, 1)) * 100}
                  className="h-2"
                />
              </CardContent>
            </Card>

            {/* Current Tasks */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <FileCode className="w-4 h-4" />
                  Current Tasks
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {developer.currentTasks.map((task) => (
                  <div key={task.id} className="p-3 bg-gray-700 rounded border border-gray-600">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-xs font-medium text-white">{task.title}</h4>
                      <Badge variant="outline" className="text-xs">
                        {task.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-400 mb-2">{task.description}</p>
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {task.timeSpent}
                      </span>
                      <span className="font-mono">{task.filePath}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Middle Column - AI Insights */}
          <div className="lg:col-span-2">
            {isLoadingInsights ? (
              <div className="space-y-4">
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardContent className="p-6">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                      <div className="text-center">
                        <h3 className="text-purple-300 font-medium mb-1">Generating AI Insights</h3>
                        <p className="text-purple-200/70 text-sm">
                          Analyzing {conversations.filter(c => c.user_id === developer.id).length} conversations...
                        </p>
                      </div>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : detailedInsights ? (
              <div className="space-y-4">
                {/* Current Focus */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Current Focus
                      <Badge variant="outline" className="ml-auto text-xs bg-purple-900/50 text-purple-200 border-purple-700">
                        {Math.round(detailedInsights.confidence * 100)}% confidence
                      </Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-100">{detailedInsights.current_focus}</p>
                  </CardContent>
                </Card>

                {/* Progress Assessment */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4" />
                      Progress Assessment
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-100">{detailedInsights.progress_assessment}</p>
                  </CardContent>
                </Card>

                {/* Suggestions */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Suggestions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {detailedInsights.suggestions.map((suggestion, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-100">{suggestion}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Steps */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Next Steps
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {detailedInsights.next_steps.map((step, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-800 text-purple-200 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm text-purple-100">{step}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Collaboration & Time Management */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="bg-purple-950/30 border-purple-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                        <Users className="w-4 h-4" />
                        Collaboration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {detailedInsights.collaboration_opportunities.map((opp, index) => (
                          <p key={index} className="text-xs text-purple-100">{opp}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-purple-950/30 border-purple-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                        <Clock className="w-4 h-4" />
                        Time Management
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-xs text-purple-100">{detailedInsights.time_management_insights}</p>
                    </CardContent>
                  </Card>
                </div>

                {/* Conversation Summary */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4" />
                      Recent Activity Summary
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-100">{detailedInsights.conversation_summary}</p>
                    <div className="mt-3 text-xs text-purple-300 flex items-center gap-2">
                      <Calendar className="w-3 h-3" />
                      Analysis generated: {formatTimeAgo(detailedInsights.analysis_timestamp)}
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No detailed insights available</p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-2"
                    onClick={loadDetailedInsights}
                  >
                    Generate Insights
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}