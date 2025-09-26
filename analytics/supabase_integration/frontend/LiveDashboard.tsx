import { useState } from 'react'
import {
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  GitBranch,
  Zap,
  Activity,
  Loader2
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { MetricCard } from '@/components/dashboard/MetricCard'
import { useProjects } from '@/hooks/useProjects'
import { LiveTeamStatus } from '@/components/LiveTeamStatus'

function LiveDashboard() {
  const [activeTab, setActiveTab] = useState('resolve')
  const [selectedProjectId, setSelectedProjectId] = useState<string>('')
  
  const { data: projectsData, isLoading, error } = useProjects()

  // Auto-select first project if none selected
  if (!selectedProjectId && projectsData?.projects?.length > 0) {
    setSelectedProjectId(projectsData.projects[0].id)
  }

  const selectedProject = projectsData?.projects?.find(p => p.id === selectedProjectId)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <Loader2 className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-foreground-muted">Loading projects...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center space-y-4">
          <AlertTriangle className="w-12 h-12 mx-auto text-destructive" />
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-2">
              Failed to load projects
            </h3>
            <p className="text-foreground-muted mb-4">
              {error instanceof Error ? error.message : 'Unknown error occurred'}
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    )
  }

  const totalDevelopers = projectsData?.projects?.reduce((sum, p) => sum + p.activeDevelopers, 0) || 0
  const totalCollisions = projectsData?.projects?.reduce((sum, p) => p.hasCollisions ? sum + 1 : sum, 0) || 0
  
  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Live Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time development team coordination powered by Claude chat analysis
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-status-flow border-status-flow/30 bg-status-flow/5">
            <div className='h-2 w-2 rounded-full bg-status-flow animate-pulse' />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Project Selector */}
      {projectsData?.projects && projectsData.projects.length > 0 && (
        <div className="flex items-center gap-4">
          <label className="text-sm font-medium text-foreground">Project:</label>
          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="px-3 py-2 border border-border rounded-lg bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {projectsData.projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title="Active Developers"
          value={totalDevelopers}
          description={`Across ${projectsData?.projects?.length || 0} projects`}
          trend={{ value: `+${totalDevelopers}`, isPositive: totalDevelopers > 0 }}
          icon={<Users className='h-5 w-5' />}
          variant="success"
        />
        <MetricCard
          title="Active Collisions"
          value={totalCollisions}
          description="Detected from chat analysis"
          trend={{ value: totalCollisions > 0 ? `${totalCollisions}` : "0", isPositive: totalCollisions === 0 }}
          icon={<AlertTriangle className='h-5 w-5' />}
          variant={totalCollisions > 0 ? "warning" : "success"}
        />
        <MetricCard
          title="Projects Monitored"
          value={projectsData?.projects?.length || 0}
          description="With recent activity"
          trend={{ value: `${projectsData?.projects?.length || 0}`, isPositive: true }}
          icon={<Clock className='h-5 w-5' />}
          variant="success"
        />
        <MetricCard
          title="Live Updates"
          value="15s"
          description="Refresh interval"
          trend={{ value: "Real-time", isPositive: true }}
          icon={<TrendingUp className='h-5 w-5' />}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Button
          variant="outline"
          onClick={() => setActiveTab('resolve')}
          className={cn(
            'h-auto p-4 justify-start gap-3 group transition-all duration-200',
            activeTab === 'resolve'
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 shadow-md hover:bg-blue-500/15 hover:border-blue-500/60'
              : 'hover:border-blue-400/40 hover:bg-blue-500/5'
          )}
        >
          <Zap className={cn(
            'h-5 w-5 group-hover:scale-110 transition-transform',
            activeTab === 'resolve' ? 'text-blue-500' : 'text-primary'
          )} />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>Resolve Collision</p>
            <p className='text-xs text-muted-foreground'>{totalCollisions} active conflicts</p>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('insights')}
          className={cn(
            'h-auto p-4 justify-start gap-3 group transition-all duration-200',
            activeTab === 'insights'
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 shadow-md hover:bg-blue-500/15 hover:border-blue-500/60'
              : 'hover:border-blue-400/40 hover:bg-blue-500/5'
          )}
        >
          <Activity className={cn(
            'h-5 w-5 transition-colors',
            activeTab === 'insights'
              ? 'text-blue-500'
              : 'text-muted-foreground group-hover:text-primary'
          )} />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>View Insights</p>
            <p className='text-xs text-muted-foreground'>Personal patterns</p>
          </div>
        </Button>
        <Button
          variant="outline"
          onClick={() => setActiveTab('knowledge')}
          className={cn(
            'h-auto p-4 justify-start gap-3 group transition-all duration-200',
            activeTab === 'knowledge'
              ? 'bg-blue-500/10 border-blue-500/50 text-blue-600 shadow-md hover:bg-blue-500/15 hover:border-blue-500/60'
              : 'hover:border-blue-400/40 hover:bg-blue-500/5'
          )}
        >
          <GitBranch className={cn(
            'h-5 w-5 transition-colors',
            activeTab === 'knowledge'
              ? 'text-blue-500'
              : 'text-muted-foreground group-hover:text-primary'
          )} />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>Knowledge Base</p>
            <p className='text-xs text-muted-foreground'>Solutions from chat history</p>
          </div>
        </Button>
      </div>

      {/* Live Team Status */}
      {selectedProjectId && (
        <div className="space-y-4">
          <h2 className="text-2xl font-semibold text-foreground">
            {selectedProject?.name} Team Status
          </h2>
          <LiveTeamStatus projectId={selectedProjectId} />
        </div>
      )}

      {/* Empty State */}
      {!projectsData?.projects?.length && (
        <div className="text-center py-12">
          <Activity className="w-12 h-12 mx-auto text-foreground-muted mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            No projects found
          </h3>
          <p className="text-foreground-muted">
            Start a conversation with Claude in your project to see team activity here.
          </p>
        </div>
      )}
    </div>
  )
}

export default LiveDashboard
