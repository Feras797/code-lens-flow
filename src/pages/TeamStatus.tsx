import { AlertTriangle, Users, Clock, FileCode, GitPullRequest, Activity, MessageSquare, GitBranch, ChevronDown, ChevronUp } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

function TeamStatus () {
  const [expandedDevs, setExpandedDevs] = useState<Set<number>>(new Set([1, 2])) // Default expand first two developers

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

  const toggleDeveloper = (devId: number) => {
    const newExpanded = new Set(expandedDevs)
    if (newExpanded.has(devId)) {
      newExpanded.delete(devId)
    } else {
      newExpanded.add(devId)
    }
    setExpandedDevs(newExpanded)
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-red-200/30 text-red-300/70'
      case 'medium':
        return 'border-yellow-200/30 text-yellow-300/70'
      case 'low':
        return 'border-green-200/30 text-green-300/70'
      default:
        return 'border-border text-muted-foreground'
    }
  }

  const collisions = [
    {
      type: 'FILE COLLISION',
      severity: 'HIGH',
      message: 'Multiple developers editing the same file',
      detail: 'Sarah Chen and You are both working on auth.js',
      affected: ['Sarah Chen', 'You'],
      suggestion: 'Suggest Resolution',
      acknowledge: 'Acknowledge'
    }
  ]

  const getStatusDot = (status: string) => {
    switch (status) {
      case 'flow': return 'bg-status-flow'
      case 'slow': return 'bg-status-slow'
      case 'stuck': return 'bg-status-blocked'
      default: return 'bg-muted'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'flow': return 'IN FLOW'
      case 'slow': return 'PROBLEM SOLVING'
      case 'stuck': return 'BLOCKED'
      default: return status.toUpperCase()
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'flow': return 'text-status-flow'
      case 'slow': return 'text-status-slow'
      case 'stuck': return 'text-status-blocked'
      default: return 'text-muted-foreground'
    }
  }

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Live Team Status Board</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time visibility into what every developer is working on, extracted from Claude Code conversations
          </p>
        </div>
        <button className='px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors'>
          Auto-refresh
        </button>
      </div>


      {/* Active Collisions */}
      {collisions.length > 0 && (
        <div className='space-y-4'>
          <h2 className='text-lg font-semibold text-foreground flex items-center gap-2'>
            <AlertTriangle className='h-5 w-5 text-muted-foreground' />
            Active Collisions
          </h2>
          {collisions.map((collision, index) => (
            <div key={index} className='bg-card border border-border rounded-xl p-4'>
              <div className='flex items-start justify-between'>
                <div className='flex-1'>
                  <div className='flex items-center gap-3 mb-2'>
                    <div className='p-1.5 rounded-lg bg-background'>
                      <FileCode className='h-4 w-4 text-muted-foreground' />
                    </div>
                    <span className='text-sm font-semibold text-foreground'>{collision.type}</span>
                    <span className='px-2 py-0.5 bg-background text-muted-foreground text-xs rounded-full border border-border'>
                      {collision.severity}
                    </span>
                  </div>
                  <p className='text-sm text-foreground mb-1'>{collision.detail}</p>
                  <p className='text-xs text-muted-foreground mb-3'>{collision.message}</p>
                  <div className='flex items-center gap-2 mb-3'>
                    <span className='text-xs text-muted-foreground'>Involved:</span>
                    {collision.affected.map((person, i) => (
                      <span key={i} className='px-2 py-1 bg-background/50 rounded-lg text-xs'>
                        {person}
                      </span>
                    ))}
                  </div>
                  <div className='flex gap-2'>
                    <button className='px-3 py-1.5 bg-primary text-primary-foreground text-sm rounded-lg hover:bg-primary/90 transition-colors'>
                      {collision.suggestion}
                    </button>
                    <button className='px-3 py-1.5 bg-background text-foreground text-sm rounded-lg hover:bg-background/80 transition-colors'>
                      {collision.acknowledge}
                    </button>
                  </div>
                </div>
                <button className='text-muted-foreground hover:text-foreground'>
                  ✕
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Header with Status Explainers */}
      <div className='space-y-6'>
        {/* Header Section with Title and Status Explainers */}
        <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6'>
          <div>
            <h2 className='text-lg font-semibold text-foreground'>TEAM STATUS - E-Commerce Platform</h2>
          </div>

          <div className='flex flex-col sm:flex-row gap-4'>
            <div className='bg-card border border-border rounded-lg p-3 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-status-flow' />
              <div>
                <span className='text-sm font-medium text-foreground'>Flow State</span>
                <p className='text-xs text-muted-foreground'>Quick solutions, steady progress</p>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-3 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-status-slow' />
              <div>
                <span className='text-sm font-medium text-foreground'>Problem Solving</span>
                <p className='text-xs text-muted-foreground'>Multiple iterations, debugging</p>
              </div>
            </div>

            <div className='bg-card border border-border rounded-lg p-3 flex items-center gap-2'>
              <div className='h-2 w-2 rounded-full bg-status-blocked' />
              <div>
                <span className='text-sm font-medium text-foreground'>Blocked</span>
                <p className='text-xs text-muted-foreground'>Extended time, needs help</p>
              </div>
            </div>
          </div>
        </div>

        {/* Enhanced Team Status */}
        <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <div className='p-6 space-y-6'>
          {developers.map((dev, index) => (
            <div key={dev.id} className="space-y-4">
              {/* Developer Header - Minimal Style */}
              <div
                className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-background/30 transition-colors cursor-pointer"
                onClick={() => toggleDeveloper(dev.id)}
              >
                <div className="flex items-center gap-4">
                  <div className={cn(
                    'h-10 w-10 rounded-full flex items-center justify-center text-sm font-medium border border-border',
                    'text-foreground bg-card'
                  )}>
                    {dev.avatar}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-foreground">{dev.name}</h3>
                      <div className="flex items-center gap-2">
                        <span className={cn('h-1.5 w-1.5 rounded-full', getStatusDot(dev.status))} />
                        <span className="text-sm text-muted-foreground">
                          {getStatusText(dev.status)}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground max-w-2xl">
                      {dev.currentContext}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <MessageSquare className="h-4 w-4" />
                      <span>{dev.totalMessages}</span>
                    </div>

                    <div className="flex items-center gap-1">
                      <GitBranch className="h-4 w-4" />
                      <span>{dev.totalCommits}</span>
                    </div>

                    <span className="px-2 py-1 bg-background/50 rounded text-xs border border-border">
                      {dev.workItems.length} tasks
                    </span>
                  </div>

                  {expandedDevs.has(dev.id) ? (
                    <ChevronUp className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  )}
                </div>
              </div>

              {/* Expanded Work Items - Minimal Style */}
              {expandedDevs.has(dev.id) && (
                <div className="ml-6 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {dev.workItems.map((item) => (
                    <div
                      key={item.id}
                      className={cn(
                        "p-4 border border-l-4 rounded-lg hover:bg-background/30 transition-colors",
                        getPriorityColor(item.priority).split(' ')[0] // Get just the border color
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <h4 className="font-medium text-foreground">{item.task}</h4>
                            <span className={cn(
                              "px-2 py-0.5 text-xs rounded border",
                              getPriorityColor(item.priority)
                            )}>
                              {item.priority}
                            </span>
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
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{item.duration}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <MessageSquare className="h-3 w-3" />
                            <span>{item.messages}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <GitBranch className="h-3 w-3" />
                            <span>{item.commits}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Separator between developers */}
              {index < developers.length - 1 && (
                <div className="border-b border-border/50"></div>
              )}
            </div>
          ))}
          </div>
        </div>
      </div>

    </div>
  )
}

export default TeamStatus
