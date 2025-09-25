import { Clock, FileCode, GitBranch, MessageSquare, ChevronRight, ChevronDown, ChevronUp } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface WorkItem {
  id: string
  task: string
  file: string
  duration: string
  messages: number
  commits: number
  chatContext: string
  priority: 'high' | 'medium' | 'low'
}

interface Developer {
  id: number
  name: string
  avatar: string
  status: 'flow' | 'slow' | 'stuck'
  workItems: WorkItem[]
  totalMessages: number
  totalCommits: number
  currentContext: string
}

const developers: Developer[] = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    status: 'flow',
    totalMessages: 28,
    totalCommits: 5,
    currentContext: 'Implementing authentication flow with JWT tokens and refresh mechanism',
    workItems: [
      {
        id: '1-1',
        task: 'JWT token implementation',
        file: 'auth/jwt.service.ts',
        duration: '45 min',
        messages: 12,
        commits: 3,
        chatContext: 'Working on token validation and refresh logic',
        priority: 'high'
      },
      {
        id: '1-2',
        task: 'Auth middleware setup',
        file: 'middleware/auth.middleware.ts',
        duration: '20 min',
        messages: 8,
        commits: 1,
        chatContext: 'Adding route protection and user context',
        priority: 'medium'
      },
      {
        id: '1-3',
        task: 'Login component UI',
        file: 'components/Login.tsx',
        duration: '15 min',
        messages: 5,
        commits: 1,
        chatContext: 'Styling form validation states',
        priority: 'low'
      },
      {
        id: '1-4',
        task: 'Password reset flow',
        file: 'auth/password-reset.service.ts',
        duration: '10 min',
        messages: 3,
        commits: 0,
        chatContext: 'Setting up email templates and flow',
        priority: 'medium'
      }
    ]
  },
  {
    id: 2,
    name: 'John Martinez',
    avatar: 'JM',
    status: 'stuck',
    totalMessages: 72,
    totalCommits: 2,
    currentContext: 'Debugging Stripe webhook integration issues with payment processing failures',
    workItems: [
      {
        id: '2-1',
        task: 'Stripe webhook failing',
        file: 'payments/webhook.handler.ts',
        duration: '2.5 hrs',
        messages: 47,
        commits: 0,
        chatContext: 'Webhook signature verification failing intermittently',
        priority: 'high'
      },
      {
        id: '2-2',
        task: 'Payment retry logic',
        file: 'payments/retry.service.ts',
        duration: '45 min',
        messages: 15,
        commits: 1,
        chatContext: 'Implementing exponential backoff for failed payments',
        priority: 'high'
      },
      {
        id: '2-3',
        task: 'Invoice generation',
        file: 'payments/invoice.generator.ts',
        duration: '30 min',
        messages: 8,
        commits: 1,
        chatContext: 'PDF generation working, formatting needs adjustment',
        priority: 'medium'
      },
      {
        id: '2-4',
        task: 'Payment dashboard',
        file: 'components/PaymentDashboard.tsx',
        duration: '10 min',
        messages: 2,
        commits: 0,
        chatContext: 'Sketching out metrics display layout',
        priority: 'low'
      }
    ]
  },
  {
    id: 3,
    name: 'Mike Thompson',
    avatar: 'MT',
    status: 'slow',
    totalMessages: 45,
    totalCommits: 3,
    currentContext: 'Database optimization and schema refactoring for better performance',
    workItems: [
      {
        id: '3-1',
        task: 'User table refactoring',
        file: 'database/schema.sql',
        duration: '1.2 hrs',
        messages: 23,
        commits: 1,
        chatContext: 'Adding indexes and optimizing queries for user lookup',
        priority: 'high'
      },
      {
        id: '3-2',
        task: 'Migration scripts',
        file: 'migrations/001_user_refactor.sql',
        duration: '40 min',
        messages: 12,
        commits: 1,
        chatContext: 'Testing data migration with large datasets',
        priority: 'high'
      },
      {
        id: '3-3',
        task: 'Performance monitoring',
        file: 'utils/db-monitor.ts',
        duration: '25 min',
        messages: 7,
        commits: 1,
        chatContext: 'Setting up query performance tracking',
        priority: 'medium'
      },
      {
        id: '3-4',
        task: 'Connection pooling',
        file: 'config/database.config.ts',
        duration: '15 min',
        messages: 3,
        commits: 0,
        chatContext: 'Configuring optimal pool size for production',
        priority: 'low'
      }
    ]
  },
  {
    id: 4,
    name: 'Emma Davis',
    avatar: 'ED',
    status: 'flow',
    totalMessages: 35,
    totalCommits: 6,
    currentContext: 'Building comprehensive product management API with full CRUD operations',
    workItems: [
      {
        id: '4-1',
        task: 'Product CRUD endpoints',
        file: 'api/products.controller.ts',
        duration: '30 min',
        messages: 8,
        commits: 2,
        chatContext: 'Implementing product search and filtering',
        priority: 'high'
      },
      {
        id: '4-2',
        task: 'Product validation',
        file: 'validators/product.validator.ts',
        duration: '25 min',
        messages: 12,
        commits: 2,
        chatContext: 'Adding comprehensive input validation rules',
        priority: 'medium'
      },
      {
        id: '4-3',
        task: 'Product categories',
        file: 'api/categories.controller.ts',
        duration: '20 min',
        messages: 9,
        commits: 1,
        chatContext: 'Implementing hierarchical category structure',
        priority: 'medium'
      },
      {
        id: '4-4',
        task: 'Product testing',
        file: 'tests/products.test.ts',
        duration: '15 min',
        messages: 6,
        commits: 1,
        chatContext: 'Writing comprehensive unit tests for endpoints',
        priority: 'low'
      }
    ]
  }
]

