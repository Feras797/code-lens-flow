import { AlertTriangle, Users, Clock, FileCode, GitPullRequest, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

function TeamStatus () {
  const teamStatus = [
    { name: 'Sarah Chen', status: 'flow', work: 'JWT token implementation', file: 'auth.js', time: '45 min' },
    { name: 'John Martinez', status: 'stuck', work: 'Stripe webhook failing', file: 'payment.js', time: '2.5 hrs' },
    { name: 'Mike Thompson', status: 'slow', work: 'Refactoring user table', file: 'schema.sql', time: '1.2 hrs' },
    { name: 'Emma Davis', status: 'flow', work: 'Product CRUD endpoints', file: 'products.js', time: '30 min' },
    { name: 'You', status: 'flow', work: 'Analytics dashboard', file: 'auth.js', time: '1 hr' }
  ]

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

      {/* Status Summary */}
      <div className='grid grid-cols-3 gap-4'>
        <div className='bg-card border border-border rounded-xl p-4 text-center'>
          <div className='text-3xl font-bold text-foreground'>3</div>
          <div className='text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2'>
            <span className='h-1.5 w-1.5 rounded-full bg-status-flow' />
            IN FLOW
          </div>
        </div>
        <div className='bg-card border border-border rounded-xl p-4 text-center'>
          <div className='text-3xl font-bold text-foreground'>1</div>
          <div className='text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2'>
            <span className='h-1.5 w-1.5 rounded-full bg-status-slow' />
            PROBLEM SOLVING
          </div>
        </div>
        <div className='bg-card border border-border rounded-xl p-4 text-center'>
          <div className='text-3xl font-bold text-foreground'>1</div>
          <div className='text-sm text-muted-foreground mt-1 flex items-center justify-center gap-2'>
            <span className='h-1.5 w-1.5 rounded-full bg-status-blocked' />
            BLOCKED
          </div>
        </div>
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

      {/* Team Status Table */}
      <div className='bg-card border border-border rounded-xl overflow-hidden'>
        <div className='p-6 border-b border-border'>
          <h2 className='text-lg font-semibold text-foreground'>TEAM STATUS - E-Commerce Platform</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead className='bg-background/50'>
              <tr>
                <th className='text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Developer
                </th>
                <th className='text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Currently Working On
                </th>
                <th className='text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Status
                </th>
                <th className='text-left px-6 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wider'>
                  Duration
                </th>
              </tr>
            </thead>
            <tbody className='divide-y divide-border'>
              {teamStatus.map((dev, index) => (
                <tr key={index} className='hover:bg-background/30 transition-colors'>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-3'>
                      <div className={cn(
                        'h-8 w-8 rounded-full flex items-center justify-center text-xs font-medium bg-card border border-border',
                        'text-foreground'
                      )}>
                        {dev.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <span className='text-sm font-medium text-foreground'>{dev.name}</span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div>
                      <p className='text-sm text-foreground'>{dev.work}</p>
                      <p className='text-xs text-muted-foreground mt-1 font-mono'>{dev.file}</p>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <span className={cn('h-1.5 w-1.5 rounded-full', getStatusDot(dev.status))} />
                      <span className='text-sm text-muted-foreground'>
                        {getStatusText(dev.status)}
                      </span>
                    </div>
                  </td>
                  <td className='px-6 py-4'>
                    <div className='flex items-center gap-2'>
                      <Clock className='h-4 w-4 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>{dev.time}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Status Detection Logic */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <Activity className='h-5 w-5' />
          Status Detection Logic
        </h2>
        <p className='text-sm text-muted-foreground mb-4'>
          AI analyzes chat patterns to detect developer states in real-time
        </p>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          <div className='bg-card border border-border rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='h-2 w-2 rounded-full bg-status-flow' />
              <span className='text-sm font-medium text-foreground'>Flow State</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Quick solutions, steady progress, consistent momentum
            </p>
          </div>
          <div className='bg-card border border-border rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='h-2 w-2 rounded-full bg-status-slow' />
              <span className='text-sm font-medium text-foreground'>Problem Solving</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Multiple iterations, debugging, exploring solutions
            </p>
          </div>
          <div className='bg-card border border-border rounded-lg p-4'>
            <div className='flex items-center gap-2 mb-2'>
              <div className='h-2 w-2 rounded-full bg-status-blocked' />
              <span className='text-sm font-medium text-foreground'>Blocked</span>
            </div>
            <p className='text-xs text-muted-foreground'>
              Extended time on single issue, needs intervention
            </p>
          </div>
        </div>
      </div>

      {/* Smart Assistance */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h3 className='text-sm font-semibold text-foreground mb-2 flex items-center gap-2'>
          <Activity className='h-4 w-4 text-muted-foreground' />
          Smart Assistance
        </h3>
        <p className='text-sm text-muted-foreground'>
          When someone is stuck, the system identifies similar problems solved by teammates and suggests connections
        </p>
      </div>
    </div>
  )
}

export default TeamStatus
