import { useState } from 'react';
import { RefreshCw, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
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
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const totalActive = projects.reduce((sum, p) => sum + p.statusDistribution.active, 0);
  const totalCollisions = projects.filter(p => p.hasCollisions).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Lense Analytics</h1>
              <p className="text-muted-foreground mt-1">
                AI-powered development team coordination
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-status-flow"></div>
                  <span className="text-muted-foreground">{totalActive} Active</span>
                </div>
                {totalCollisions > 0 && (
                  <div className="flex items-center gap-2 text-warning">
                    <AlertTriangle className="w-4 h-4" />
                    <span>{totalCollisions} Collision{totalCollisions > 1 ? 's' : ''}</span>
                  </div>
                )}
              </div>
              
              <Button
                onClick={handleRefresh}
                disabled={isRefreshing}
                size="sm"
                className="gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Progress bar during refresh */}
      {isRefreshing && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary w-full animate-pulse"></div>
        </div>
      )}

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onClick={() => onProjectSelect(project)}
            />
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <RefreshCw className="w-6 h-6 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-medium text-foreground mb-2">No Projects Yet</h3>
            <p className="text-muted-foreground">
              Chat history will appear here after your first development session
            </p>
          </div>
        )}
      </main>
    </div>
  );
}