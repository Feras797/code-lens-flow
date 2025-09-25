import { TrendingUp, Clock, Target, Zap, Calendar, BarChart3 } from 'lucide-react'
import { Line, LineChart, Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

function PersonalInsights () {
  const focusData = [
    { week: 'Week 1', progress: 100, label: 'Basic setup and components' },
    { week: 'Week 2', progress: 100, label: 'Feature implementation' },
    { week: 'Week 3', progress: 85, label: 'State management and optimization' },
    { week: 'Current', progress: 45, label: 'Polish and scale' }
  ]

  const timeData = [
    { category: 'Frontend Components', hours: 12, percentage: 40 },
    { category: 'State Management', hours: 8, percentage: 27 },
    { category: 'API Integration', hours: 6, percentage: 20 },
    { category: 'Testing & Debug', hours: 4, percentage: 13 }
  ]

  const patterns = [
    { icon: 'Sun', title: 'Morning Frontend Focus', desc: 'You typically spend mornings on frontend tasks with 40% higher productivity' },
    { icon: 'Zap', title: 'Productivity Peak', desc: 'Your productivity peaks between 2-4 PM with fastest problem resolution' },
    { icon: 'RefreshCw', title: 'Context Switching Cost', desc: 'You lose 25 minutes of productivity when switching between frontend and backend tasks' }
  ]

  return (
    <div className='p-6 space-y-6'>
      {/* Header */}
      <div>
        <h1 className='text-3xl font-bold text-foreground'>Personal Development Insights</h1>
        <p className='text-muted-foreground mt-1'>
          Transform chat history into actionable understanding of your coding journey
        </p>
      </div>

      {/* Today's Recap */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <Calendar className='h-5 w-5' />
          Today's Development Recap
        </h2>
        <div className='space-y-4'>
          <div>
            <h3 className='text-sm font-medium text-foreground mb-2'>Morning</h3>
            <p className='text-sm text-muted-foreground'>
              Completed user profile component with React.memo optimization
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-foreground mb-2'>Afternoon</h3>
            <p className='text-sm text-muted-foreground'>
              Building admin dashboard, switched Chart.js → Recharts
            </p>
          </div>
          <div>
            <h3 className='text-sm font-medium text-foreground mb-2'>Key Decisions</h3>
            <ul className='space-y-1'>
              <li className='text-sm text-muted-foreground'>• Chose Context over prop drilling for state management</li>
              <li className='text-sm text-muted-foreground'>• Deferred complex filtering to backend</li>
            </ul>
          </div>
          <div>
            <h3 className='text-sm font-medium text-red-500 mb-2'>Abandoned</h3>
            <p className='text-sm text-muted-foreground'>
              Custom chart solution (too time-consuming)
            </p>
          </div>
        </div>
      </div>

      {/* Project Focus Evolution */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <TrendingUp className='h-5 w-5' />
          Project Focus Evolution
        </h2>
        <div className='space-y-3'>
          {focusData.map((week, index) => (
            <div key={index}>
              <div className='flex items-center justify-between mb-1'>
                <span className='text-sm font-medium text-foreground'>{week.week}</span>
                <span className='text-xs text-muted-foreground'>{week.label}</span>
                <span className='text-sm text-primary'>{week.progress}%</span>
              </div>
              <div className='h-2 bg-background rounded-full overflow-hidden'>
                <div 
                  className='h-full bg-primary rounded-full transition-all duration-500'
                  style={{ width: `${week.progress}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Time Distribution */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <BarChart3 className='h-5 w-5' />
          Time Distribution This Week
        </h2>
        <div className='space-y-3'>
          {timeData.map((item, index) => (
            <div key={index} className='flex items-center justify-between'>
              <div className='flex-1'>
                <div className='flex items-center justify-between mb-1'>
                  <span className='text-sm text-foreground'>{item.category}</span>
                  <span className='text-sm text-muted-foreground'>{item.hours}h ({item.percentage}%)</span>
                </div>
                <div className='h-2 bg-background rounded-full overflow-hidden'>
                  <div 
                    className='h-full bg-gradient-to-r from-primary to-primary/60 rounded-full'
                    style={{ width: `${item.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pattern Recognition */}
      <div className='bg-card border border-border rounded-xl p-6'>
        <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
          <Zap className='h-5 w-5' />
          Pattern Recognition
        </h2>
        <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
          {patterns.map((pattern, index) => (
            <div key={index} className='bg-background/50 rounded-lg p-4'>
              <div className='text-2xl mb-2'>{pattern.icon}</div>
              <h3 className='text-sm font-medium text-foreground mb-1'>{pattern.title}</h3>
              <p className='text-xs text-muted-foreground'>{pattern.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default PersonalInsights
