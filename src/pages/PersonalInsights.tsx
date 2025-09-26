import { TrendingUp, Zap, Calendar, BarChart3 } from 'lucide-react'
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { useEffect, useState } from 'react'

function PersonalInsights () {
  const [metrics, setMetrics] = useState<any | null>(null)
  const [patternData, setPatternData] = useState<Array<{name:string;count:number}>>([])

  useEffect(() => {
    fetch('http://127.0.0.1:8000/api/metrics/performance')
      .then(r => r.json())
      .then((m) => {
        setMetrics(m)
        const counts = m?.pattern_counts || {}
        const arr = Object.keys(counts).map(k => ({ name: k.replace(/_/g,' '), count: counts[k] }))
        setPatternData(arr)
      })
      .catch(() => {})
  }, [])
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

      {/* Summary (from metrics) */}
      {metrics && (
        <div className='bg-card border border-border rounded-xl p-6'>
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <Calendar className='h-5 w-5' />
            Personal Analytics Summary
          </h2>
          <div className='grid grid-cols-2 md:grid-cols-3 gap-3 text-sm'>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Total Prompts</div>
              <div className='text-foreground font-semibold'>{metrics.total_prompts}</div>
            </div>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Anti‑Pattern Rate</div>
              <div className='text-foreground font-semibold'>{(metrics.anti_pattern_rate*100).toFixed(1)}%</div>
            </div>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Context Usage</div>
              <div className='text-foreground font-semibold'>{(metrics.context_usage_rate*100).toFixed(1)}%</div>
            </div>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Avg Prompt Length</div>
              <div className='text-foreground font-semibold'>{metrics.avg_prompt_length}</div>
            </div>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Iteration Efficiency</div>
              <div className='text-foreground font-semibold'>{(metrics.estimated_iteration_efficiency*100).toFixed(1)}%</div>
            </div>
            <div className='bg-background border border-border rounded-lg p-3'>
              <div className='text-muted-foreground'>Revert Risk (proxy)</div>
              <div className='text-foreground font-semibold'>{(metrics.revert_risk_proxy*100).toFixed(1)}%</div>
            </div>
          </div>
        </div>
      )}

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

      {/* Pattern Recognition (from counts) */}
      {metrics && (
        <div className='bg-card border border-border rounded-xl p-6'>
          <h2 className='text-lg font-semibold text-foreground mb-4 flex items-center gap-2'>
            <Zap className='h-5 w-5' />
            Anti‑Pattern Frequencies
          </h2>
          <div className='h-64'>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={patternData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" hide={false} interval={0} angle={-15} height={50} textAnchor='end' />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  )
}

export default PersonalInsights
