import { useState } from 'react';
import { RefreshCw, AlertTriangle, Zap, Users, Activity } from 'lucide-react';
import { PremiumButton } from '@/components/ui/premium-button';
import { StatusIndicator } from '@/components/ui/status-indicator';
import { MetricDisplay } from '@/components/ui/metric-display';
import { StealthCard } from '@/components/ui/stealth-card';
import { ProjectCard } from '@/components/ProjectCard';
import { mockProjects } from '@/data/mockData';
import { Project } from '@/types';

interface DashboardProps {
  onProjectSelect: (project: Project) => void;
}

export function Dashboard({ onProjectSelect }: DashboardProps) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [projects] = useState<Project[]>(mockProjects);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const totalActive = projects.reduce((sum, p) => sum + p.statusDistribution.active, 0);
  const totalSlow = projects.reduce((sum, p) => sum + p.statusDistribution.slow, 0);
  const totalBlocked = projects.reduce((sum, p) => sum + p.statusDistribution.blocked, 0);
  const totalCollisions = projects.filter(p => p.hasCollisions).length;
  const totalDevelopers = projects.reduce((sum, p) => sum + p.developers.length, 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Glass Morphism Header */}
      <header className="sticky top-0 z-50 glass-morphism border-b border-glass-border">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Brand & Description */}
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-accent flex items-center justify-center">
                  <Zap className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-foreground tracking-tight">
                    Lense Analytics
                  </h1>
                  <p className="text-sm text-foreground-muted">
                    AI-powered development team coordination through Claude Code chat analysis
                  </p>
                </div>
              </div>

              {/* Core Value Proposition */}
              <div className="glass-morphism px-4 py-2 rounded-lg inline-flex items-center gap-2 border border-primary/20">
                <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                <span className="text-sm text-primary font-medium">
                  Extracts semantic understanding from isolated conversations to reconstruct team dynamics
                </span>
              </div>
            </div>

            {/* Stats & Actions */}
            <div className="flex items-center gap-6">
              {/* Live Stats */}
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <StatusIndicator status="flow" size="sm" withPulse />
                  <span className="text-foreground-muted">{totalActive} Active</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-foreground-muted" />
                  <span className="text-foreground-muted">{totalDevelopers} Developers</span>
                </div>
                {totalCollisions > 0 && (
                  <div className="flex items-center gap-2 text-warning animate-pulse-glow">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="font-medium">{totalCollisions} Collision{totalCollisions > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>

              {/* Refresh Button */}
              <PremiumButton
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                variant="glass"
                withShimmer={!isRefreshing}
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                {isRefreshing ? 'Syncing...' : 'Refresh'}
              </PremiumButton>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar during refresh with glow */}
      {isRefreshing && (
        <div className="h-1 bg-background-subtle relative overflow-hidden">
          <div className="h-full bg-gradient-to-r from-primary via-accent to-primary w-full animate-shimmer opacity-80" />
          <div className="absolute inset-0 bg-primary/20 blur-sm" />
        </div>
      )}

      {/* Main Dashboard Content */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Key Metrics Overview */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <MetricDisplay
            title="Active Flow"
            value={totalActive}
            subtitle="Developers in optimal state"
            icon={<Activity className="w-5 h-5" />}
            variant="success"
            change={{ value: 12, type: "increase" }}
          />
          <MetricDisplay
            title="Problem Solving"
            value={totalSlow}
            subtitle="Working through challenges"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="warning"
          />
          <MetricDisplay
            title="Blocked"
            value={totalBlocked}
            subtitle="Requiring intervention"
            icon={<AlertTriangle className="w-5 h-5" />}
            variant="destructive"
            change={totalBlocked > 0 ? { value: 8, type: "decrease" } : undefined}
          />
          <MetricDisplay
            title="Total Projects"
            value={projects.length}
            subtitle="Active development streams"
            icon={<Users className="w-5 h-5" />}
            variant="primary"
          />
        </section>

        {/* Project Grid */}
        <section>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Active Projects</h2>
              <p className="text-sm text-foreground-muted mt-1">
                Real-time coordination across your development teams
              </p>
            </div>

            {/* View Options */}
            <div className="flex items-center gap-2">
              <PremiumButton variant="ghost" size="sm" className="text-xs">
                Grid View
              </PremiumButton>
              <PremiumButton variant="ghost" size="sm" className="text-xs opacity-50">
                List View
              </PremiumButton>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {projects.map((project, index) => (
              <div
                key={project.id}
                className="animate-fade-in"
                style={{
                  animationDelay: `${index * 100}ms`,
                  animationFillMode: 'both'
                }}
              >
                <ProjectCard
                  project={project}
                  onClick={() => onProjectSelect(project)}
                />
              </div>
            ))}
          </div>
        </section>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-16">
            <StealthCard className="max-w-md mx-auto p-8 text-center" variant="glass">
              <div className="space-y-4">
                <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto">
                  <Activity className="w-8 h-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-foreground mb-2">
                    No Projects Yet
                  </h3>
                  <p className="text-foreground-muted">
                    Your development team's chat history will appear here after the first Claude Code session
                  </p>
                </div>
                <PremiumButton
                  variant="outline"
                  className="mt-4"
                  withShimmer
                >
                  Get Started
                </PremiumButton>
              </div>
            </StealthCard>
          </div>
        )}
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 -left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-accent/5 rounded-full blur-3xl animate-pulse-glow"
             style={{ animationDelay: '1s' }} />
      </div>
    </div>
  );
}