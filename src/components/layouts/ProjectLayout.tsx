import { useEffect } from 'react'
import { Outlet, useParams } from 'react-router-dom'
import { TopNavigation } from '@/components/navigation/TopNavigation'
import { useProject } from '@/contexts/ProjectContext'

function ProjectLayout() {
  const { projectId } = useParams<{ projectId: string }>()
  const { currentProject, selectProject } = useProject()

  // Auto-select project when entering project route
  useEffect(() => {
    if (projectId && (!currentProject || currentProject.id !== projectId)) {
      selectProject(projectId)
    }
  }, [projectId, currentProject, selectProject])

  if (!currentProject) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
          <p className="mt-4 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <TopNavigation />
      <main className="container mx-auto">
        <div className="h-full">
          <Outlet />
        </div>
      </main>
    </div>
  )
}

export default ProjectLayout