import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

const data = [
  { time: '09:00', flow: 8, slow: 1, stuck: 1 },
  { time: '10:00', flow: 9, slow: 2, stuck: 1 },
  { time: '11:00', flow: 7, slow: 3, stuck: 2 },
  { time: '12:00', flow: 6, slow: 2, stuck: 1 },
  { time: '13:00', flow: 5, slow: 1, stuck: 1 },
  { time: '14:00', flow: 8, slow: 2, stuck: 1 },
  { time: '15:00', flow: 9, slow: 2, stuck: 1 },
  { time: '16:00', flow: 9, slow: 1, stuck: 1 },
  { time: '17:00', flow: 7, slow: 2, stuck: 0 }
]

function TeamActivityChart () {
  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>Team Activity Timeline</CardTitle>
          <div className='flex items-center gap-2'>
            <Badge variant="outline" className="text-status-flow border-status-flow/30">
              <div className='h-2 w-2 rounded-full bg-status-flow mr-1.5' />
              Flow State
            </Badge>
            <Badge variant="outline" className="text-status-slow border-status-slow/30">
              <div className='h-2 w-2 rounded-full bg-status-slow mr-1.5' />
              Slow Progress
            </Badge>
            <Badge variant="outline" className="text-status-blocked border-status-blocked/30">
              <div className='h-2 w-2 rounded-full bg-status-blocked mr-1.5' />
              Stuck
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width='100%' height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='hsl(var(--border))' />
          <XAxis 
            dataKey='time' 
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
          />
          <YAxis 
            stroke='hsl(var(--muted-foreground))'
            fontSize={12}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'hsl(var(--card))',
              border: '1px solid hsl(var(--border))',
              borderRadius: '8px'
            }}
            labelStyle={{ color: 'hsl(var(--foreground))' }}
          />
          <Line 
            type='monotone' 
            dataKey='flow' 
            stroke='hsl(var(--status-flow))' 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--status-flow))' }}
          />
          <Line 
            type='monotone' 
            dataKey='slow' 
            stroke='hsl(var(--status-slow))' 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--status-slow))' }}
          />
          <Line 
            type='monotone' 
            dataKey='stuck' 
            stroke='hsl(var(--status-blocked))' 
            strokeWidth={2}
            dot={{ fill: 'hsl(var(--status-blocked))' }}
          />
        </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

export default TeamActivityChart
