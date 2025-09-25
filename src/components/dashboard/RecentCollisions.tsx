import { AlertTriangle, FileCode, Users, Clock, ChevronRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'

const collisions = [
  {
    id: 1,
    type: 'file',
    severity: 'high',
    title: 'auth.js conflict',
    description: 'Sarah and Mike editing simultaneously',
    time: '2 min ago',
    affected: ['Sarah Chen', 'Mike Thompson']
  },
  {
    id: 2,
    type: 'feature',
    severity: 'medium',
    title: 'Payment flow overlap',
    description: 'John and Emma working on related features',
    time: '15 min ago',
    affected: ['John Martinez', 'Emma Davis']
  },
  {
    id: 3,
    type: 'dependency',
    severity: 'low',
    title: 'Schema dependency',
    description: 'Waiting for database migration',
    time: '1 hour ago',
    affected: ['You']
  }
]

function RecentCollisions () {
  const getSeverityVariant = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'low':
        return 'outline'
      default:
        return 'default'
    }
  }

  const getIconColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'text-status-blocked'
      case 'medium':
        return 'text-status-slow'
      case 'low':
        return 'text-primary'
      default:
        return 'text-muted-foreground'
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader className="pb-4">
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Recent Collisions</CardTitle>
          <Badge variant="outline" className="text-xs">
            Last 24h
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {collisions.map((collision) => (
          <div
            key={collision.id}
            className='group p-3 bg-background/50 border border-border rounded-lg hover:border-border-hover hover:bg-background/80 transition-all duration-200 cursor-pointer'
          >
            <div className='flex items-start gap-3'>
              <div className={cn(
                'p-2 rounded-lg bg-background border flex-shrink-0',
                getIconColor(collision.severity)
              )}>
                {collision.type === 'file' ? (
                  <FileCode className='h-4 w-4' />
                ) : collision.type === 'feature' ? (
                  <AlertTriangle className='h-4 w-4' />
                ) : (
                  <Clock className='h-4 w-4' />
                )}
              </div>
              <div className='flex-1 min-w-0 space-y-2'>
                <div className='flex items-center gap-2'>
                  <p className='text-sm font-medium text-foreground truncate'>
                    {collision.title}
                  </p>
                  <Badge variant={getSeverityVariant(collision.severity)} className="text-xs">
                    {collision.severity}
                  </Badge>
                </div>
                <p className='text-xs text-muted-foreground'>
                  {collision.description}
                </p>
                <div className='flex items-center justify-between'>
                  <div className='flex items-center gap-1'>
                    {collision.affected.slice(0, 2).map((person, index) => (
                      <Avatar key={index} className="h-5 w-5">
                        <AvatarFallback className="text-xs">
                          {person.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                    ))}
                    {collision.affected.length > 2 && (
                      <span className='text-xs text-muted-foreground ml-1'>
                        +{collision.affected.length - 2}
                      </span>
                    )}
                  </div>
                  <div className='flex items-center gap-2'>
                    <span className='text-xs text-muted-foreground'>
                      {collision.time}
                    </span>
                    <ChevronRight className='h-3 w-3 text-muted-foreground group-hover:text-foreground transition-colors' />
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
        <Button variant="ghost" className="w-full mt-2 justify-center">
          View All Collisions
          <ChevronRight className="ml-2 h-4 w-4" />
        </Button>
      </CardContent>
    </Card>
  )
}

export default RecentCollisions
