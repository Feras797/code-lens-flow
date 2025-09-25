import { AlertTriangle, Clock, FileText, Users, Zap, Activity } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { StatusIndicator, StatusBadge } from '@/components/ui/status-indicator';
import { CollisionAlert } from '@/components/ui/collision-alert';
import { MetricDisplay } from '@/components/ui/metric-display';
import { Project } from '@/types';
import { mockCollisions } from '@/data/mockData';

interface TeamStatusProps {
  project: Project;
}

export function TeamStatus({ project }: TeamStatusProps) {
  // Sort developers to show blocked first, then slow, then flow
  const sortedDevelopers = [...project.developers].sort((a, b) => {
    const order = { blocked: 0, slow: 1, flow: 2 };
    return order[a.status] - order[b.status];
  });

  const collisionData = project.hasCollisions ? mockCollisions.map(collision => ({
    id: collision.id,
    type: "file" as const,
    developers: collision.developers,
    resource: collision.file,
    severity: "high" as const,
    description: `Multiple developers are editing the same file simultaneously`
  })) : [];

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Live Team Status Board Header */}
      <StealthCard className="p-6" variant="glass">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Activity className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-foreground">Live Team Status Board</h2>
            <p className="text-sm text-foreground-muted">
              Real-time visibility into what every developer is working on, extracted from Claude Code conversations
            </p>
          </div>
        </div>

        {/* Status Overview Metrics */}
        <div className="grid grid-cols-3 gap-4 mt-6">
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <StatusIndicator status="flow" size="lg" withPulse withGlow />
            </div>
            <div className="text-2xl font-bold text-status-flow">
              {project.statusDistribution.active}
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              In Flow
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <StatusIndicator status="slow" size="lg" withPulse />
            </div>
            <div className="text-2xl font-bold text-status-slow">
              {project.statusDistribution.slow}
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              Problem Solving
            </div>
          </div>

          <div className="text-center space-y-2">
            <div className="flex items-center justify-center">
              <StatusIndicator status="blocked" size="lg" withPulse withGlow />
            </div>
            <div className="text-2xl font-bold text-status-blocked">
              {project.statusDistribution.blocked}
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              Blocked
            </div>
          </div>
        </div>
      </StealthCard>

      {/* Collision Detection Alerts */}
      {project.hasCollisions && (
        <div className="space-y-4">
          <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-warning animate-pulse-glow" />
            Active Collisions
          </h3>
          {collisionData.map((collision, index) => (
            <div
              key={collision.id}
              className="animate-slide-up"
              style={{
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
            >
              <CollisionAlert
                collision={collision}
                onDismiss={(id) => console.log('Dismiss collision:', id)}
                onResolve={(id) => console.log('Resolve collision:', id)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Team Developer Cards */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
          <Users className="w-5 h-5" />
          Developer Activity
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedDevelopers.map((developer, index) => (
            <StealthCard
              key={developer.id}
              className="p-6 border-l-4 group animate-slide-up"
              style={{
                borderLeftColor: `hsl(var(--status-${developer.status}))`,
                animationDelay: `${index * 100}ms`,
                animationFillMode: 'both'
              }}
              variant="glass"
              glow={developer.status === 'blocked' ? 'status-blocked' :
                     developer.status === 'slow' ? 'status-slow' : 'status-flow'}
            >
              {/* Developer header */}
              <div className="flex items-center gap-3 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-sm ${
                  developer.status === 'flow' ? 'bg-status-flow text-white' :
                  developer.status === 'slow' ? 'bg-status-slow text-white' :
                  developer.status === 'blocked' ? 'bg-status-blocked text-white' : 'bg-primary text-primary-foreground'
                }`}>
                  {developer.avatar}
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-foreground text-lg">{developer.name}</h4>
                  <StatusBadge
                    status={developer.status}
                    variant="outline"
                    size="sm"
                  />
                </div>
                <StatusIndicator
                  status={developer.status}
                  size="md"
                  withPulse
                  withGlow={developer.status === 'blocked'}
                />
              </div>

              {/* Current task */}
              <div className="space-y-3">
                <div className="bg-background-subtle rounded-lg p-3">
                  <p className="text-sm font-medium text-foreground mb-2">
                    {developer.currentTask}
                  </p>
                  <div className="flex items-center justify-between text-xs text-foreground-muted">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3 h-3" />
                      <span>{developer.duration}</span>
                    </div>
                    {developer.fileName && (
                      <div className="flex items-center gap-2">
                        <FileText className="w-3 h-3" />
                        <span className="font-mono">{developer.fileName}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Activity indicator */}
              <div className="absolute top-4 right-4">
                <div className={`w-2 h-2 rounded-full animate-pulse ${
                  developer.status === 'flow' ? 'bg-status-flow' :
                  developer.status === 'slow' ? 'bg-status-slow' :
                  'bg-status-blocked'
                }`} />
              </div>
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
          <div className="bg-status-flow-bg border border-status-flow/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-center mb-3">
              <StatusIndicator status="flow" size="lg" withPulse />
            </div>
            <div className="text-2xl font-bold text-status-flow mb-1">
              {project.statusDistribution.active}
            </div>
            <h4 className="font-semibold text-status-flow mb-2">Flow State</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Quick solutions, steady progress, consistent momentum
            </p>
          </div>

          <div className="bg-status-slow-bg border border-status-slow/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-center mb-3">
              <StatusIndicator status="slow" size="lg" withPulse />
            </div>
            <div className="text-2xl font-bold text-status-slow mb-1">
              {project.statusDistribution.slow}
            </div>
            <h4 className="font-semibold text-status-slow mb-2">Problem Solving</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Multiple iterations, debugging, exploring solutions
            </p>
          </div>

          <div className="bg-status-blocked-bg border border-status-blocked/30 rounded-xl p-4 text-center group hover:scale-[1.02] transition-transform">
            <div className="flex items-center justify-center mb-3">
              <StatusIndicator status="blocked" size="lg" withPulse withGlow />
            </div>
            <div className="text-2xl font-bold text-status-blocked mb-1">
              {project.statusDistribution.blocked}
            </div>
            <h4 className="font-semibold text-status-blocked mb-2">Blocked</h4>
            <p className="text-xs text-foreground-subtle leading-relaxed">
              Extended time on single issue, needs intervention
            </p>
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