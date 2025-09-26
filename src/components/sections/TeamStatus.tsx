import { Clock, FileText, Users, Zap, Activity } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { StatusIndicator, StatusBadge } from '@/components/ui/status-indicator';
import { MetricDisplay } from '@/components/ui/metric-display';
import { Project } from '@/types';

interface TeamStatusProps {
  project: Project;
}

export function TeamStatus({ project }: TeamStatusProps) {
  // Sort developers to show blocked first, then slow, then flow
  const sortedDevelopers = [...project.developers].sort((a, b) => {
    const order = { blocked: 0, slow: 1, flow: 2 };
    return order[a.status] - order[b.status];
  });


  return (
    <div className="space-y-8 animate-fade-in">
      {/* Refined Live Team Status Board Header */}
      <StealthCard className="p-6 relative overflow-hidden border border-card-border/50" variant="glass">
        {/* Subtle Gradient Accent */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent" />
        
        <div className="relative flex items-center gap-3 mb-5">
          <div className="w-12 h-12 rounded-xl bg-background-card border border-primary/30 flex items-center justify-center">
            <Activity className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-semibold text-foreground">
              Live Team Status Board
            </h2>
            <p className="text-sm text-foreground-muted mt-0.5">
              Real-time visibility into what every developer is working on
            </p>
          </div>
        </div>

        {/* Refined Status Overview Metrics */}
        <div className="relative grid grid-cols-3 gap-4 mt-6">
          <div className="relative bg-status-flow-bg/50 rounded-lg p-4 border border-status-flow/20 hover:border-status-flow/40 transition-all hover:shadow-md group cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="flow" size="md" withPulse />
            </div>
            <div className="text-3xl font-semibold text-status-flow">
              {project.statusDistribution.active}
            </div>
            <div className="text-xs text-status-flow/70 uppercase tracking-wide font-medium mt-1">
              In Flow
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-status-flow/60 rounded-full animate-pulse" />
          </div>

          <div className="relative bg-status-slow-bg/50 rounded-lg p-4 border border-status-slow/20 hover:border-status-slow/40 transition-all hover:shadow-md group cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="slow" size="md" withPulse />
            </div>
            <div className="text-3xl font-semibold text-status-slow">
              {project.statusDistribution.slow}
            </div>
            <div className="text-xs text-status-slow/70 uppercase tracking-wide font-medium mt-1">
              Problem Solving
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-status-slow/60 rounded-full animate-pulse" />
          </div>

          <div className="relative bg-status-blocked-bg/50 rounded-lg p-4 border border-status-blocked/20 hover:border-status-blocked/40 transition-all hover:shadow-md group cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="blocked" size="md" withPulse withGlow />
            </div>
            <div className="text-3xl font-semibold text-status-blocked">
              {project.statusDistribution.blocked}
            </div>
            <div className="text-xs text-status-blocked/70 uppercase tracking-wide font-medium mt-1">
              Blocked
            </div>
            <div className="absolute top-2 right-2 w-2 h-2 bg-status-blocked/60 rounded-full animate-pulse" />
          </div>
        </div>
      </StealthCard>


      {/* Team Developer Cards Section */}
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-foreground-muted" />
          <h3 className="text-lg font-semibold text-foreground">Developer Activity</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDevelopers.map((developer, index) => (
            <StealthCard
              key={developer.id}
              className={`p-5 border-l-4 group animate-fade-in relative ${
                developer.status === 'blocked' ? 'ring-1 ring-status-blocked/20' : ''
              }`}
              style={{
                borderLeftColor: `hsl(var(--status-${developer.status}) / 0.8)`,
                borderLeftWidth: '3px',
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
              variant="default"
            >
              {/* Developer header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`relative w-12 h-12 rounded-lg flex items-center justify-center font-semibold text-sm border ${
                  developer.status === 'flow' ? 'bg-status-flow-bg border-status-flow/30 text-status-flow' :
                  developer.status === 'slow' ? 'bg-status-slow-bg border-status-slow/30 text-status-slow' :
                  developer.status === 'blocked' ? 'bg-status-blocked-bg border-status-blocked/30 text-status-blocked' : 'bg-primary/10 border-primary/30 text-primary'
                }`}>
                  {developer.avatar}
                  {developer.status === 'blocked' && (
                    <div className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-status-blocked rounded-full" />
                  )}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-base">
                    {developer.name}
                  </h4>
                  <StatusBadge
                    status={developer.status}
                    variant="ghost"
                    size="sm"
                    withIcon={false}
                  />
                </div>
                <StatusIndicator
                  status={developer.status}
                  size="sm"
                  withPulse={developer.status === 'blocked'}
                />
              </div>

              {/* Current task */}
              <div className="space-y-3">
                <div className="bg-background-subtle/50 rounded-lg p-3 border border-border/50">
                  <p className="text-sm text-foreground mb-2 line-clamp-2">
                    {developer.currentTask}
                  </p>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3 h-3" />
                      <span>{developer.duration}</span>
                    </div>
                    {developer.fileName && (
                      <div className="flex items-center gap-1.5">
                        <FileText className="w-3 h-3" />
                        <span className="font-mono">{developer.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity indicator */}
              {developer.status === 'blocked' && (
                <div className="absolute top-4 right-4">
                  <div className="w-2 h-2 rounded-full bg-status-blocked animate-pulse" />
                </div>
              )}
            </StealthCard>
          ))}
        </div>
      </div>

      {/* AI Detection Logic Explanation */}
      <StealthCard className="p-6" variant="glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent/20 to-primary/20 flex items-center justify-center">
            <Zap className="w-5 h-5 text-accent" />
          </div>
          <div>
            <h3 className="text-xl font-semibold text-foreground">Status Detection Logic</h3>
            <p className="text-sm text-foreground-muted">
              AI analyzes chat patterns to detect developer states in real-time
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="relative bg-status-flow-bg/30 border border-status-flow/25 rounded-lg p-4 text-center group hover:bg-status-flow-bg/40 transition-all cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="flow" size="md" withPulse />
            </div>
            <div className="text-2xl font-semibold text-status-flow mb-1">
              {project.statusDistribution.active}
            </div>
            <h4 className="font-medium text-status-flow text-sm mb-1">Flow State</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Quick solutions, steady progress
            </p>
          </div>

          <div className="relative bg-status-slow-bg/30 border border-status-slow/25 rounded-lg p-4 text-center group hover:bg-status-slow-bg/40 transition-all cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="slow" size="md" withPulse />
            </div>
            <div className="text-2xl font-semibold text-status-slow mb-1">
              {project.statusDistribution.slow}
            </div>
            <h4 className="font-medium text-status-slow text-sm mb-1">Problem Solving</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Multiple iterations, debugging
            </p>
          </div>

          <div className="relative bg-status-blocked-bg/30 border border-status-blocked/25 rounded-lg p-4 text-center group hover:bg-status-blocked-bg/40 transition-all cursor-pointer">
            <div className="flex items-center justify-center mb-2">
              <StatusIndicator status="blocked" size="md" withPulse withGlow />
            </div>
            <div className="text-2xl font-semibold text-status-blocked mb-1">
              {project.statusDistribution.blocked}
            </div>
            <h4 className="font-medium text-status-blocked text-sm mb-1">Blocked</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Extended time, needs help
            </p>
            {project.statusDistribution.blocked > 0 && (
              <div className="absolute top-2 right-2 w-2 h-2 bg-status-blocked rounded-full animate-pulse" />
            )}
          </div>
        </div>

        <div className="bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-6 h-6 rounded-full bg-primary/20 flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary" />
            </div>
            <h4 className="font-semibold text-primary">Smart Assistance</h4>
          </div>
          <p className="text-sm text-foreground-muted leading-relaxed">
            When someone is stuck, the system identifies similar problems solved by teammates and suggests connections
          </p>
        </div>
      </StealthCard>
    </div>
  );
}