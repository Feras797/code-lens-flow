import { useState, useEffect } from 'react';
import { Brain, Sparkles, TrendingUp, AlertCircle, Clock, Target, Zap, BookOpen, MessageSquare } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/use-toast";
import { useDeveloperProfileAnalysis, useTeamHealthAnalysis } from '@/hooks/useTeamAnalysis';
import { useLatestDeveloperProfiles, useLatestTeamInsights } from '@/hooks/useSupabase';
import type { DeveloperProfile, TeamInsight } from '@/types/analysis';

interface AIPersonalInsightsProps {
  userId?: string;
  projectId?: string;
}

export function AIPersonalInsights({ userId = 'e3b41869-1444-4bf0-a625-90b0f1d1dffb', projectId = 'GoonerSquad' }: AIPersonalInsightsProps) {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [lastAnalysisTime, setLastAnalysisTime] = useState<string | null>(null);

  const { toast } = useToast();
  const { analyzeDeveloperProfile, isLoading: isProfileLoading, error: profileError } = useDeveloperProfileAnalysis();
  const { analyzeTeamHealth, isLoading: isTeamLoading, error: teamError } = useTeamHealthAnalysis();

  // Fetch existing analysis results
  const { data: existingProfiles, isLoading: profilesLoading } = useLatestDeveloperProfiles(userId);
  const { data: teamInsights, isLoading: insightsLoading } = useLatestTeamInsights(projectId);

  const [currentProfile, setCurrentProfile] = useState<DeveloperProfile | null>(null);
  const [currentTeamInsight, setCurrentTeamInsight] = useState<TeamInsight | null>(null);

  useEffect(() => {
    if (existingProfiles && existingProfiles.length > 0) {
      setCurrentProfile(existingProfiles[0]);
    }
  }, [existingProfiles]);

  useEffect(() => {
    if (teamInsights && teamInsights.length > 0) {
      setCurrentTeamInsight(teamInsights[0]);
    }
  }, [teamInsights]);

  const runNewAnalysis = async () => {
    setIsAnalyzing(true);
    setAnalysisProgress(0);

    try {
      // Simulate progress
      setAnalysisProgress(20);

      // Run developer profile analysis
      const profileResult = await analyzeDeveloperProfile({
        user_id: userId,
        project_id: projectId,
        analysis_type: 'developer_profile',
        conversation_limit: 50,
        time_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      });

      setAnalysisProgress(60);

      // Run team health analysis
      const teamResult = await analyzeTeamHealth({
        project_id: projectId,
        analysis_type: 'team_health',
        conversation_limit: 100,
        time_range: {
          start_date: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      });

      setAnalysisProgress(100);

      if (profileResult) {
        setCurrentProfile(profileResult);
      }

      if (teamResult) {
        setCurrentTeamInsight(teamResult);
      }

      setLastAnalysisTime(new Date().toLocaleString());

      toast({
        title: "Analysis Complete",
        description: "Your development insights have been updated with the latest AI analysis.",
      });

    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: `Failed to complete analysis: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    } finally {
      setIsAnalyzing(false);
      setAnalysisProgress(0);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 8) return 'text-status-flow';
    if (score >= 6) return 'text-status-slow';
    return 'text-status-blocked';
  };

  const getScoreBadgeVariant = (score: number) => {
    if (score >= 8) return 'default';
    if (score >= 6) return 'secondary';
    return 'outline';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* AI-Enhanced Header */}
      <StealthCard className="p-6 relative overflow-hidden border border-card-border/50" variant="glass">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-blue-500/5 to-transparent" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
              <Brain className="w-6 h-6 text-purple-400" />
            </div>
            <div>
              <h2 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                AI-Powered Development Insights
                <Sparkles className="w-5 h-5 text-purple-400" />
              </h2>
              <p className="text-sm text-foreground-muted mt-0.5">
                LangChain analysis of your coding conversations and team dynamics
              </p>
              {lastAnalysisTime && (
                <p className="text-xs text-foreground-subtle mt-1 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Last updated: {lastAnalysisTime}
                </p>
              )}
            </div>
          </div>

          <Button
            onClick={runNewAnalysis}
            disabled={isAnalyzing || isProfileLoading || isTeamLoading}
            variant="outline"
            className="bg-gradient-to-r from-purple-500/10 to-blue-500/10 border-purple-500/30 hover:from-purple-500/20 hover:to-blue-500/20"
          >
            {isAnalyzing ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 mr-2" />
                Run New Analysis
              </>
            )}
          </Button>
        </div>

        {(isAnalyzing || analysisProgress > 0) && (
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-foreground-muted">Analysis Progress</span>
              <span className="text-foreground-subtle">{analysisProgress}%</span>
            </div>
            <Progress value={analysisProgress} className="h-2" />
          </div>
        )}
      </StealthCard>

      {/* Developer Profile Analysis */}
      <StealthCard className="p-5 border border-border/50" variant="default">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">Personal Development Profile</h3>
          {currentProfile && (
            <Badge variant="outline" className="ml-auto text-xs bg-purple-500/10 text-purple-400 border-purple-500/20">
              AI Generated
            </Badge>
          )}
        </div>

        {profilesLoading || isProfileLoading ? (
          <div className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-3/4" />
            <Skeleton className="h-4 w-1/2" />
          </div>
        ) : currentProfile ? (
          <div className="space-y-4">
            {/* Collaboration & Communication Scores */}
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-background-subtle/50 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Collaboration Score</span>
                  <Badge variant={getScoreBadgeVariant(currentProfile.collaboration_score)}>
                    {currentProfile.collaboration_score}/10
                  </Badge>
                </div>
                <Progress value={currentProfile.collaboration_score * 10} className="h-2" />
              </div>

              <div className="p-3 rounded-lg bg-background-subtle/50 border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Mentoring Potential</span>
                  <Badge variant={getScoreBadgeVariant(currentProfile.mentoring_potential)}>
                    {currentProfile.mentoring_potential}/10
                  </Badge>
                </div>
                <Progress value={currentProfile.mentoring_potential * 10} className="h-2" />
              </div>
            </div>

            {/* Expertise Areas */}
            {currentProfile.expertise_areas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-status-flow" />
                  Expertise Areas
                </h4>
                <div className="flex flex-wrap gap-2">
                  {currentProfile.expertise_areas.slice(0, 6).map((area, index) => (
                    <Badge key={index} variant="outline" className="text-xs bg-status-flow-bg/30 text-status-flow border-status-flow/20">
                      {area}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Learning Trajectory */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-status-slow" />
                Learning Trajectory
              </h4>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {currentProfile.learning_trajectory}
              </p>
            </div>

            {/* Communication Style */}
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-purple-400" />
                Communication Style
              </h4>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {currentProfile.communication_style}
              </p>
            </div>

            {/* Growth Areas */}
            {currentProfile.growth_areas.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-status-slow" />
                  Growth Opportunities
                </h4>
                <div className="space-y-1">
                  {currentProfile.growth_areas.slice(0, 3).map((area, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-status-slow mt-2 flex-shrink-0" />
                      {area}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="w-12 h-12 mx-auto text-foreground-subtle mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">No Analysis Available</h4>
            <p className="text-sm text-foreground-muted mb-4">
              Run an AI analysis to get personalized development insights based on your conversation history.
            </p>
            <Button onClick={runNewAnalysis} variant="outline">
              <Sparkles className="w-4 h-4 mr-2" />
              Start Analysis
            </Button>
          </div>
        )}

        {profileError && (
          <div className="mt-4 p-3 rounded-lg bg-status-blocked-bg/20 border border-status-blocked/20">
            <div className="flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-status-blocked mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-status-blocked">Analysis Error</p>
                <p className="text-xs text-status-blocked/80 mt-1">{profileError}</p>
              </div>
            </div>
          </div>
        )}
      </StealthCard>

      {/* Team Context Insights */}
      {currentTeamInsight && (
        <StealthCard className="p-5 border border-border/50" variant="default">
          <div className="flex items-center gap-2 mb-4">
            <TrendingUp className="w-5 h-5 text-foreground-muted" />
            <h3 className="text-lg font-semibold text-foreground">Team Context & Health</h3>
            <Badge variant="outline" className="ml-auto text-xs bg-blue-500/10 text-blue-400 border-blue-500/20">
              Team Analysis
            </Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="p-3 rounded-lg bg-background-subtle/50 border border-border/30 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(currentTeamInsight.team_health_score)}`}>
                {currentTeamInsight.team_health_score}/10
              </div>
              <div className="text-xs text-foreground-muted mt-1">Team Health</div>
            </div>
            <div className="p-3 rounded-lg bg-background-subtle/50 border border-border/30 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(currentTeamInsight.communication_quality)}`}>
                {currentTeamInsight.communication_quality}/10
              </div>
              <div className="text-xs text-foreground-muted mt-1">Communication</div>
            </div>
            <div className="p-3 rounded-lg bg-background-subtle/50 border border-border/30 text-center">
              <div className={`text-2xl font-bold ${getScoreColor(currentTeamInsight.knowledge_sharing_level)}`}>
                {currentTeamInsight.knowledge_sharing_level}/10
              </div>
              <div className="text-xs text-foreground-muted mt-1">Knowledge Sharing</div>
            </div>
          </div>

          {/* Team Insights */}
          <div className="space-y-3">
            <div>
              <h4 className="text-sm font-medium text-foreground mb-2">Collaboration Patterns</h4>
              <p className="text-sm text-foreground-muted leading-relaxed">
                {currentTeamInsight.collaboration_patterns}
              </p>
            </div>

            {currentTeamInsight.key_topics.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">Key Discussion Topics</h4>
                <div className="flex flex-wrap gap-2">
                  {currentTeamInsight.key_topics.slice(0, 8).map((topic, index) => (
                    <Badge key={index} variant="secondary" className="text-xs">
                      {topic}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {currentTeamInsight.recommendations.length > 0 && (
              <div>
                <h4 className="text-sm font-medium text-foreground mb-2">AI Recommendations</h4>
                <div className="space-y-1">
                  {currentTeamInsight.recommendations.slice(0, 3).map((rec, index) => (
                    <div key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                      <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </StealthCard>
      )}
    </div>
  );
}