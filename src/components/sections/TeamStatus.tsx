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
      {/* Live Team Status Board Header */}
      <div className="bg-card rounded-lg border p-4">
        <h3 className="text-lg font-semibold text-foreground mb-2">
          Live Team Status Board
        </h3>
        <p className="text-sm text-muted-foreground">
          Real-time visibility into what every developer is working on, extracted from Claude Code conversations
        </p>
      </div>

      {/* Collision Detection Alert */}
      {project.hasCollisions && (
        <div className="bg-warning-bg border border-warning/20 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="w-5 h-5 text-warning" />
            <h3 className="font-medium text-warning-foreground">⚠️ COLLISION DETECTED</h3>
          </div>
          {mockCollisions.map((collision) => (
            <div key={collision.id} className="text-sm text-warning-foreground font-medium">
              {collision.developers.join(' and ')} are both editing {collision.file}
            </div>
          ))}
          <p className="text-xs text-warning-foreground mt-1 opacity-75">
            System detected file-level collision from chat analysis
          </p>
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

      {/* Team Summary with Status Detection Logic */}
      <div className="bg-card rounded-lg border p-6">
        <h3 className="font-semibold text-foreground mb-2 flex items-center gap-2">
          <Users className="w-5 h-5" />
          Status Detection Logic
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          AI analyzes chat patterns to detect developer states in real-time
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-status-flow-bg border border-status-flow/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-status-flow"></div>
              <span className="font-medium text-status-flow">🟢 Flow State</span>
            </div>
            <p className="text-xs text-foreground">Quick solutions, steady progress</p>
            <div className="text-lg font-bold text-status-flow mt-1">{project.statusDistribution.active}</div>
          </div>
          
          <div className="bg-status-slow-bg border border-status-slow/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-status-slow"></div>
              <span className="font-medium text-status-slow">🟡 Problem Solving</span>
            </div>
            <p className="text-xs text-foreground">Multiple iterations on same problem</p>
            <div className="text-lg font-bold text-status-slow mt-1">{project.statusDistribution.slow}</div>
          </div>
          
          <div className="bg-status-blocked-bg border border-status-blocked/20 rounded-lg p-3">
            <div className="flex items-center gap-2 mb-1">
              <div className="w-3 h-3 rounded-full bg-status-blocked"></div>
              <span className="font-medium text-status-blocked">🔴 Blocked</span>
            </div>
            <p className="text-xs text-foreground">Extended time on single issue</p>
            <div className="text-lg font-bold text-status-blocked mt-1">{project.statusDistribution.blocked}</div>
          </div>
        </div>
        
        <div className="bg-primary/5 border border-primary/20 rounded-lg p-3">
          <p className="text-sm text-primary font-medium">
            💡 When someone is stuck, the system identifies similar problems solved by teammates and suggests connections
          </p>
        </div>
      </div>
    </div>
  );
}