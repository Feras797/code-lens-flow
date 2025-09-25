import { Users, AlertTriangle, Clock, TrendingUp, Zap } from 'lucide-react';
import { StealthCard } from '@/components/ui/stealth-card';
import { StatusIndicator, StatusBadge } from '@/components/ui/status-indicator';
import { Project } from '@/types';
import { cn } from '@/lib/utils';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const totalDevelopers = project.developers?.length || project.activeDevelopers || 0;
  const hasActiveWork = project.statusDistribution.active > 0;
  const hasIssues = project.statusDistribution.blocked > 0 || project.hasCollisions;

  // Calculate project health score
  const healthScore = Math.round(
    ((project.statusDistribution.active * 3) +
     (project.statusDistribution.slow * 1) -
     (project.statusDistribution.blocked * 2)) / Math.max(totalDevelopers, 1) * 20
  );

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-status-flow';
    if (score >= 60) return 'text-status-slow';
    return 'text-status-blocked';
  };

  return (
    <StealthCard
      onClick={onClick}
      className={cn(
        "p-0 cursor-pointer transition-all duration-300 group overflow-hidden",
        hasIssues && "border-warning/30",
        hasActiveWork && "hover:glow-primary"
      )}
      variant="glass"
    >
      {/* Header Section */}
      <div className="p-6 pb-4 relative">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1 space-y-2">
            {/* Project Name & Health */}
            <div className="flex items-center gap-3">
              <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors tracking-tight">
                {project.name}
              </h3>
              <div className={cn(
                "text-sm font-bold px-2 py-1 rounded-full bg-card border",
                getHealthColor(healthScore)
              )}>
                {Math.max(healthScore, 0)}%
              </div>
            </div>

            {/* Team Info */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-2 text-foreground-muted">
                <Users className="w-4 h-4" />
                <span>{totalDevelopers} developer{totalDevelopers > 1 ? 's' : ''}</span>
              </div>
              <div className="flex items-center gap-2 text-foreground-muted">
                <Clock className="w-4 h-4" />
                <span>Updated {project.lastRefresh || project.lastUpdate || '2 min ago'}</span>
              </div>
            </div>
          </div>

          {/* Status Indicator */}
          <div className="flex items-center gap-2">
            {hasActiveWork && (
              <StatusIndicator
                status="flow"
                size="md"
                withPulse
                withGlow={hasActiveWork}
              />
            )}
            {project.hasCollisions && (
              <div className="animate-pulse-glow">
                <AlertTriangle className="w-5 h-5 text-warning" />
              </div>
            )}
          </div>
        </div>

        {/* Collision Warning */}
        {project.hasCollisions && (
          <div className="mb-4">
            <div className="bg-warning-bg border border-warning/20 rounded-lg p-3 animate-fade-in">
              <div className="flex items-center gap-2 text-warning text-sm font-medium">
                <AlertTriangle className="w-4 h-4" />
                <span>File collision detected</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Status Distribution */}
      <div className="px-6 pb-4">
        <div className="grid grid-cols-3 gap-3">
          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <StatusIndicator status="flow" size="sm" />
              <span className="text-lg font-bold text-status-flow">
                {project.statusDistribution.active}
              </span>
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              Flow
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <StatusIndicator status="slow" size="sm" />
              <span className="text-lg font-bold text-status-slow">
                {project.statusDistribution.slow}
              </span>
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              Slow
            </div>
          </div>

          <div className="text-center space-y-1">
            <div className="flex items-center justify-center gap-1">
              <StatusIndicator status="blocked" size="sm" />
              <span className="text-lg font-bold text-status-blocked">
                {project.statusDistribution.blocked}
              </span>
            </div>
            <div className="text-xs text-foreground-muted uppercase tracking-wider">
              Blocked
            </div>
          </div>
        </div>
      </div>

      {/* Team Members Preview */}
      <div className="px-6 pb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs text-foreground-muted">Team:</span>
            <div className="flex -space-x-2">
              {project.developers?.slice(0, 4).map((dev, index) => (
                <div
                  key={dev.id || index}
                  className={cn(
                    "w-7 h-7 rounded-full border-2 border-card flex items-center justify-center text-xs font-medium ring-1 ring-border/50",
                    dev.status === 'flow' && "bg-status-flow text-white",
                    dev.status === 'slow' && "bg-status-slow text-white",
                    dev.status === 'blocked' && "bg-status-blocked text-white"
                  )}
                  title={`${dev.name} - ${dev.status}`}
                >
                  {dev.avatar || dev.name.charAt(0)}
                </div>
              )) || (
                // Fallback for when developers array is not available
                <div className="w-7 h-7 rounded-full border-2 border-card bg-primary flex items-center justify-center text-xs font-medium text-primary-foreground">
                  {totalDevelopers}
                </div>
              )}
              {project.developers && project.developers.length > 4 && (
                <div className="w-7 h-7 rounded-full border-2 border-card bg-muted flex items-center justify-center text-xs font-medium text-muted-foreground">
                  +{project.developers.length - 4}
                </div>
              )}
            </div>
          </div>

          {/* Health Indicator */}
          <StatusBadge
            status={healthScore >= 80 ? 'flow' : healthScore >= 60 ? 'slow' : 'blocked'}
            variant="outline"
            size="sm"
            withIcon={false}
          >
            {healthScore >= 80 ? 'Healthy' : healthScore >= 60 ? 'Moderate' : 'Needs Attention'}
          </StatusBadge>
        </div>
      </div>

      {/* Hover Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-xl pointer-events-none" />

      {/* Bottom Glow Effect */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300",
        hasActiveWork && "opacity-50"
      )} />
    </StealthCard>
  );
}