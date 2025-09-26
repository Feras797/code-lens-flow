import { useState, useEffect } from 'react'
import {
  Brain,
  Clock,
  Target,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  ArrowRight,
  FileCode,
  GitBranch,
  Lightbulb,
  Bug,
  Zap,
  Code,
  AlertTriangle,
  MessageSquare,
  Activity,
  Shield,
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
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { cn } from '@/lib/utils'
import type { DeveloperTask, DeveloperStatus } from '@/hooks/useRubeTeamStatus'
import type { ConversationData } from '@/services/simpleLLMAnalysis'

interface TaskInsights {
  problem_diagnosis: string
  root_cause_analysis: string[]
  suggested_solutions: string[]
  similar_issues: string[]
  estimated_complexity: 'low' | 'medium' | 'high' | 'critical'
  blockers: string[]
  dependencies: string[]
  resources: string[]
  next_actions: string[]
  time_estimate: string
  confidence: number
}

interface TaskDetailModalProps {
  task: DeveloperTask
  developer: DeveloperStatus
  conversations?: ConversationData[]
  onClose?: () => void
}

export function TaskDetailModal({ 
  task, 
  developer, 
  conversations = [],
  onClose 
}: TaskDetailModalProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [taskInsights, setTaskInsights] = useState<TaskInsights | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  // Analyze task when modal opens
  useEffect(() => {
    if (isOpen && !taskInsights && !isAnalyzing) {
      analyzeTask()
    }
  }, [isOpen])

  const analyzeTask = async () => {
    setIsAnalyzing(true)
    try {
      // Generate AI insights for the specific task
      const insights = await generateTaskInsights(task, developer, conversations)
      setTaskInsights(insights)
    } catch (error) {
      console.error('Failed to analyze task:', error)
      // Set fallback insights
      setTaskInsights(generateFallbackInsights(task))
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getStatusIcon = (status: DeveloperTask['status']) => {
    switch (status) {
      case 'high':
        return <AlertCircle className="w-4 h-4 text-purple-400" />
      case 'medium':
        return <AlertTriangle className="w-4 h-4 text-yellow-400" />
      case 'low':
        return <Activity className="w-4 h-4 text-green-400" />
    }
  }

  const getStatusColor = (status: DeveloperTask['status']) => {
    switch (status) {
      case 'high':
        return 'text-purple-400 bg-purple-500/20 border-purple-500/30'
      case 'medium':
        return 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30'
      case 'low':
        return 'text-green-400 bg-green-500/20 border-green-500/30'
    }
  }

  const getComplexityBadge = (complexity: TaskInsights['estimated_complexity']) => {
    const colors = {
      low: 'bg-green-500/20 text-green-300 border-green-500/30',
      medium: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
      high: 'bg-orange-500/20 text-orange-300 border-orange-500/30',
      critical: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[complexity]
  }

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open)
    if (!open && onClose) {
      onClose()
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <div
          className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-purple-600/50 transition-all duration-200 cursor-pointer group relative"
          onClick={(e) => {
            e.stopPropagation()
            setIsOpen(true)
          }}
        >
          <div className="flex items-start justify-between mb-2">
            <h4 className="text-sm font-medium text-white group-hover:text-purple-200 transition-colors">
              {task.title}
            </h4>
            <Badge
              variant="outline"
              className={cn("text-xs", getStatusColor(task.status))}
            >
              {task.status}
            </Badge>
          </div>
          <p className="text-xs text-gray-400 mb-3">{task.description}</p>
          <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
            <FileCode className="w-3 h-3" />
            <code className="font-mono">{task.filePath}</code>
          </div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1 text-gray-400">
                <Clock className="w-3 h-3" />
                <span className="text-xs">{task.timeSpent}</span>
              </div>
              {task.commits !== undefined && (
                <div className="flex items-center gap-1 text-gray-400">
                  <GitBranch className="w-3 h-3" />
                  <span className="text-xs">{task.commits}</span>
                </div>
              )}
            </div>
            <div className="flex items-center gap-2">
              {task.pullRequests !== undefined && task.pullRequests > 0 && (
                <Badge variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                  {task.pullRequests}
                </Badge>
              )}
            </div>
          </div>
          
          {/* Hover indicator */}
          <div className="absolute inset-0 rounded-lg bg-gradient-to-r from-purple-600/0 via-purple-600/5 to-purple-600/0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
          <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <p className="text-xs text-purple-400 flex items-center gap-1">
              <Brain className="w-3 h-3" />
              Click for AI analysis
            </p>
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-gray-900 border-gray-800">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl text-white flex items-center gap-2">
                {getStatusIcon(task.status)}
                {task.title}
              </DialogTitle>
              <DialogDescription className="text-gray-400 mt-2">
                {task.description}
              </DialogDescription>
              <div className="flex items-center gap-4 mt-3">
                <div className="flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-gray-500" />
                  <code className="font-mono text-sm text-gray-400">{task.filePath}</code>
                </div>
                <Badge variant="outline" className={cn("text-xs", getStatusColor(task.status))}>
                  Priority: {task.status}
                </Badge>
                {taskInsights && (
                  <Badge variant="outline" className={cn("text-xs", getComplexityBadge(taskInsights.estimated_complexity))}>
                    Complexity: {taskInsights.estimated_complexity}
                  </Badge>
                )}
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setTaskInsights(null)
                analyzeTask()
              }}
              disabled={isAnalyzing}
              className="text-purple-300 hover:text-purple-200 hover:bg-purple-900/50"
            >
              <Brain className="w-4 h-4 mr-1" />
              {isAnalyzing ? 'Analyzing...' : 'Refresh AI'}
            </Button>
          </div>
        </DialogHeader>

        <Separator className="my-4 border-gray-700" />

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-4 bg-gray-800">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="diagnosis">Diagnosis</TabsTrigger>
            <TabsTrigger value="solutions">Solutions</TabsTrigger>
            <TabsTrigger value="resources">Resources</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6 space-y-4">
            {/* Task Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    Time Spent
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{task.timeSpent}</p>
                  {taskInsights && (
                    <p className="text-xs text-gray-400 mt-1">
                      Estimated remaining: {taskInsights.time_estimate}
                    </p>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    Code Changes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-4">
                    <div>
                      <p className="text-2xl font-bold text-white">{task.commits || 0}</p>
                      <p className="text-xs text-gray-400">commits</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{task.pullRequests || 0}</p>
                      <p className="text-xs text-gray-400">PRs</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gray-800 border-gray-700">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                    <MessageSquare className="w-4 h-4" />
                    Activity
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-white">{task.messages || 0}</p>
                  <p className="text-xs text-gray-400">conversations</p>
                </CardContent>
              </Card>
            </div>

            {/* Developer Context */}
            <Card className="bg-gray-800 border-gray-700">
              <CardHeader className="pb-3">
                <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Developer Context
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Developer</span>
                  <span className="text-sm text-white">{developer.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Current Status</span>
                  <Badge variant="outline" className="text-xs">
                    {developer.status.replace('_', ' ')}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Total Tasks</span>
                  <span className="text-sm text-white">{developer.totalTasks}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm text-gray-400">Completed Tasks</span>
                  <span className="text-sm text-white">{developer.completedTasks}</span>
                </div>
              </CardContent>
            </Card>

            {/* AI Confidence */}
            {taskInsights && (
              <Card className="bg-purple-950/30 border-purple-800/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Analysis Confidence
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-4">
                    <Progress value={taskInsights.confidence * 100} className="flex-1" />
                    <span className="text-sm text-purple-200 font-medium">
                      {Math.round(taskInsights.confidence * 100)}%
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="diagnosis" className="mt-6 space-y-4">
            {isAnalyzing ? (
              <Card className="bg-purple-950/30 border-purple-800/30">
                <CardContent className="p-6">
                  <div className="flex flex-col items-center justify-center space-y-3">
                    <Brain className="w-8 h-8 text-purple-400 animate-pulse" />
                    <div className="text-center">
                      <h3 className="text-purple-300 font-medium mb-1">Analyzing Task</h3>
                      <p className="text-purple-200/70 text-sm">
                        Generating detailed diagnosis...
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : taskInsights ? (
              <>
                {/* Problem Diagnosis */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Bug className="w-4 h-4" />
                      Problem Diagnosis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-purple-100">{taskInsights.problem_diagnosis}</p>
                  </CardContent>
                </Card>

                {/* Root Cause Analysis */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Target className="w-4 h-4" />
                      Root Cause Analysis
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {taskInsights.root_cause_analysis.map((cause, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-5 h-5 rounded-full bg-purple-800 text-purple-200 text-xs flex items-center justify-center mt-0.5 flex-shrink-0">
                            {index + 1}
                          </div>
                          <p className="text-sm text-purple-100">{cause}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Blockers */}
                {taskInsights.blockers.length > 0 && (
                  <Card className="bg-red-950/30 border-red-800/30">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-red-300 flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        Blockers Identified
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {taskInsights.blockers.map((blocker, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <Shield className="w-4 h-4 text-red-400 mt-0.5 flex-shrink-0" />
                            <p className="text-sm text-red-100">{blocker}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Dependencies */}
                {taskInsights.dependencies.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <GitBranch className="w-4 h-4" />
                        Dependencies
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-1">
                        {taskInsights.dependencies.map((dep, index) => (
                          <p key={index} className="text-sm text-gray-100">{dep}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Brain className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No diagnosis available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="solutions" className="mt-6 space-y-4">
            {taskInsights ? (
              <>
                {/* Suggested Solutions */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Lightbulb className="w-4 h-4" />
                      Suggested Solutions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {taskInsights.suggested_solutions.map((solution, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                          <CheckCircle className="w-4 h-4 text-purple-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-100">{solution}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Next Actions */}
                <Card className="bg-purple-950/30 border-purple-800/30">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                      <Zap className="w-4 h-4" />
                      Immediate Next Actions
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {taskInsights.next_actions.map((action, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <ArrowRight className="w-3 h-3 text-purple-400 mt-0.5 flex-shrink-0" />
                          <p className="text-sm text-purple-100">{action}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Similar Issues */}
                {taskInsights.similar_issues.length > 0 && (
                  <Card className="bg-gray-800 border-gray-700">
                    <CardHeader className="pb-3">
                      <CardTitle className="text-sm font-medium text-gray-300 flex items-center gap-2">
                        <Code className="w-4 h-4" />
                        Similar Issues & Patterns
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {taskInsights.similar_issues.map((issue, index) => (
                          <p key={index} className="text-sm text-gray-100">• {issue}</p>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <Lightbulb className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No solutions available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="resources" className="mt-6 space-y-4">
            {taskInsights && taskInsights.resources.length > 0 ? (
              <Card className="bg-purple-950/30 border-purple-800/30">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium text-purple-300 flex items-center gap-2">
                    <FileCode className="w-4 h-4" />
                    Helpful Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {taskInsights.resources.map((resource, index) => (
                      <div key={index} className="p-3 bg-purple-900/20 rounded-lg border border-purple-700/30">
                        <p className="text-sm text-purple-100">{resource}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-gray-800 border-gray-700">
                <CardContent className="p-6 text-center">
                  <FileCode className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-400">No resources available</p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}

// Helper function to generate AI insights for the task
async function generateTaskInsights(
  task: DeveloperTask,
  developer: DeveloperStatus,
  conversations: ConversationData[]
): Promise<TaskInsights> {
  try {
    // Import the LLM service dynamically
    const { SimpleLLMAnalysis } = await import('@/services/simpleLLMAnalysis')
    const service = new SimpleLLMAnalysis()
    
    // Filter conversations related to this developer
    const relevantConversations = conversations.filter(c => c.user_id === developer.id)
    
    // Generate task-specific insights
    const taskContext = {
      title: task.title,
      description: task.description,
      status: task.status,
      timeSpent: task.timeSpent,
      filePath: task.filePath,
      commits: task.commits || 0,
      developerStatus: developer.status,
      conversations: relevantConversations.slice(0, 5) // Last 5 conversations for context
    }
    
    // Call LLM service to generate insights
    const insights = await service.analyzeTaskDetails(taskContext)
    
    return insights
  } catch (error) {
    console.error('Failed to generate task insights:', error)
    return generateFallbackInsights(task)
  }
}

// Fallback insights when AI analysis fails
function generateFallbackInsights(task: DeveloperTask): TaskInsights {
  const isError = task.title.toLowerCase().includes('error') || task.title.toLowerCase().includes('bug')
  const isProduction = task.title.toLowerCase().includes('prod')
  
  return {
    problem_diagnosis: isError 
      ? `The task "${task.title}" appears to be an error or bug that needs debugging.`
      : `The task "${task.title}" is currently in progress with ${task.status} priority.`,
    root_cause_analysis: isError ? [
      'Potential environment-specific configuration issues',
      'Possible missing dependencies or misconfigured services',
      'API endpoint or integration problems'
    ] : [
      'Task requires focused development time',
      'May involve complex implementation details'
    ],
    suggested_solutions: isError ? [
      'Check environment variables and configuration files',
      'Review recent deployments and changes',
      'Examine server logs for detailed error messages',
      'Test in staging environment first'
    ] : [
      'Break down the task into smaller subtasks',
      'Document progress and blockers regularly',
      'Seek peer review when needed'
    ],
    similar_issues: isProduction ? [
      'Production-only errors often relate to environment differences',
      'Check for missing environment variables or secrets',
      'Review database connection strings and API endpoints'
    ] : [],
    estimated_complexity: task.status === 'high' ? 'high' : task.status === 'medium' ? 'medium' : 'low',
    blockers: task.status === 'high' ? ['Requires immediate attention', 'May be blocking other work'] : [],
    dependencies: ['Related system components', 'Team member availability for review'],
    resources: [
      'Check documentation for similar implementations',
      'Review team knowledge base',
      'Consult with team members who have worked on similar features'
    ],
    next_actions: [
      'Continue investigating the root cause',
      'Document findings and progress',
      'Update task status when blockers are resolved'
    ],
    time_estimate: task.status === 'high' ? '2-4 hours' : '1-2 hours',
    confidence: 0.6
  }
}

