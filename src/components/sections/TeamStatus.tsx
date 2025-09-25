import { AlertTriangle, Clock, FileText, Users } from 'lucide-react';
import { Project } from '@/types';
import { mockCollisions } from '@/data/mockData';

interface TeamStatusProps {
  project: Project;
}

export function TeamStatus({ project }: TeamStatusProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'flow': return <div className="w-3 h-3 rounded-full bg-status-flow"></div>;
      case 'slow': return <div className="w-3 h-3 rounded-full bg-status-slow"></div>;
      case 'blocked': return <div className="w-3 h-3 rounded-full bg-status-blocked"></div>;
      default: return <div className="w-3 h-3 rounded-full bg-muted"></div>;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'flow': return 'In Flow';
      case 'slow': return 'Problem Solving';
      case 'blocked': return 'Blocked';
      default: return 'Unknown';
    }
  };

  const getStatusBg = (status: string) => {
    switch (status) {
      case 'flow': return 'bg-status-flow-bg';
      case 'slow': return 'bg-status-slow-bg';
      case 'blocked': return 'bg-status-blocked-bg';
      default: return 'bg-muted';
    }
  };

  // Sort developers to show blocked first
  const sortedDevelopers = [...project.developers].sort((a, b) => {
    const order = { blocked: 0, slow: 1, flow: 2 };
    return order[a.status] - order[b.status];
  });

  return (
    <div className="space-y-6">
      {/* Collision Detection Alert */}
      {project.hasCollisions && (
        <div className="bg-warning-bg border border-warning/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-medium text-warning-foreground">Collision Detected</h3>
          </div>
          {mockCollisions.map((collision) => (
            <div key={collision.id} className="text-sm text-warning-foreground">
              {collision.developers.join(' and ')} are both editing {collision.file}
            </div>
          ))}
        </div>
      )}

      {/* Team Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sortedDevelopers.map((developer) => (
          <div
            key={developer.id}
            className={`bg-card rounded-lg border p-4 ${getStatusBg(developer.status)} border-l-4 ${
              developer.status === 'blocked' ? 'border-l-status-blocked' :
              developer.status === 'slow' ? 'border-l-status-slow' :
              'border-l-status-flow'
            }`}
          >
            {/* Developer header */}
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center text-primary-foreground font-medium text-sm">
                {developer.avatar}
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-foreground">{developer.name}</h4>
                <div className="flex items-center gap-2">
                  {getStatusIcon(developer.status)}
                  <span className="text-sm text-muted-foreground">
                    {getStatusLabel(developer.status)}
                  </span>
                </div>
              </div>
            </div>

            {/* Current task */}
            <div className="space-y-2">
              <p className="text-sm text-foreground font-medium">
                {developer.currentTask}
              </p>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>{developer.duration}</span>
                </div>
                {developer.fileName && (
                  <div className="flex items-center gap-1">
                    <FileText className="w-3 h-3" />
                    <span>{developer.fileName}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Team Summary */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold text-foreground mb-4 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Team Summary
        </h3>
        
        <div className="grid grid-cols-3 gap-6 text-center">
          <div>
            <div className="text-2xl font-bold text-status-flow">
              {project.statusDistribution.active}
            </div>
            <div className="text-sm text-muted-foreground">In Flow</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-status-slow">
              {project.statusDistribution.slow}
            </div>
            <div className="text-sm text-muted-foreground">Problem Solving</div>
          </div>
          <div>
            <div className="text-2xl font-bold text-status-blocked">
              {project.statusDistribution.blocked}
            </div>
            <div className="text-sm text-muted-foreground">Blocked</div>
          </div>
        </div>
      </div>
    </div>
  );
}