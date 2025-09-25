import { AlertTriangle, Users, Clock } from 'lucide-react';
import { Project } from '@/types';

interface ProjectCardProps {
  project: Project;
  onClick: () => void;
}

export function ProjectCard({ project, onClick }: ProjectCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flow': return 'bg-status-flow';
      case 'slow': return 'bg-status-slow';
      case 'blocked': return 'bg-status-blocked';
      default: return 'bg-muted';
    }
  };

  return (
    <div
      onClick={onClick}
      className="bg-card rounded-lg border border-border p-6 cursor-pointer transition-all duration-200 hover:shadow-lg hover:shadow-card-shadow/10 hover:border-border-hover group"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {project.name}
        </h3>
        {project.hasCollisions && (
          <div className="flex items-center gap-1 text-warning">
            <AlertTriangle className="w-4 h-4" />
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">{project.activeDevelopers} developers</span>
        </div>
      </div>

      {/* Status distribution */}
      <div className="space-y-2 mb-4">
        {project.statusDistribution.active > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-status-flow"></div>
            <span className="text-foreground">{project.statusDistribution.active} in flow</span>
          </div>
        )}
        {project.statusDistribution.slow > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-status-slow"></div>
            <span className="text-foreground">{project.statusDistribution.slow} slow</span>
          </div>
        )}
        {project.statusDistribution.blocked > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <div className="w-2 h-2 rounded-full bg-status-blocked"></div>
            <span className="text-foreground">{project.statusDistribution.blocked} blocked</span>
          </div>
        )}
      </div>

      {/* Collision alert */}
      {project.hasCollisions && (
        <div className="bg-warning-bg border border-warning/20 rounded-md p-2 mb-4">
          <p className="text-xs text-warning-foreground">File collision detected</p>
        </div>
      )}

      {/* Last refresh */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="w-3 h-3" />
        <span>Updated {project.lastRefresh}</span>
      </div>
    </div>
  );
}