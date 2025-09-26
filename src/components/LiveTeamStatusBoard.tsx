import { useState, useEffect } from 'react'
import {
  Users,
  Clock,
  MessageSquare,
  AlertCircle,
  GitBranch,
  FileCode,
  Zap,
  AlertTriangle,
  CheckCircle,
  RefreshCw,
  Circle,
  Brain,
  Toggle
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Progress } from '@/components/ui/progress'
import { Switch } from '@/components/ui/switch'
import { cn } from '@/lib/utils'
import { useRubeTeamStatus, type DeveloperStatus, type DeveloperTask } from '@/hooks/useRubeTeamStatus'
import { useLLMToggle } from '@/hooks/useSimpleLLMAnalysis'

export function LiveTeamStatusBoard() {
  const [autoRefresh, setAutoRefresh] = useState(true)
  const { llmEnabled, setLLMEnabled, showLLMInsights, setShowLLMInsights } = useLLMToggle(false)

  const { teamStatus, isLoading, error, lastUpdated, refresh, isLLMAnalyzing } = useRubeTeamStatus(llmEnabled)

  // Auto-refresh effect
  useEffect(() => {
    if (!autoRefresh) return

    const interval = setInterval(() => {
      refresh()
    }, 30000) // Refresh every 30 seconds

    return () => clearInterval(interval)
  }, [autoRefresh, refresh])

  const getStatusIcon = (status: DeveloperStatus['status']) => {
    switch (status) {
      case 'flow':
        return <Circle className="w-3 h-3 fill-green-500 text-green-500" />
      case 'problem_solving':
        return <Circle className="w-3 h-3 fill-yellow-500 text-yellow-500" />
      case 'blocked':
        return <Circle className="w-3 h-3 fill-red-500 text-red-500" />
      case 'idle':
        return <Circle className="w-3 h-3 fill-gray-500 text-gray-500" />
    }
  }

  const getStatusLabel = (status: DeveloperStatus['status']) => {
    switch (status) {
      case 'flow':
        return { text: 'IN FLOW', className: 'text-green-400' }
      case 'problem_solving':
        return { text: 'PROBLEM SOLVING', className: 'text-yellow-400' }
      case 'blocked':
        return { text: 'BLOCKED', className: 'text-red-400' }
      case 'idle':
        return { text: 'IDLE', className: 'text-gray-400' }
    }
  }

  const getTaskStatusBadge = (status: DeveloperTask['status']) => {
    switch (status) {
      case 'high':
        return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'medium':
        return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      case 'low':
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  const formatTimeAgo = (date: Date): string => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`
    return `${Math.floor(seconds / 86400)} days ago`
  }

  // Show loading state
  if (isLoading && teamStatus.length === 0) {
    return (
      <div className="p-6 space-y-6 bg-black min-h-screen">
        <div className="flex items-center justify-center">
          <div className="text-white">
            <RefreshCw className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p>Loading team status data...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 bg-black min-h-screen">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Live Team Status Board</h1>
          <p className="text-gray-400">
            Real-time visibility into what every developer is working on, extracted from Claude Code conversations
          </p>
          {error && (
            <div className="mt-2 text-red-400 text-sm flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Error: {error} (Using cached data)
            </div>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* LLM Analysis Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700">
            <Brain className="h-4 w-4 text-purple-400" />
            <span className="text-sm text-gray-300">LLM Analysis</span>
            <Switch
              checked={llmEnabled}
              onCheckedChange={setLLMEnabled}
              className="data-[state=checked]:bg-purple-600"
            />
            {isLLMAnalyzing && (
              <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse" />
            )}
          </div>

          {/* LLM Insights Toggle */}
          {llmEnabled && (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-800 rounded-md border border-gray-700">
              <span className="text-xs text-gray-400">Show Insights</span>
              <Switch
                checked={showLLMInsights}
                onCheckedChange={setShowLLMInsights}
                size="sm"
              />
            </div>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={refresh}
            className="gap-2"
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>
          <Button
            variant={autoRefresh ? 'default' : 'outline'}
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", autoRefresh && "animate-spin")} />
            {autoRefresh ? 'Auto-refresh' : 'Paused'}
          </Button>
        </div>
      </div>

      {/* Team Status Summary */}
      <div className="bg-gray-900 rounded-lg p-4 border border-gray-800">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-white">
              TEAM STATUS - Code Lens Flow Project
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              {teamStatus.length} active developers •
              {teamStatus.filter(dev => dev.status === 'flow').length} in flow •
              {teamStatus.filter(dev => dev.status === 'problem_solving').length} problem solving •
              {teamStatus.filter(dev => dev.status === 'blocked').length} blocked
              {llmEnabled && (
                <span className="text-purple-400 ml-2">
                  • AI Enhanced ({teamStatus.filter(dev => dev.llmInsights).length} analyzed)
                </span>
              )}
            </p>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              {getStatusIcon('flow')}
              <span className="text-sm text-gray-400">Flow State</span>
              <span className="text-sm text-white">Quick solutions, steady progress</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon('problem_solving')}
              <span className="text-sm text-gray-400">Problem Solving</span>
              <span className="text-sm text-white">Multiple iterations, debugging</span>
            </div>
            <div className="flex items-center gap-2">
              {getStatusIcon('blocked')}
              <span className="text-sm text-gray-400">Blocked</span>
              <span className="text-sm text-white">Extended time, needs help</span>
            </div>
          </div>
        </div>
      </div>

      {/* Developer Cards */}
      {teamStatus.map((developer) => (
        <Card key={developer.id} className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={developer.avatar} />
                  <AvatarFallback className="bg-gray-800 text-white">
                    {developer.initials}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-white">{developer.name}</h3>
                    {getStatusIcon(developer.status)}
                    <span className={cn("text-xs font-medium", getStatusLabel(developer.status).className)}>
                      {getStatusLabel(developer.status).text}
                    </span>
                    {/* LLM Enhancement Indicator */}
                    {llmEnabled && developer.llmInsights && (
                      <div className="flex items-center gap-1">
                        <Brain className="w-3 h-3 text-purple-400" />
                        <span className="text-xs text-purple-300">
                          {Math.round(developer.llmInsights.confidence * 100)}%
                        </span>
                      </div>
                    )}
                  </div>
                  <p className="text-sm text-gray-400 mt-1">{developer.statusMessage}</p>

                  {/* LLM Insights Display */}
                  {llmEnabled && showLLMInsights && developer.llmInsights && (
                    <div className="mt-3 p-3 bg-purple-950/30 border border-purple-800/30 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-purple-300">AI Insights</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs bg-purple-900/50 text-purple-200 border-purple-700">
                            {developer.llmInsights.mood}
                          </Badge>
                          <Badge variant="outline" className="text-xs bg-purple-900/50 text-purple-200 border-purple-700">
                            {developer.llmInsights.productivity}
                          </Badge>
                        </div>
                      </div>

                      {developer.llmInsights.keyTopics.length > 0 && (
                        <div className="mb-2">
                          <p className="text-xs text-gray-400 mb-1">Key Topics:</p>
                          <div className="flex gap-1 flex-wrap">
                            {developer.llmInsights.keyTopics.map((topic, index) => (
                              <Badge key={index} variant="secondary" className="text-xs bg-gray-800 text-gray-300">
                                {topic}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {developer.llmInsights.recommendations && developer.llmInsights.recommendations.length > 0 && (
                        <div>
                          <p className="text-xs text-gray-400 mb-1">Recommendations:</p>
                          <p className="text-xs text-purple-200">
                            {developer.llmInsights.recommendations[0]}
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2 text-gray-400">
                  <MessageSquare className="w-4 h-4" />
                  <span className="text-sm">{developer.completedTasks}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <GitBranch className="w-4 h-4" />
                  <span className="text-sm">{developer.totalTasks}</span>
                </div>
                <div className="text-sm text-gray-500">
                  {developer.completedTasks} tasks
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              {developer.currentTasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-gray-800 rounded-lg p-4 border border-gray-700 hover:border-gray-600 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <h4 className="text-sm font-medium text-white">{task.title}</h4>
                    <Badge 
                      variant="outline" 
                      className={cn("text-xs", getTaskStatusBadge(task.status))}
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
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Last Updated */}
      <div className="text-center text-xs text-gray-500">
        Last updated {formatTimeAgo(lastUpdated)}
      </div>
    </div>
  )
}
