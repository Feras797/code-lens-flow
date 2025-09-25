import { Clock, FileCode, GitBranch, MessageSquare, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'

const developers = [
  {
    id: 1,
    name: 'Sarah Chen',
    avatar: 'SC',
    status: 'flow',
    currentWork: 'JWT token implementation',
    file: 'auth/jwt.service.ts',
    duration: '45 min',
    messages: 12,
    commits: 3
  },
  {
    id: 2,
    name: 'John Martinez',
    avatar: 'JM',
    status: 'stuck',
    currentWork: 'Stripe webhook failing',
    file: 'payments/webhook.handler.ts',
    duration: '2.5 hrs',
    messages: 47,
    commits: 0
  },
  {
    id: 3,
    name: 'Mike Thompson',
    avatar: 'MT',
    status: 'slow',
    currentWork: 'Refactoring user table',
    file: 'database/schema.sql',
    duration: '1.2 hrs',
    messages: 23,
    commits: 1
  },
  {
    id: 4,
    name: 'Emma Davis',
    avatar: 'ED',
    status: 'flow',
    currentWork: 'Product CRUD endpoints',
    file: 'api/products.controller.ts',
    duration: '30 min',
    messages: 8,
    commits: 2
  },
  {
    id: 5,
    name: 'You',
    avatar: 'YU',
    status: 'flow',
    currentWork: 'Analytics dashboard',
    file: 'components/Analytics.tsx',
    duration: '1 hr',
    messages: 15,
    commits: 4
  }
]

function DeveloperStatus () {
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
      <CardContent>
        <TooltipProvider>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Developer</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Current Work</TableHead>
                <TableHead>File</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Activity</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {developers.map((dev) => (
                <TableRow
                  key={dev.id}
                  className={cn(
                    'hover:bg-background/50 transition-colors',
                    dev.status === 'stuck' && 'bg-status-blocked/5'
                  )}
                >
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Avatar className="h-8 w-8">
                        <AvatarFallback className={cn(
                          'text-xs font-medium border',
                          getStatusColor(dev.status)
                        )}>
                          {dev.avatar}
                        </AvatarFallback>
                      </Avatar>
                      <span className='text-sm font-medium text-foreground'>
                        {dev.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={getStatusVariant(dev.status)} className="gap-1.5">
                      <span className={cn(
                        'h-1.5 w-1.5 rounded-full',
                        getStatusDotColor(dev.status)
                      )} />
                      {dev.status.charAt(0).toUpperCase() + dev.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <span className='text-sm text-foreground truncate max-w-[200px] block'>
                          {dev.currentWork}
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>{dev.currentWork}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <Tooltip>
                      <TooltipTrigger>
                        <div className='flex items-center gap-2'>
                          <FileCode className='h-3 w-3 text-muted-foreground' />
                          <span className='text-sm text-muted-foreground font-mono truncate max-w-[150px]'>
                            {dev.file}
                          </span>
                        </div>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="font-mono">{dev.file}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-1'>
                      <Clock className='h-3 w-3 text-muted-foreground' />
                      <span className='text-sm text-muted-foreground'>
                        {dev.duration}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className='flex items-center gap-3'>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className='flex items-center gap-1'>
                            <MessageSquare className='h-3 w-3 text-muted-foreground' />
                            <span className='text-xs text-muted-foreground'>{dev.messages}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Messages sent</p>
                        </TooltipContent>
                      </Tooltip>
                      <Tooltip>
                        <TooltipTrigger>
                          <div className='flex items-center gap-1'>
                            <GitBranch className='h-3 w-3 text-muted-foreground' />
                            <span className='text-xs text-muted-foreground'>{dev.commits}</span>
                          </div>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Commits made</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TooltipProvider>
      </CardContent>
    </Card>
  )
}

export default DeveloperStatus
