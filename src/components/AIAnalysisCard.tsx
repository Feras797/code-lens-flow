import React, { memo } from 'react'
import { Brain, Sparkles, Target, TrendingUp, MessageSquare, Zap } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import type { DeveloperProfile } from '@/types/analysis'

interface AIAnalysisCardProps {
  profile: DeveloperProfile | null
  llmDigest: any | null
  className?: string
}

export const AIAnalysisCard = memo(function AIAnalysisCard({
  profile,
  llmDigest,
  className
}: AIAnalysisCardProps) {
  // If no data, show empty state
  if (!profile && !llmDigest) {
    return (
      <Card className={cn('p-6', className)}>
        <div className="text-center">
          <Brain className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">AI Analysis Not Available</h3>
          <p className="text-sm text-muted-foreground">
            Enable AI analysis to get insights about your development patterns
          </p>
        </div>
      </Card>
    )
  }

  // Use llmDigest data if available, otherwise fall back to profile
  const displayData = llmDigest || profile

  return (
    <Card className={cn('overflow-hidden', className)}>
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-purple-400" />
            <h2 className="text-lg font-semibold text-foreground">AI Development Profile</h2>
          </div>
          <Badge variant="outline" className="text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
            LLM Generated
          </Badge>
        </div>

        {/* Scores Section */}
        {profile && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <ScoreCard
              label="Collaboration Score"
              value={profile.collaboration_score}
              color="purple"
            />
            <ScoreCard
              label="Mentoring Potential"
              value={profile.mentoring_potential}
              color="blue"
            />
          </div>
        )}

        {/* Insights Sections */}
        <div className="space-y-4">
          {/* Expertise Areas */}
          {profile?.expertise_areas && profile.expertise_areas.length > 0 && (
            <InsightSection
              icon={<Zap className="w-4 h-4 text-yellow-400" />}
              title="Expertise Areas"
            >
              <div className="flex flex-wrap gap-2">
                {profile.expertise_areas.slice(0, 8).map((area, index) => (
                  <Badge
                    key={index}
                    variant="outline"
                    className="text-xs bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
                  >
                    {area}
                  </Badge>
                ))}
              </div>
            </InsightSection>
          )}

          {/* Learning Trajectory */}
          {(llmDigest?.learning_trajectory || profile?.learning_trajectory) && (
            <InsightSection
              icon={<TrendingUp className="w-4 h-4 text-green-400" />}
              title="Learning Trajectory"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {llmDigest?.learning_trajectory || profile?.learning_trajectory}
              </p>
            </InsightSection>
          )}

          {/* Communication Style */}
          {(llmDigest?.collaboration_patterns || profile?.communication_style) && (
            <InsightSection
              icon={<MessageSquare className="w-4 h-4 text-blue-400" />}
              title="Communication Style"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {llmDigest?.collaboration_patterns || profile?.communication_style}
              </p>
            </InsightSection>
          )}

          {/* Growth Areas */}
          {(llmDigest?.growth_areas || profile?.growth_areas) &&
           (llmDigest?.growth_areas?.length > 0 || profile?.growth_areas?.length > 0) && (
            <InsightSection
              icon={<Target className="w-4 h-4 text-orange-400" />}
              title="Growth Opportunities"
            >
              <div className="space-y-2">
                {(llmDigest?.growth_areas || profile?.growth_areas || []).slice(0, 3).map((area: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                    {area}
                  </div>
                ))}
              </div>
            </InsightSection>
          )}

          {/* Recent Focus from LLM Digest */}
          {llmDigest?.recent_focus && (
            <InsightSection
              icon={<Sparkles className="w-4 h-4 text-purple-400" />}
              title="Recent Focus"
            >
              <p className="text-sm text-muted-foreground leading-relaxed">
                {llmDigest.recent_focus}
              </p>
            </InsightSection>
          )}

          {/* Key Learnings */}
          {llmDigest?.key_learnings && llmDigest.key_learnings.length > 0 && (
            <InsightSection
              icon={<Brain className="w-4 h-4 text-indigo-400" />}
              title="Key Learnings"
            >
              <div className="space-y-1">
                {llmDigest.key_learnings.map((learning: string, index: number) => (
                  <div key={index} className="flex items-start gap-2 text-sm text-muted-foreground">
                    <div className="w-1.5 h-1.5 rounded-full bg-indigo-400 mt-2 flex-shrink-0" />
                    {learning}
                  </div>
                ))}
              </div>
            </InsightSection>
          )}

          {/* Momentum Indicator */}
          {llmDigest?.current_momentum && (
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm font-medium text-foreground">Development Momentum</span>
              <Badge
                variant="outline"
                className={cn(
                  'text-xs',
                  llmDigest.current_momentum === 'high'
                    ? 'bg-green-500/10 text-green-400 border-green-500/20'
                    : llmDigest.current_momentum === 'medium'
                    ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20'
                    : 'bg-gray-500/10 text-gray-400 border-gray-500/20'
                )}
              >
                {llmDigest.current_momentum}
              </Badge>
            </div>
          )}

          {/* Confidence Score */}
          {llmDigest?.confidence_score !== undefined && (
            <div className="flex items-center justify-between p-3 bg-background/50 rounded-lg border border-border">
              <span className="text-sm font-medium text-foreground">Analysis Confidence</span>
              <div className="flex items-center gap-2">
                <Progress value={llmDigest.confidence_score * 100} className="w-20 h-2" />
                <span className="text-xs text-muted-foreground">
                  {Math.round(llmDigest.confidence_score * 100)}%
                </span>
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
})

// Sub-components
const ScoreCard = memo(function ScoreCard({
  label,
  value,
  color
}: {
  label: string
  value: number
  color: 'purple' | 'blue'
}) {
  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500'
  }

  return (
    <div className="p-4 border border-border rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-foreground">{label}</span>
        <Badge variant="outline" className="text-xs">
          {value}/10
        </Badge>
      </div>
      <div className="w-full bg-background rounded-full h-2">
        <div
          className={cn('h-2 rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${value * 10}%` }}
        />
      </div>
    </div>
  )
})

const InsightSection = memo(function InsightSection({
  icon,
  title,
  children
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
}) {
  return (
    <div>
      <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
        {icon}
        {title}
      </h4>
      {children}
    </div>
  )
})