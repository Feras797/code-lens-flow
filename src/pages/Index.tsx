import { useState } from 'react';
import { Home } from '@/components/Dashboard';
import { ProjectView } from '@/components/ProjectView';
import { Project } from '@/types';

const Index = () => {
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const handleProjectSelect = (project: Project) => {
    setSelectedProject(project);
  };

  const handleBack = () => {
    setSelectedProject(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {selectedProject ? (
        <ProjectView project={selectedProject} onBack={handleBack} />
      ) : (
        <Home onProjectSelect={handleProjectSelect} />
      )}
    </div>
  );
};

export default Index;
