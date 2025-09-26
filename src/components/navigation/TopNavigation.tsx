import { NavLink, useParams, useNavigate, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  Activity,
  Brain,
  BookOpen,
  ChevronLeft,
  Settings
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useProject } from '@/contexts/ProjectContext'
import { ProjectNavItem } from '@/types/project'
import { Button } from '@/components/ui/button'

const navigationItems: ProjectNavItem[] = [
  {
    name: 'Home',
    href: '/dashboard',
    icon: LayoutDashboard,
    step: 1,
    completed: true
  },
  {
    name: 'Team Status',
    href: '/team-status',
    icon: Users,
    step: 2,
    completed: false
  },
  {
    name: 'Personal Insights',
    href: '/insights',
    icon: Activity,
    step: 3,
    completed: false
  },
  {
    name: 'Development Coach',
    href: '/coach',
    icon: Brain,
    step: 4,
    completed: false
  },
  {
    name: 'Knowledge Base',
    href: '/knowledge',
    icon: BookOpen,
    step: 5,
    completed: false
  }
]

export function TopNavigation() {
  const { projectId } = useParams<{ projectId: string }>()
  const location = useLocation()
  const navigate = useNavigate()
  const { currentProject } = useProject()

  const handleBackToProjects = () => {
    navigate('/projects')
  }

  if (!currentProject || !projectId) {
    return null
  }

  const currentNavItem = navigationItems.find(item =>
    location.pathname.includes(item.href)
  )

  const currentStep = currentNavItem?.step || 1
  const totalSteps = navigationItems.length

  return (
    <div className="bg-background border-b border-border">
      {/* Top section with back button and project info */}
      <div className="flex items-center justify-between px-6 py-4">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackToProjects}
            className="gap-2 text-muted-foreground hover:text-blue-400 hover:bg-blue-500/10"
          >
            <ChevronLeft className="h-4 w-4" />
            Back to Projects
          </Button>
          <div className="h-4 w-px bg-border" />
          <div>
            <h1 className="text-xl font-semibold text-foreground">
              {currentProject.name}
            </h1>
            <p className="text-sm text-muted-foreground">
              {currentProject.description}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="text-sm text-muted-foreground">
            Step {currentStep} of {totalSteps}
          </div>
          <Button variant="ghost" size="sm">
            <Settings className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Navigation tabs */}
      <div className="px-6">
        <nav className="flex space-x-1 bg-muted/30 rounded-lg p-1">
          {navigationItems.map((item, index) => {
            const Icon = item.icon
            const isActive = location.pathname.includes(item.href)
            const isCompleted = item.completed
            const isPast = item.step < currentStep
            const isCurrent = item.step === currentStep

            return (
              <NavLink
                key={item.name}
                to={`/project/${projectId}${item.href}`}
                className={cn(
                  'relative flex items-center gap-3 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200',
                  'hover:bg-background/80 hover:text-foreground',
                  isActive
                    ? 'bg-background text-foreground shadow-sm border border-border'
                    : 'text-muted-foreground'
                )}
              >
                {/* Step indicator */}
                <div className={cn(
                  'flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold',
                  isActive || isPast || isCompleted
                    ? 'bg-blue-500 text-white'
                    : isCurrent
                    ? 'bg-blue-500/20 text-blue-400 border-2 border-blue-500'
                    : 'bg-muted text-muted-foreground'
                )}>
                  {item.step}
                </div>

                {/* Icon and label */}
                <div className="flex items-center gap-2">
                  <Icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.name}</span>
                </div>

                {/* Active indicator */}
                {isActive && (
                  <div className="absolute inset-x-0 bottom-0 h-0.5 bg-blue-500 rounded-full" />
                )}

                {/* Progress connector line */}
                {index < navigationItems.length - 1 && (
                  <div className={cn(
                    'absolute left-full top-1/2 w-8 h-px -translate-y-1/2 -translate-x-4',
                    isPast || (isCurrent && isCompleted)
                      ? 'bg-blue-500'
                      : 'bg-border'
                  )} />
                )}
              </NavLink>
            )
          })}
        </nav>
      </div>
    </div>
  )
}