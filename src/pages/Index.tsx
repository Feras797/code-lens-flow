import { useState } from 'react';
import { Dashboard } from '@/components/Dashboard';
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
        <Dashboard onProjectSelect={handleProjectSelect} />
      )}
    </div>
  );
};

export default Index;
