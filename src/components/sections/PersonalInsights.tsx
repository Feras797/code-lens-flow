import React, { memo, useCallback } from 'react'
import { Clock, ChevronRight, Calendar, ChevronDown, ChevronUp, Brain, Sparkles, RefreshCw, AlertCircle } from 'lucide-react'
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useStablePersonalInsights } from '@/hooks/useStablePersonalInsights'
import { AIAnalysisCard } from '@/components/AIAnalysisCard'
import { StableDevelopmentTimeline } from '@/components/StableDevelopmentTimeline'

interface PersonalInsightsProps {
  userId?: string;
  projectId?: string;
}

// Memoized component to prevent unnecessary re-renders
export const PersonalInsights = memo(function PersonalInsights({
  userId = 'e3b41869-1444-4bf0-a625-90b0f1d1dffb',
  projectId = 'GoonerSquad'
}: PersonalInsightsProps) {
  const { toast } = useToast()

  // Use stable personal insights hook
  const {
    currentProfile,
    todaysSummary,
    llmAnalysis,
    isLoading,
    isAnalyzing,
    error,
    lastRefresh,
    expandedSections,
    autoRefresh,
    userLogs,
    refresh,
    runLLMAnalysis,
    toggleExpandedSection,
    setAutoRefresh,
    formatTimeAgo
  } = useStablePersonalInsights({
    userId,
    projectId,
    enableLLM: false,
    autoRefresh: false
  })

  // Handle analysis with toast notification (stable with useCallback)
  const handleAnalysisClick = useCallback(async () => {
    try {
      await runLLMAnalysis()
      toast({
        title: "Analysis Complete",
        description: "Your development insights have been updated with the latest AI analysis.",
      })
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: `Failed to complete analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      })
    }
  }, [runLLMAnalysis, toast])



  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
            Personal Development Insights
            {currentProfile && <Brain className="w-6 h-6 text-purple-400" />}
          </h1>
          <p className="text-muted-foreground mt-1">
            Transform chat history into actionable understanding of your coding journey
          </p>
          {lastRefresh && (
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              Last analyzed: {formatTimeAgo(lastRefresh)}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Auto Refresh Toggle */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-background rounded-md border border-border">
            <span className="text-xs text-muted-foreground">Auto Refresh</span>
            <Switch
              checked={autoRefresh}
              onCheckedChange={setAutoRefresh}
              className="data-[state=checked]:bg-blue-600"
            />
          </div>

          {isLoading && (
            <div className="text-muted-foreground text-sm flex items-center gap-2">
              <RefreshCw className="h-4 w-4 animate-spin" />
              Loading data...
            </div>
          )}

          <Button
            onClick={refresh}
            disabled={isLoading}
            variant="outline"
            size="sm"
            className="gap-2"
          >
            <RefreshCw className={cn("h-4 w-4", isLoading && "animate-spin")} />
            Refresh
          </Button>

          <Button
            onClick={handleAnalysisClick}
            disabled={isAnalyzing}
            variant="default"
            className="bg-purple-600 hover:bg-purple-700 border border-purple-500/60 text-white"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run AI Analysis
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="space-y-6">

        {/* Today's Development Recap */}
        <div className="bg-card border border-border rounded-xl overflow-hidden">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5 text-muted-foreground" />
                <h2 className="text-lg font-semibold text-foreground">Today's Development Recap</h2>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {todaysSummary.quickStats.map((stat, index) => (
                  <Badge
                    key={`${stat.label}-${index}`}
                    variant="outline"
                    className="text-xs bg-background/50 text-muted-foreground border-border"
                  >
                    {stat.label}: {stat.value}
                  </Badge>
                ))}
                {currentProfile && (
                  <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
                    AI Analyzed
                  </Badge>
                )}
              </div>
            </div>

            <div className="space-y-4">
              {/* Morning Section */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                  onClick={() => toggleExpandedSection('morning')}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-background/50 text-muted-foreground border-border">
                      Morning
                    </Badge>
                    <span className="text-xs text-muted-foreground">09:30 - 12:00</span>
                  </div>
                  {expandedSections.has('morning') ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {expandedSections.has('morning') && (
                  <div className="ml-6 space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {todaysSummary.morning}
                    </p>
                  </div>
                )}
              </div>

              {/* Afternoon Section */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                  onClick={() => toggleExpandedSection('afternoon')}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-background/50 text-muted-foreground border-border">
                      Afternoon
                    </Badge>
                    <span className="text-xs text-muted-foreground">13:00 - 17:30</span>
                  </div>
                  {expandedSections.has('afternoon') ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {expandedSections.has('afternoon') && (
                  <div className="ml-6 space-y-2">
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {todaysSummary.afternoon}
                    </p>
                  </div>
                )}
              </div>

              {/* Key Decisions Section */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                  onClick={() => toggleExpandedSection('decisions')}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-background/50 text-muted-foreground border-border">
                      Key Decisions
                    </Badge>
                    <span className="text-xs text-muted-foreground">{todaysSummary.keyDecisions.length} decisions</span>
                  </div>
                  {expandedSections.has('decisions') ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {expandedSections.has('decisions') && (
                  <div className="ml-6 space-y-2">
                    {todaysSummary.keyDecisions.length > 0 ? (
                      todaysSummary.keyDecisions.map((decision, index) => (
                        <div key={index} className="flex items-start gap-2 p-3 rounded-lg bg-background/50 border border-border">
                          <ChevronRight className="w-3 h-3 text-muted-foreground mt-0.5 flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{decision}</span>
                        </div>
                      ))
                    ) : (
                      <div className="flex items-center justify-center py-4">
                        <span className="text-sm text-muted-foreground">No key decisions identified today</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Abandoned Section */}
              <div className="space-y-3">
                <div
                  className="flex items-center justify-between p-3 border border-border rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                  onClick={() => toggleExpandedSection('nextFocus')}
                >
                  <div className="flex items-center gap-3">
                    <Badge variant="outline" className="text-xs bg-background/50 text-muted-foreground border-border">
                      Next Focus
                    </Badge>
                    <span className="text-xs text-muted-foreground">Learning opportunity</span>
                  </div>
                  {expandedSections.has('nextFocus') ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
                {expandedSections.has('nextFocus') && (
                  <div className="ml-6">
                    <div className="p-3 rounded-lg bg-background/50 border border-border">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {todaysSummary.nextFocus}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* AI Development Profile - Using stable component */}
        {(currentProfile || llmAnalysis?.digest) && (
          <AIAnalysisCard
            profile={currentProfile}
            llmDigest={llmAnalysis?.digest}
            className="bg-card"
          />
        )}

        {/* Development Timeline - Using stable component */}
        <StableDevelopmentTimeline
          userId={userId}
          projectId={projectId}
          className="bg-card"
        />

        {/* Error States */}
        {error && (
          <div className="bg-card border border-red-500/20 rounded-xl p-6">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-400 mt-0.5 flex-shrink-0" />
              <div>
                <h4 className="text-sm font-medium text-red-400 mb-1">Error</h4>
                <p className="text-xs text-muted-foreground">{error}</p>
              </div>
            </div>
          </div>
        )}

        {/* No Data State */}
        {!isLoading && !currentProfile && userLogs?.length === 0 && (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Brain className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-xl font-semibold text-foreground mb-2">Welcome to Personal Insights</h3>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Start using Claude Code to get AI-powered insights about your development patterns,
              learning trajectory, and collaboration style.
            </p>
            <Button onClick={handleAnalysisClick} className="bg-purple-600 hover:bg-purple-700">
              <Sparkles className="w-4 h-4 mr-2" />
              Get Started
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})
