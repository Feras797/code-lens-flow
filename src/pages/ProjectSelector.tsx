import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Plus,
  Search,
  Clock,
  Users,
  Activity,
  Folder,
  Settings,
  MoreVertical
} from 'lucide-react'
import { useProject } from '@/contexts/ProjectContext'
import { Project } from '@/types/project'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'

function ProjectSelector() {
  const { projects, loading, selectProject } = useProject()
  const navigate = useNavigate()
  const [searchQuery, setSearchQuery] = useState('')
  const [view, setView] = useState<'grid' | 'list'>('grid')

  const filteredProjects = projects.filter(project =>
    project.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    project.description.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const recentProjects = projects
    .filter(p => p.status === 'active')
    .sort((a, b) => new Date(b.lastActivity || 0).getTime() - new Date(a.lastActivity || 0).getTime())
    .slice(0, 3)

  const handleProjectSelect = (project: Project) => {
    // Only allow selection of Code Lens Flow project
    if (project.name !== 'Code Lens Flow') return
    
    selectProject(project.id)
    navigate(`/project/${project.id}/dashboard`)
  }

  const isCodeLensFlow = (project: Project) => project.name === 'Code Lens Flow'

  const getStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500'
      case 'paused':
        return 'bg-yellow-500'
      case 'archived':
        return 'bg-gray-500'
      default:
        return 'bg-blue-500'
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-foreground">Projects</h1>
              <p className="text-muted-foreground mt-1">
                Select a project to continue your development workflow
              </p>
            </div>
            <div className="flex items-center gap-3">
              {/* Team Activity Indicator */}
              <div className='bg-card border border-border rounded-lg px-4 py-2'>
                <div className='flex items-center gap-4'>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs font-medium text-muted-foreground'>Team Activity</span>
                    <div className='flex items-center gap-1'>
                      <div className='h-2 w-2 rounded-full bg-status-flow animate-pulse' />
                      <span className='text-xs text-status-flow'>Live</span>
                    </div>
                  </div>
                  <div className='flex items-center gap-3 text-xs'>
                    <div className='flex items-center gap-1'>
                      <div className='h-2 w-2 rounded-full bg-status-flow' />
                      <span className='text-muted-foreground'>9 Active</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div className='h-2 w-2 rounded-full bg-status-slow' />
                      <span className='text-muted-foreground'>2 Slow</span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <div className='h-2 w-2 rounded-full bg-status-blocked' />
                      <span className='text-muted-foreground'>1 Stuck</span>
                    </div>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setView(view === 'grid' ? 'list' : 'grid')}
              >
                <Folder className="h-4 w-4 mr-2" />
                {view === 'grid' ? 'List' : 'Grid'} View
              </Button>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                New Project
              </Button>
            </div>
          </div>

          {/* Search */}
          <div className="mt-6 max-w-md">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search projects..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-6">
        {/* Recent Projects */}
        {recentProjects.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-foreground mb-4">Recent Projects</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recentProjects.map((project) => (
                <Card
                  key={project.id}
                  className={cn(
                    "transition-all duration-200",
                    isCodeLensFlow(project)
                      ? "cursor-pointer hover:shadow-md hover:border-primary/50"
                      : "opacity-50 cursor-not-allowed"
                  )}
                  onClick={() => handleProjectSelect(project)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center text-white font-semibold text-sm"
                          style={{ backgroundColor: project.color || '#3b82f6' }}
                        >
                          {getInitials(project.name)}
                        </div>
                        <div>
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          <div className="flex items-center gap-1 mt-1">
                            <div className={cn('w-2 h-2 rounded-full', getStatusColor(project.status))} />
                            <span className="text-xs text-muted-foreground capitalize">
                              {project.status}
                            </span>
                          </div>
                        </div>
                      </div>
                      {isCodeLensFlow(project) && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Settings className="h-4 w-4 mr-2" />
                              Settings
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-destructive">
                              Archive Project
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {project.description}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {project.teamMembers} members
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {project.lastActivity ? new Date(project.lastActivity).toLocaleDateString() : 'Never'}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All Projects */}
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-foreground">All Projects</h2>
          <div className="text-sm text-muted-foreground">
            {filteredProjects.length} of {projects.length} projects
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto" />
            <p className="mt-4 text-muted-foreground">Loading projects...</p>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-12">
            <Folder className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium text-foreground mb-2">No projects found</h3>
            <p className="text-muted-foreground mb-4">
              {searchQuery ? 'Try adjusting your search terms' : 'Get started by creating your first project'}
            </p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Project
            </Button>
          </div>
        ) : (
          <div className={cn(
            'grid gap-4',
            view === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
          )}>
            {filteredProjects.map((project) => (
              <Card
                key={project.id}
                className={cn(
                  "transition-all duration-200",
                  isCodeLensFlow(project)
                    ? "cursor-pointer hover:shadow-md hover:border-primary/50"
                    : "opacity-50 cursor-not-allowed"
                )}
                onClick={() => handleProjectSelect(project)}
              >
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-semibold"
                        style={{ backgroundColor: project.color || '#3b82f6' }}
                      >
                        {getInitials(project.name)}
                      </div>
                      <div>
                        <CardTitle>{project.name}</CardTitle>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge
                            variant={project.status === 'active' ? 'default' : 'secondary'}
                            className="text-xs"
                          >
                            {project.status}
                          </Badge>
                          {project.owner && (
                            <span className="text-xs text-muted-foreground">
                              by {project.owner}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {isCodeLensFlow(project) && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>
                            <Settings className="h-4 w-4 mr-2" />
                            Settings
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-destructive">
                            Archive Project
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <CardDescription className="mb-4">
                    {project.description}
                  </CardDescription>
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        {project.teamMembers}
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="h-4 w-4" />
                        Active
                      </div>
                    </div>
                    <div className="text-xs">
                      Updated {new Date(project.updatedAt).toLocaleDateString()}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProjectSelector