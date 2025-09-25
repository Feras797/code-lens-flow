import { useState } from 'react'
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import { CircleIcon, Activity } from 'lucide-react'

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

// Mock data for focus topics
const focusTopics = [
  { id: 1, topic: 'Authentication', mentions: 45, percentage: 25, color: 'hsl(var(--primary))' },
  { id: 2, topic: 'Database', mentions: 38, percentage: 21, color: 'hsl(var(--status-flow))' },
  { id: 3, topic: 'API Design', mentions: 32, percentage: 18, color: 'hsl(var(--status-slow))' },
  { id: 4, topic: 'React Components', mentions: 28, percentage: 15, color: '#8b5cf6' },
  { id: 5, topic: 'Testing', mentions: 20, percentage: 11, color: '#ec4899' },
  { id: 6, topic: 'Performance', mentions: 15, percentage: 8, color: '#f59e0b' },
  { id: 7, topic: 'DevOps', mentions: 4, percentage: 2, color: '#6366f1' }
]

function TeamActivityChart () {
  const [viewMode, setViewMode] = useState<'bubbles' | 'timeline'>('bubbles')
  // Calculate bubble sizes and positions
  const maxMentions = Math.max(...focusTopics.map(t => t.mentions))
  const minMentions = Math.min(...focusTopics.map(t => t.mentions))
  
  // Function to calculate bubble radius based on mentions
  const calculateRadius = (mentions: number) => {
    const minRadius = 30
    const maxRadius = 80
    const normalizedValue = (mentions - minMentions) / (maxMentions - minMentions)
    return minRadius + (normalizedValue * (maxRadius - minRadius))
  }

  // Position bubbles with collision detection to prevent overlapping
  const positionBubbles = () => {
    const centerX = 300
    const centerY = 150
    const positions: Array<{x: number, y: number, radius: number, topic: typeof focusTopics[0]}> = []
    const margin = 10 // Minimum space between bubbles

    // Helper function to check if two circles overlap
    const circlesOverlap = (x1: number, y1: number, r1: number, x2: number, y2: number, r2: number) => {
      const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2)
      return distance < (r1 + r2 + margin)
    }

    // Helper function to find a valid position for a bubble
    const findValidPosition = (radius: number, preferredX: number, preferredY: number) => {
      let x = preferredX
      let y = preferredY
      let attempts = 0
      const maxAttempts = 100

      while (attempts < maxAttempts) {
        let hasCollision = false

        // Check collision with existing bubbles
        for (const pos of positions) {
          if (circlesOverlap(x, y, radius, pos.x, pos.y, pos.radius)) {
            hasCollision = true
            break
          }
        }

        // Check if bubble stays within bounds
        const boundaryMargin = radius + 20
        if (x - radius < boundaryMargin || x + radius > 600 - boundaryMargin ||
            y - radius < boundaryMargin || y + radius > 300 - boundaryMargin) {
          hasCollision = true
        }

        if (!hasCollision) {
          return { x, y }
        }

        // Try a new position using spiral pattern
        const angle = (attempts * 0.5) % (2 * Math.PI)
        const spiralRadius = 20 + (attempts * 8)
        x = centerX + Math.cos(angle) * spiralRadius
        y = centerY + Math.sin(angle) * spiralRadius * 0.7 // Flatten vertically

        attempts++
      }

      // Fallback to original position if no valid position found
      return { x: preferredX, y: preferredY }
    }

    // Sort topics by size (largest first) for better packing
    const sortedTopics = [...focusTopics].sort((a, b) => b.mentions - a.mentions)

    sortedTopics.forEach((topic, index) => {
      const radius = calculateRadius(topic.mentions)

      // Calculate preferred position using circular layout
      const angle = (index / sortedTopics.length) * 2 * Math.PI
      const baseDistance = 80 + radius // Adjust distance based on bubble size
      const preferredX = centerX + Math.cos(angle) * baseDistance
      const preferredY = centerY + Math.sin(angle) * baseDistance * 0.6

      // Find valid position without overlaps
      const { x, y } = findValidPosition(radius, preferredX, preferredY)

      positions.push({
        x,
        y,
        radius,
        topic
      })
    })

    return positions
  }

  const bubblePositions = positionBubbles()

  return (
    <Card className="transition-all duration-200 hover:shadow-lg">
      <CardHeader>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg'>
            {viewMode === 'bubbles' ? 'Current Focus Areas' : 'Team Activity Timeline'}
          </CardTitle>
          <div className='flex items-center gap-4'>
            <ToggleGroup 
              type="single" 
              value={viewMode} 
              onValueChange={(value) => value && setViewMode(value as 'bubbles' | 'timeline')}
              className='bg-background/50 p-1 rounded-lg border border-border'
            >
              <ToggleGroupItem value="bubbles" aria-label="Focus view" size="sm">
                <CircleIcon className="h-4 w-4 mr-2" />
                Focus
              </ToggleGroupItem>
              <ToggleGroupItem value="timeline" aria-label="Timeline view" size="sm">
                <Activity className="h-4 w-4 mr-2" />
                Timeline
              </ToggleGroupItem>
            </ToggleGroup>
            
            {viewMode === 'timeline' && (
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
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'bubbles' ? (
          <div className='relative w-full h-[300px] overflow-hidden'>
            <svg width='100%' height='100%' viewBox='0 0 600 300' className='select-none'>
              {/* Render bubbles */}
              {bubblePositions.map((bubble, index) => (
                <g key={bubble.topic.id} className='cursor-pointer group'>
                  {/* Shadow/glow effect */}
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius + 2}
                    fill={bubble.topic.color}
                    opacity='0.1'
                    className='transition-all duration-300 group-hover:opacity-20'
                  />
                  
                  {/* Main bubble */}
                  <circle
                    cx={bubble.x}
                    cy={bubble.y}
                    r={bubble.radius}
                    fill={bubble.topic.color}
                    opacity='0.8'
                    className='transition-all duration-300 group-hover:opacity-100 group-hover:scale-110 origin-center'
                    style={{ transformOrigin: `${bubble.x}px ${bubble.y}px` }}
                  />
                  
                  {/* Topic label */}
                  <text
                    x={bubble.x}
                    y={bubble.y - 5}
                    textAnchor='middle'
                    className='fill-white font-medium text-sm pointer-events-none'
                  >
                    {bubble.topic.topic}
                  </text>
                  
                  {/* Metrics */}
                  <text
                    x={bubble.x}
                    y={bubble.y + 10}
                    textAnchor='middle'
                    className='fill-white/90 text-xs pointer-events-none'
                  >
                    {bubble.topic.mentions} mentions
                  </text>
                  
                  {/* Percentage */}
                  <text
                    x={bubble.x}
                    y={bubble.y + 24}
                    textAnchor='middle'
                    className='fill-white/70 text-xs font-light pointer-events-none'
                  >
                    {bubble.topic.percentage}%
                  </text>
                </g>
              ))}
              
              {/* Add connecting lines for related topics (optional visual enhancement) */}
              {bubblePositions.slice(0, 3).map((bubble1, i) => 
                bubblePositions.slice(i + 1, 4).map((bubble2, j) => (
                  <line
                    key={`${i}-${j}`}
                    x1={bubble1.x}
                    y1={bubble1.y}
                    x2={bubble2.x}
                    y2={bubble2.y}
                    stroke='hsl(var(--muted-foreground))'
                    strokeWidth='0.5'
                    opacity='0.1'
                    strokeDasharray='2,4'
                  />
                ))
              )}
            </svg>
            
            {/* Legend at the bottom */}
            <div className='absolute bottom-2 left-2 right-2 flex items-center justify-center gap-4'>
              <div className='text-xs text-muted-foreground flex items-center gap-1'>
                <span className='font-medium'>Size:</span> Frequency of discussion
              </div>
              <div className='text-xs text-muted-foreground flex items-center gap-1'>
                <span className='font-medium'>Color:</span> Topic category
              </div>
            </div>
          </div>
        ) : (
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
        )}
      </CardContent>
    </Card>
  )
}

export default TeamActivityChart
