import {
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  GitBranch,
  Zap,
  Activity
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import TeamActivityChart from '@/components/dashboard/TeamActivityChart'
import RecentCollisions from '@/components/dashboard/RecentCollisions'
import DeveloperStatus from '@/components/dashboard/DeveloperStatus'
import { MetricCard } from '@/components/dashboard/MetricCard'

function Dashboard () {

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Dashboard</h1>
          <p className='text-muted-foreground mt-1'>
            Real-time development team coordination
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <Badge variant="outline" className="gap-2 px-3 py-1.5 text-status-flow border-status-flow/30 bg-status-flow/5">
            <div className='h-2 w-2 rounded-full bg-status-flow animate-pulse' />
            Live Monitoring
          </Badge>
        </div>
      </div>

      {/* Metrics Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'>
        <MetricCard
          title="Active Developers"
          value={12}
          description="+2 from yesterday"
          trend={{ value: "+2", isPositive: true }}
          icon={<Users className='h-5 w-5' />}
          variant="success"
        />
        <MetricCard
          title="Active Collisions"
          value={3}
          description="2 resolved today"
          trend={{ value: "-1", isPositive: true }}
          icon={<AlertTriangle className='h-5 w-5' />}
          variant="warning"
        />
        <MetricCard
          title="Avg Resolution Time"
          value="1.8h"
          description="-23% this week"
          trend={{ value: "-23%", isPositive: true }}
          icon={<Clock className='h-5 w-5' />}
          variant="success"
        />
        <MetricCard
          title="Knowledge Transfers"
          value={47}
          description="+12 this week"
          trend={{ value: "+12", isPositive: true }}
          icon={<TrendingUp className='h-5 w-5' />}
          variant="success"
        />
      </div>

      {/* Quick Actions */}
      <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
        <Button
          variant="outline"
          className='h-auto p-4 justify-start gap-3 bg-primary/5 hover:bg-primary/10 border-primary/20 group'
        >
          <Zap className='h-5 w-5 text-primary group-hover:scale-110 transition-transform' />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>Resolve Collision</p>
            <p className='text-xs text-muted-foreground'>3 active conflicts</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className='h-auto p-4 justify-start gap-3 group'
        >
          <Activity className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>View Insights</p>
            <p className='text-xs text-muted-foreground'>Personal patterns</p>
          </div>
        </Button>
        <Button
          variant="outline"
          className='h-auto p-4 justify-start gap-3 group'
        >
          <GitBranch className='h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors' />
          <div className='text-left'>
            <p className='text-sm font-medium text-foreground'>Knowledge Base</p>
            <p className='text-xs text-muted-foreground'>47 solutions available</p>
          </div>
        </Button>
      </div>

      {/* Main Content Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Team Activity - Takes 2 columns */}
        <div className='lg:col-span-2'>
          <TeamActivityChart />
        </div>

        {/* Recent Collisions - Takes 1 column */}
        <div className='lg:col-span-1'>
          <RecentCollisions />
        </div>
      </div>

      {/* Developer Status Grid */}
      <DeveloperStatus />

    </div>
  )
}

export default Dashboard