function DeveloperStatus () {
  const [expandedDevs, setExpandedDevs] = useState<Set<number>>(new Set([1, 2])) // Default expand first two developers

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'flow':
        return 'default'
      case 'slow':
        return 'secondary'
      case 'stuck':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flow':
        return 'bg-status-flow/10 text-status-flow border-status-flow/20'
      case 'slow':
        return 'bg-status-slow/10 text-status-slow border-status-slow/20'
      case 'stuck':
        return 'bg-status-blocked/10 text-status-blocked border-status-blocked/20'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'flow':
        return 'bg-status-flow'
      case 'slow':
        return 'bg-status-slow'
      case 'stuck':
        return 'bg-status-blocked'
      default:
        return 'bg-muted-foreground'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200 bg-red-50 text-red-700'
      case 'medium':
        return 'border-yellow-200 bg-yellow-50 text-yellow-700'
      case 'low':
        return 'border-green-200 bg-green-50 text-green-700'
      default:
        return 'border-gray-200 bg-gray-50 text-gray-700'
    }
  }

  const toggleDeveloper = (devId: number) => {
    const newExpanded = new Set(expandedDevs)
    if (newExpanded.has(devId)) {
      newExpanded.delete(devId)
    } else {
      newExpanded.add(devId)
    }
    setExpandedDevs(newExpanded)
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Live Team Status</CardTitle>
          <Button variant="ghost" size="sm">
            View Detailed
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <TooltipProvider>
          {developers.map((dev, index) => (
            <div key={dev.id} className="space-y-3">
              {/* Developer Header */}
              <div
                className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition-colors cursor-pointer"
                onClick={() => toggleDeveloper(dev.id)}
              >
                <div className="flex items-center gap-4">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className={cn(
                      'text-sm font-medium border',
                      getStatusColor(dev.status)
                    )}>
                      {dev.avatar}
                    </AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{dev.name}</h3>
                      <Badge variant={getStatusVariant(dev.status)} className="gap-1.5">
                        <span className={cn(
                          'h-1.5 w-1.5 rounded-full',
                          getStatusDotColor(dev.status)
                        )} />
                        {dev.status.charAt(0).toUpperCase() + dev.status.slice(1)}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {dev.currentContext}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1">
                          <MessageSquare className="h-4 w-4" />
                          <span>{dev.totalMessages}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total messages today</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger>
                        <div className="flex items-center gap-1">
                          <GitBranch className="h-4 w-4" />
                          <span>{dev.totalCommits}</span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Total commits today</p>
                      </TooltipContent>
                    </Tooltip>

                    <Badge variant="outline" className="text-xs">
                      {dev.workItems.length} tasks
                    </Badge>
                  </div>

                  <Button variant="ghost" size="sm">
                    {expandedDevs.has(dev.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>

              {/* Expanded Work Items */}
              {expandedDevs.has(dev.id) && (
                <div className="ml-6 space-y-3">
                  {dev.workItems.map((item, itemIndex) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 rounded-lg border border-l-4 bg-card/50 hover:bg-card transition-colors",
                        getPriorityColor(item.priority).split(' ')[0] // Get just the border color
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{item.task}</h4>
                            <Badge
                              variant="outline"
                              className={cn("text-xs", getPriorityColor(item.priority))}
                            >
                              {item.priority}
                            </Badge>
                          </div>

                          <p className="text-sm text-muted-foreground mb-3">
                            {item.chatContext}
                          </p>

                          <div className="flex items-center gap-2 mb-2">
                            <FileCode className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs font-mono text-muted-foreground">
                              {item.file}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-4 text-xs text-muted-foreground ml-4">
                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{item.duration}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Time spent on this task</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <MessageSquare className="h-3 w-3" />
                                <span>{item.messages}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Messages for this task</p>
                            </TooltipContent>
                          </Tooltip>

                          <Tooltip>
                            <TooltipTrigger>
                              <div className="flex items-center gap-1">
                                <GitBranch className="h-3 w-3" />
                                <span>{item.commits}</span>
                              </div>
                            </TooltipTrigger>
                            <TooltipContent>
                              <p>Commits for this task</p>
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Separator between developers */}
              {index < developers.length - 1 && <Separator className="my-4" />}
            </div>
          ))}
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

export default DeveloperStatus
