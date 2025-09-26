import { useState } from 'react';
import { Brain, Play, Database, MessageSquare, Users, AlertCircle } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/components/ui/use-toast";
import { useTeamHealthAnalysis, useDeveloperProfileAnalysis } from '@/hooks/useTeamAnalysis';
import { useProjectChatLogs } from '@/hooks/useSupabase';

export function AIAnalysisDemo() {
  const [activeDemo, setActiveDemo] = useState<'team' | 'developer' | null>(null);
  const [analysisResults, setAnalysisResults] = useState<any>(null);

  const { toast } = useToast();
  const { analyzeTeamHealth, isLoading: teamLoading, error: teamError } = useTeamHealthAnalysis();
  const { analyzeDeveloperProfile, isLoading: developerLoading, error: developerError } = useDeveloperProfileAnalysis();
  const { data: chatLogs, isLoading: logsLoading } = useProjectChatLogs('GoonerSquad', 20);

  const runTeamAnalysis = async () => {
    setActiveDemo('team');
    setAnalysisResults(null);

    try {
      const result = await analyzeTeamHealth({
        project_id: 'GoonerSquad',
        analysis_type: 'team_health',
        conversation_limit: 20,
        time_range: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      });

      if (result) {
        setAnalysisResults(result);
        toast({
          title: "Team Analysis Complete",
          description: "AI has analyzed team health and collaboration patterns",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: `Team analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  const runDeveloperAnalysis = async () => {
    setActiveDemo('developer');
    setAnalysisResults(null);

    try {
      const result = await analyzeDeveloperProfile({
        user_id: 'e3b41869-1444-4bf0-a625-90b0f1d1dffb',
        project_id: 'GoonerSquad',
        analysis_type: 'developer_profile',
        conversation_limit: 15,
        time_range: {
          start_date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          end_date: new Date().toISOString()
        }
      });

      if (result) {
        setAnalysisResults(result);
        toast({
          title: "Developer Profile Complete",
          description: "AI has analyzed individual development patterns",
        });
      }
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: `Developer analysis failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-br from-purple-500/5 to-blue-500/5 border-purple-500/20">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-purple-500/30 flex items-center justify-center">
            <Brain className="w-6 h-6 text-purple-400" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              LangChain + Supabase Analysis Demo
            </h2>
            <p className="text-sm text-foreground-muted">
              Test AI-powered analysis of chat history data
            </p>
          </div>
        </div>

        {/* Data Status */}
        <div className="flex items-center gap-4 mb-4">
          <div className="flex items-center gap-2">
            <Database className="w-4 h-4 text-green-400" />
            <span className="text-sm text-foreground-muted">
              {logsLoading ? 'Loading...' : `${chatLogs?.length || 0} conversations available`}
            </span>
          </div>
          <Badge variant="outline" className="text-xs">
            OpenAI GPT-4
          </Badge>
        </div>
      </Card>

      {/* Demo Controls */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <Users className="w-6 h-6 text-blue-400" />
            <div>
              <h3 className="font-semibold">Team Health Analysis</h3>
              <p className="text-sm text-foreground-muted">
                Analyze team collaboration patterns and communication
              </p>
            </div>
          </div>
          <Button
            onClick={runTeamAnalysis}
            disabled={teamLoading || logsLoading}
            className="w-full"
            variant={activeDemo === 'team' ? 'default' : 'outline'}
          >
            {teamLoading ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Team...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Team Analysis
              </>
            )}
          </Button>

          {teamError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Team Analysis Error</span>
              </div>
              <p className="text-xs text-red-400/80 mt-1">{teamError}</p>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <div className="flex items-center gap-3 mb-4">
            <MessageSquare className="w-6 h-6 text-green-400" />
            <div>
              <h3 className="font-semibold">Developer Profile Analysis</h3>
              <p className="text-sm text-foreground-muted">
                Analyze individual coding patterns and expertise
              </p>
            </div>
          </div>
          <Button
            onClick={runDeveloperAnalysis}
            disabled={developerLoading || logsLoading}
            className="w-full"
            variant={activeDemo === 'developer' ? 'default' : 'outline'}
          >
            {developerLoading ? (
              <>
                <Brain className="w-4 h-4 mr-2 animate-pulse" />
                Analyzing Developer...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 mr-2" />
                Run Developer Analysis
              </>
            )}
          </Button>

          {developerError && (
            <div className="mt-3 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-red-400" />
                <span className="text-sm text-red-400">Developer Analysis Error</span>
              </div>
              <p className="text-xs text-red-400/80 mt-1">{developerError}</p>
            </div>
          )}
        </Card>
      </div>

      {/* Analysis Results */}
      {analysisResults && (
        <Card className="p-6">
          <div className="flex items-center gap-2 mb-4">
            <Brain className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-semibold">
              {activeDemo === 'team' ? 'Team Health Analysis Results' : 'Developer Profile Results'}
            </h3>
            <Badge variant="outline" className="ml-auto text-xs bg-green-500/10 text-green-400 border-green-500/20">
              AI Generated
            </Badge>
          </div>

          <div className="space-y-4">
            {activeDemo === 'team' && (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="text-center p-3 rounded-lg bg-background-subtle/50">
                    <div className="text-2xl font-bold text-blue-400">
                      {analysisResults.team_health_score}/10
                    </div>
                    <div className="text-xs text-foreground-muted">Team Health</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background-subtle/50">
                    <div className="text-2xl font-bold text-green-400">
                      {analysisResults.communication_quality}/10
                    </div>
                    <div className="text-xs text-foreground-muted">Communication</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background-subtle/50">
                    <div className="text-2xl font-bold text-purple-400">
                      {analysisResults.knowledge_sharing_level}/10
                    </div>
                    <div className="text-xs text-foreground-muted">Knowledge Sharing</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Key Topics</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.key_topics.map((topic: string, index: number) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {topic}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Collaboration Patterns</h4>
                  <p className="text-sm text-foreground-muted">
                    {analysisResults.collaboration_patterns}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">AI Recommendations</h4>
                  <div className="space-y-1">
                    {analysisResults.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-blue-400 mt-2 flex-shrink-0" />
                        {rec}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {activeDemo === 'developer' && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 rounded-lg bg-background-subtle/50">
                    <div className="text-2xl font-bold text-green-400">
                      {analysisResults.collaboration_score}/10
                    </div>
                    <div className="text-xs text-foreground-muted">Collaboration</div>
                  </div>
                  <div className="text-center p-3 rounded-lg bg-background-subtle/50">
                    <div className="text-2xl font-bold text-purple-400">
                      {analysisResults.mentoring_potential}/10
                    </div>
                    <div className="text-xs text-foreground-muted">Mentoring Potential</div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Expertise Areas</h4>
                  <div className="flex flex-wrap gap-2">
                    {analysisResults.expertise_areas.map((area: string, index: number) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-500/10 text-green-400 border-green-500/20">
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Learning Trajectory</h4>
                  <p className="text-sm text-foreground-muted">
                    {analysisResults.learning_trajectory}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Communication Style</h4>
                  <p className="text-sm text-foreground-muted">
                    {analysisResults.communication_style}
                  </p>
                </div>

                <div>
                  <h4 className="font-medium mb-2">Growth Areas</h4>
                  <div className="space-y-1">
                    {analysisResults.growth_areas.map((area: string, index: number) => (
                      <div key={index} className="flex items-start gap-2 text-sm text-foreground-muted">
                        <div className="w-1.5 h-1.5 rounded-full bg-orange-400 mt-2 flex-shrink-0" />
                        {area}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Raw JSON for debugging */}
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-foreground-muted hover:text-foreground">
                View Raw Analysis Data
              </summary>
              <pre className="mt-2 p-3 text-xs bg-background-subtle/50 rounded-lg overflow-auto max-h-60">
                {JSON.stringify(analysisResults, null, 2)}
              </pre>
            </details>
          </div>
        </Card>
      )}
    </div>
  );
}