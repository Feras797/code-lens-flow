import { useState } from 'react';
import { ArrowLeft, RefreshCw, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { TeamStatus } from '@/components/sections/TeamStatus';
import { Coordination } from '@/components/sections/Coordination';
import { PersonalInsights } from '@/components/sections/PersonalInsights';
import { DevelopmentCoach } from '@/components/sections/DevelopmentCoach';
import { TeamKnowledge } from '@/components/sections/TeamKnowledge';
import { Project } from '@/types';

interface ProjectViewProps {
  project: Project;
  onBack: () => void;
}

type Section = 'status' | 'coordination' | 'insights' | 'coach' | 'knowledge';

export function ProjectView({ project, onBack }: ProjectViewProps) {
  const [activeSection, setActiveSection] = useState<Section>('status');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsRefreshing(false);
  };

  const sections = [
    { id: 'status' as Section, label: 'Status' },
    { id: 'coordination' as Section, label: 'Coordination' },
    { id: 'insights' as Section, label: 'Insights' },
    { id: 'coach' as Section, label: 'Coach' },
    { id: 'knowledge' as Section, label: 'Knowledge' },
  ];

  const onlineDevelopers = project.developers.filter(d => d.status === 'flow').length;

  const renderSection = () => {
    switch (activeSection) {
      case 'status':
        return <TeamStatus project={project} />;
      case 'coordination':
        return <Coordination project={project} />;
      case 'insights':
        return <PersonalInsights />;
      case 'coach':
        return <DevelopmentCoach />;
      case 'knowledge':
        return <TeamKnowledge />;
      default:
        return <TeamStatus project={project} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={onBack}
                className="gap-2"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </Button>
              
              <div>
                <h1 className="text-2xl font-bold text-foreground">{project.name}</h1>
                <div className="flex items-center gap-4 mt-1">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <div className="w-2 h-2 rounded-full bg-status-flow"></div>
                    <Users className="w-4 h-4" />
                    <span>{onlineDevelopers} online</span>
                  </div>
                  <span className="text-sm text-muted-foreground">
                    Updated {project.lastRefresh}
                  </span>
                </div>
              </div>
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
      </header>

      {/* Progress bar during refresh */}
      {isRefreshing && (
        <div className="h-1 bg-muted">
          <div className="h-full bg-primary w-full animate-pulse"></div>
        </div>
      )}

      {/* Section Navigation */}
      <nav className="border-b bg-card sticky top-16 z-10">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex space-x-8">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`py-4 text-sm font-medium border-b-2 transition-colors ${
                  activeSection === section.id
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </div>
      </nav>

      {/* Main content */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        {renderSection()}
      </main>
    </div>
  );
}